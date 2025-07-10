"use client";
import { addMemberToWorkspace } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const AddMemberFormSchema = z.object({
  email: z.email(),
  role: z.string(),
});

type OnboardData = z.infer<typeof AddMemberFormSchema>;

export default function AddMemberForm({
  currentUserId,
  workspaceId,
  currentWorkspaceMembers,
}: {
  currentUserId: string;
  workspaceId: string;
  currentWorkspaceMembers: any[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const form = useForm<OnboardData>({
    resolver: zodResolver(AddMemberFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });
  const watchedEmail = form.watch("email");
  const debouncedEmail = useDebounce(watchedEmail, 500);
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedEmail || debouncedEmail.length < 3) {
        setSuggestions([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?email=${debouncedEmail}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedEmail]);
  const onSubmit = async (data: OnboardData) => {
    setSubmitting(true);
    try {
      const res = await addMemberToWorkspace(
        currentUserId,
        data.email,
        workspaceId,
        data.role
      );
      if (res.status === 200) {
        toast.success("Member added to the workspace");
        form.reset();
        router.refresh();
      } else {
        toast.error("Failed to save data");
      }
    } catch {
      toast.error("Unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };
  const watchedRole = form.watch("role");

  const existingMemberEmails = new Set(
    currentWorkspaceMembers.map((m) => m.userEmail.toLowerCase())
  );
  const currentUserMembership = currentWorkspaceMembers.find(
    (m) => m.userId === currentUserId
  );
  const isCurrentUserAdmin = currentUserMembership?.roleName === "admin";
  const isSubmitDisabled =
    submitting ||
    !watchedEmail?.trim() ||
    !watchedRole?.trim() ||
    !isCurrentUserAdmin;
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            Add Member
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-background/10 p-0">
          <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-3xl border-none">
            <CardHeader>
              <CardTitle className="text-2xl">
                Add Member to Workspace
              </CardTitle>
              <CardDescription>Search member by email</CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-satoshi text-sm">
                          Email
                        </FormLabel>
                        <FormControl className="grid grid-cols-3 h-8 items-center">
                          <Input
                            disabled={!isCurrentUserAdmin}
                            placeholder="john.doe@xyz.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {searching && (
                    <Skeleton className="h-10 w-full max-w-sm mx-auto" />
                  )}
                  {suggestions.length > 0 && (
                    <div className="mt-1 w-full border rounded shadow">
                      {suggestions.map((s) => {
                        const isAlreadyMember = existingMemberEmails.has(
                          s.email.toLowerCase()
                        );
                        return (
                          <div
                            key={s.id}
                            className={`px-3 py-1 flex flex-col ${
                              isAlreadyMember
                                ? "text-muted-foreground cursor-not-allowed bg-background"
                                : "cursor-pointer hover:bg-accent"
                            }`}
                            onClick={() => {
                              if (!isAlreadyMember) {
                                form.setValue("email", s.email);
                                setSuggestions([]);
                              }
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <span>{s.email}</span>
                              {isAlreadyMember && (
                                <span className="text-xs text-green-500 ml-2">
                                  Already a member
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-primary/70">
                              {s.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-satoshi text-sm">
                          Role
                        </FormLabel>
                        <FormControl className="grid grid-cols-3 h-8 items-center">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Roles</SelectLabel>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="w-full"
                  >
                    {submitting ? "Adding Member..." : "Add Member"}
                  </Button>
                  {!isCurrentUserAdmin && (
                    <p className="text-xs text-green-500 text-center">
                      Only admin can add member
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
