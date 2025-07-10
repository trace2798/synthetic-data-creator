"use client";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";

export type Workspace = {
  workspaceId: string;
  workspaceTitle: string;
  roleName: string;
};
export function SelectWorkspace({ workspaces }: { workspaces: Workspace[] }) {
  const params = useParams();
  const router = useRouter();
  const [value, setValue] = React.useState(params.workspaceId ?? "");
  return (
    <Select
      value={value as string}
      onValueChange={(val) => {
        setValue(val);
        router.push(`/dashboard/${val}`);
      }}
    >
      <SelectTrigger size="sm" className="w-[150px] hover:cursor-pointer">
        <SelectValue placeholder="Select workspace" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Workspaces</SelectLabel>
          {workspaces.map((workspace) => (
            <SelectItem
              key={workspace.workspaceId}
              value={workspace.workspaceId}
              className="hover:cursor-pointer"
            >
              {workspace.workspaceTitle}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
