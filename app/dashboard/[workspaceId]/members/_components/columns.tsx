"use client";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export type WorkspaceMembers = {
  membershipId: string;
  roleName: string;
  userEmail: string;
  membershipCreated: Date;
};

export const columns: ColumnDef<WorkspaceMembers>[] = [
  {
    accessorKey: "userEmail",
    header: () => <div className="text-center">Email</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("userEmail")}</div>;
    },
  },
  {
    accessorKey: "roleName",

    header: () => <div className="text-center">Role</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("roleName")}</div>;
    },
  },
  {
    accessorKey: "membershipCreated",
    header: () => <div className="text-center">Member Since</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {format(new Date(row.getValue("membershipCreated")), "MMMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const membershipId = row.original.membershipId;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(membershipId)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
