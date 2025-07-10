"use client";
import { updateWorkspaceMemberRole } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { toast } from "sonner";

interface ChangeRoleFormDialogProps {
  currentUserId: string;
  currentUserRoleName: string;
  workspaceId: string;
  membershipId: string;
  userEmail: string;
  currentRole: string;
}

const ChangeRoleFormDialog: FC<ChangeRoleFormDialogProps> = ({
  currentUserId,
  currentUserRoleName,
  workspaceId,
  membershipId,
  userEmail,
  currentRole,
}) => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    setSaving(true);
    try {
      const res = await updateWorkspaceMemberRole(membershipId, selectedRole);
      if (res.status === 200) {
        toast.success("Role updated successfully");
        router.refresh();
      } else {
        toast.error(res.message ?? "Failed to update role");
      }
    } catch (error) {
      toast.error("Unexpected error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full"
            disabled={currentUserRoleName !== "admin"}
          >
            Change Role
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Change the role for the selected workspace member
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || currentUserRoleName !== "admin"}
            >
              {saving ? "Changing Role..." : "Change Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChangeRoleFormDialog;
