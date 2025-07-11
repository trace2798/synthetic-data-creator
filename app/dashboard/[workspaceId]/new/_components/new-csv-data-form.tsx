"use client";
import { saveGeneratedCSVFiles, updateSyntheticDataCSV } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { useRouter } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FileUploader } from "./file-uploader";

const CreateDataSchema = z.object({
  domain: z.string(),
  resultStyle: z.string(),
  inputType: z.string(),
  s3Key: z.string(),
  instruction: z.string(),
});

type OnboardData = z.infer<typeof CreateDataSchema>;

type NewCSVDataFormProps = {
  userId: string;
  workspaceId: string;
  dataFormId: string;
  defaultValues?: {
    domain: string;
    resultStyle: string;
    inputType: string;
    s3Key?: string;
    instruction?: string;
  };
};

const NewCSVDataForm: FC<NewCSVDataFormProps> = ({
  userId,
  workspaceId,
  dataFormId,
  defaultValues,
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const form = useForm<OnboardData>({
    resolver: zodResolver(CreateDataSchema),
    defaultValues: defaultValues ?? {
      domain: "",
      resultStyle: "schema",
      inputType: "csv",
      s3Key: "",
      instruction: "",
    },
  });

  const inputType = form.watch("inputType");
  const allValues = useWatch({ control: form.control });
  const debouncedUpdate = useRef(
    debounce(async (values: OnboardData) => {
      try {
        await updateSyntheticDataCSV(dataFormId, userId, workspaceId, values);
        toast.success("UPDATED");
      } catch (err) {
        console.error("Auto‐save failed", err);
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (form.formState.isDirty) {
      debouncedUpdate(allValues as OnboardData);
    }
  }, [allValues, debouncedUpdate, form.formState.isDirty]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      // const res = await fetch("http://localhost:3001/generate-csv", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     dataFormId,
      //     workspaceId,
      //     domain: values.domain,
      //     s3Key: values.s3Key,
      //     instruction: values.instruction,
      //   }),
      // });
      const res = await fetch("/api/generate-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataFormId,
          workspaceId,
          domain: values.domain,
          s3Key: values.s3Key,
          instruction: values.instruction || "",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Unknown error");
      }

      const result = await res.json();
      console.log("RESULTS", result);
      if (result.csvKey) {
        await saveGeneratedCSVFiles(dataFormId, [
          { s3Key: result.csvKey, format: "csv" },
        ]);
      }

      toast.success("Data generated!");
      router.refresh();
    } catch (error: any) {
      console.error("Generate‐data error", error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  });
  const s3Key = form.watch("s3Key");

  return (
    <>
      <div>
        <Card className="w-full mx-auto border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Generate Data Form</CardTitle>
            <CardDescription>Form to generate Synthetic Data</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <FormField
                    control={form.control}
                    name="inputType"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-satoshi text-base">
                          Input Type
                        </FormLabel>
                        <FormControl className="grid grid-cols-3 h-8 items-center">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full max-w-[200px]">
                              <SelectValue placeholder="pdf" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-satoshi text-base">
                          Domain
                        </FormLabel>
                        <FormControl className="grid grid-cols-3 h-8 items-center">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full max-w-[200px]">
                              <SelectValue placeholder="Domain" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="healthcare">
                                Healthcare
                              </SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="resultStyle"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-satoshi text-base">
                          Result Style
                        </FormLabel>
                        <FormControl className="grid grid-cols-3 h-8 items-center">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full max-w-[200px]">
                              <SelectValue placeholder="Result Style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="schema">Schema</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {["pdf", "txt", "csv"].includes(inputType) && (
                  <Controller
                    control={form.control}
                    name="s3Key"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          {!field.value ? "File Uploader" : "S3 Key"}
                        </FormLabel>
                        <FormControl>
                          {!field.value ? (
                            <FileUploader
                              userId={userId}
                              workspaceId={workspaceId}
                              onUploadComplete={(keys) => {
                                field.onChange(keys[0] || "");
                              }}
                            />
                          ) : (
                            <p className="text-sm text-green-600">
                              <Input disabled {...field} />
                            </p>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="instruction"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-satoshi text-base">
                        Instruction
                      </FormLabel>
                      <FormControl className="grid grid-cols-3 h-8 items-center">
                        <Textarea placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Generating Data..." : "Generate Data"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NewCSVDataForm;
