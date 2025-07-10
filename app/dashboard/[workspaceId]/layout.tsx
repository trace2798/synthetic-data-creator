import { db } from "@/db";
import { role, workspace, workspaceMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SelectWorkspace } from "./_components/select-workspace";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WorkspaceIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
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
  return (
    <div className="">
      <div className="absolute w-full top-16 h-12 border-b flex flex-row justify-between items-center">
        <div className="px-[5vw] flex w-full justify-between">
          <SelectWorkspace workspaces={memberships} />
          <Link href={`/dashboard/${workspaceId}/members`}>
            <Button size={"sm"} variant={"outline"} className="">
              Members
            </Button>
          </Link>
        </div>
      </div>
      <section className="">{children}</section>
    </div>
  );
}
