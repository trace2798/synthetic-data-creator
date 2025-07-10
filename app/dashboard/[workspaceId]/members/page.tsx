import { FC } from "react";
import { columns, WorkspaceMembers } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { Separator } from "@/components/ui/separator";
import AddMemberForm from "./_components/add-member-form";
import { db } from "@/db";
import { role, user, workspace, workspaceMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ workspaceId: string }>;
}

const Page: FC<PageProps> = async ({ params }: PageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  const { workspaceId } = await params;

  const currentWorkspaceMembers = await db
    .select({
      membershipId: workspaceMembers.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
      roleName: role.name,
      membershipCreated: workspaceMembers.createdAt,
    })
    .from(workspaceMembers)
    .innerJoin(user, eq(workspaceMembers.userId, user.id))
    .innerJoin(role, eq(workspaceMembers.roleId, role.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId));
  console.log("WORKSPACE MEMBERS:", currentWorkspaceMembers);
  const data = currentWorkspaceMembers;

  const currentUserMembership = currentWorkspaceMembers.find(
    (m) => m.userId === session.user.id
  );

  const currentUserRoleName = currentUserMembership?.roleName ?? "viewer";
  const currentUserId = session.user.id;
  return (
    <>
      <div className="absolute top-32 w-full">
        <div className="flex flex-col space-y-10 w-full max-w-6xl mx-auto min-h-[50vh] ">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl">Current Workspace Members</h1>
              <AddMemberForm
                currentUserId={session.user.id}
                workspaceId={workspaceId}
                currentWorkspaceMembers={currentWorkspaceMembers}
              />
            </div>
            <Separator />
          </div>

          <DataTable
            data={data as WorkspaceMembers[]}
            currentUserId={currentUserId}
            currentUserRoleName={currentUserRoleName}
            workspaceId={workspaceId}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
