"use client";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FileUploader } from "./file-uploader";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import debounce from "lodash.debounce";
import { saveGeneratedFiles, updateSyntheticData } from "@/app/actions";
import { toast } from "sonner";

const CreateDataSchema = z.object({
  domain: z.string(),
  resultStyle: z.string(),
  inputType: z.string(),
  youtubeUrl: z.string(),
  s3Key: z.string(),
  instruction: z.string(),
});

type OnboardData = z.infer<typeof CreateDataSchema>;

type NewDataFormProps = {
  userId: string;
  workspaceId: string;
  dataFormId: string;
  defaultValues?: {
    domain: string;
    resultStyle: string;
    inputType: string;
    youtubeUrl?: string;
    s3Key?: string;
    instruction?: string;
  };
};

const NewDataForm: FC<NewDataFormProps> = ({
  userId,
  workspaceId,
  dataFormId,
  defaultValues,
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const [generatedData, setGeneratedData] = useState<string | null>(null);
  const form = useForm<OnboardData>({
    resolver: zodResolver(CreateDataSchema),
    defaultValues: defaultValues ?? {
      domain: "",
      resultStyle: "",
      inputType: "",
      youtubeUrl: "",
      s3Key: "",
      instruction: "",
    },
  });

  const inputType = form.watch("inputType");
  const allValues = useWatch({ control: form.control });
  const debouncedUpdate = useRef(
    debounce(async (values: OnboardData) => {
      try {
        await updateSyntheticData(dataFormId, userId, workspaceId, values);
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
      // const res = await fetch("http://localhost:3001/generate-data", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     dataFormId,
      //     userId,
      //     workspaceId,
      //     domain: values.domain,
      //     resultStyle: values.resultStyle,
      //     youtubeUrl: values.youtubeUrl,
      //     s3Key: values.s3Key,
      //     instruction: values.instruction,
      //   }),
      // });
      const res = await fetch("/api/generate-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataFormId,
          userId,
          workspaceId,
          domain: values.domain,
          resultStyle: values.resultStyle,
          youtubeUrl: values.youtubeUrl,
          s3Key: values.s3Key,
          instruction: values.instruction,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Unknown error");
      }

      const result = await res.json();
      console.log("RESULTS", result);
      if (result.jsonKey && result.jsonlKey) {
        await saveGeneratedFiles(dataFormId, [
          { s3Key: result.jsonKey, format: "json" },
          { s3Key: result.jsonlKey, format: "jsonl" },
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
              <form
                // onSubmit={form.handleSubmit(onSubmit)}
                onSubmit={onSubmit}
                className="flex flex-col gap-10"
              >
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
                              <SelectItem value="pdf">PDF</SelectItem>
                              {/* <SelectItem value="txt">TXT</SelectItem> */}
                              <SelectItem value="youtube">YouTube</SelectItem>
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
                              <SelectItem value="generic">Generic</SelectItem>
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
                              <SelectItem value="qa">
                                Question Answer
                              </SelectItem>
                              <SelectItem value="cot">
                                Chain of Thought
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {["pdf", "txt"].includes(inputType) && (
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

                {inputType === "youtube" && (
                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-satoshi text-base">
                          Youtube Link
                        </FormLabel>
                        <FormControl className="grid grid-cols-3 h-8 items-center">
                          <Input placeholder="" {...field} />
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

export default NewDataForm;
