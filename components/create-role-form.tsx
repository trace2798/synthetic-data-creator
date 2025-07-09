"use client";

import { createRole } from "@/app/actions";
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

const CreateRoleSchema = z.object({
  name: z.string(),
});

type OnboardData = z.infer<typeof CreateRoleSchema>;

export default function CreateRoleForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OnboardData>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: OnboardData) => {
    setSubmitting(true);
    try {
      const res = await createRole(data.name);
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

  return (
    <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-3xl border-none">
      <CardHeader>
        <CardTitle className="text-2xl">Create Role</CardTitle>
        <CardDescription>Form to create role</CardDescription>
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
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
