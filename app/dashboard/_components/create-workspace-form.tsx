"use client";

import { createRole, createWorkspace } from "@/app/actions";
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

import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { generate } from "random-words";
import { Textarea } from "@/components/ui/textarea";
const CreateWorkspaceSchema = z.object({
  name: z.string(),
  description: z.string(),
});

type OnboardData = z.infer<typeof CreateWorkspaceSchema>;

export default function CreateWorkspaceForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OnboardData>({
    resolver: zodResolver(CreateWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: OnboardData) => {
    setSubmitting(true);
    try {
      const res = await createWorkspace(userId, data.name, data.description);
      if (res.status === 200) {
        toast.success("Profile and initial weight saved!");
        form.reset();
        router.push("/dashboard");
      } else {
        toast.error("Failed to save data");
      }
    } catch {
      toast.error("Unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoWork = () => {
    const word = generate();
    form.setValue("name", word as string);
  };

  return (
    <Card className="w-full max-w-md mx-auto  border-none">
      <CardHeader>
        <CardTitle className="text-2xl">Create Workspace</CardTitle>
        <CardDescription>Create a workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-satoshi text-base">Name</FormLabel>
                  <FormControl className="grid grid-cols-3 h-8 items-center">
                    <Input placeholder="admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              onClick={() => handleAutoWork()}
              variant={"outline"}
              disabled={submitting}
              type="button"
              className="w-full max-w-[200px] hover:cursor-pointer"
            >
              Get Random Word
            </Button>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-satoshi text-base">
                    Description
                  </FormLabel>
                  <FormControl className="grid grid-cols-3 h-8 items-center">
                    <Textarea placeholder="admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating Workspace..." : "Create Workspace"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
