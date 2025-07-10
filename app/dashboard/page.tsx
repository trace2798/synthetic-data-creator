import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { role, workspace, workspaceMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreateWorkspaceDialog } from "./_components/create-workspace-dialog";
import CreateWorkspaceForm from "./_components/create-workspace-form";

const Page = async ({}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  const memberships = await db
    .select({
      workspaceId: workspace.id,
      workspaceTitle: workspace.title,
      roleName: role.name,
    })
    .from(workspaceMembers)
    .innerJoin(workspace, eq(workspaceMembers.workspaceId, workspace.id))
    .innerJoin(role, eq(workspaceMembers.roleId, role.id))
    .where(eq(workspaceMembers.userId, session.user.id));
  console.log("MEMBERSHIPS:", memberships);
  return (
    <>
      {memberships.length === 0 ? (
        <div>
          <CreateWorkspaceForm userId={session.user.id} />
        </div>
      ) : (
        <div className="flex items-center justify-center space-y-5">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Your Workspaces</CardTitle>
              <CardDescription>
                List of workspaces you have created
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 hover:cursor-pointer ">
              {memberships.map((workspace) => (
                <a
                  key={workspace.workspaceId}
                  href={`/dashboard/${workspace.workspaceId}`}
                  className="flex flex-col border p-3 rounded-md hover:bg-accent"
                >
                  <div className="flex flex-col">
                    <div className="">{workspace.workspaceTitle}</div>
                    <p className="text-xs text-indigo-400">
                      {workspace.roleName}
                    </p>
                  </div>
                </a>
              ))}
            </CardContent>
            <CardFooter className="w-full flex justify-center">
              <CreateWorkspaceDialog currentUserId={session.user.id} />
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default Page;
