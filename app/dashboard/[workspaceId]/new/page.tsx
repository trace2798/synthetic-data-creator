import { db } from "@/db";
import { role, workspaceMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewDataForm from "./_components/new-data-form";

interface PageProps {
  params: Promise<{ workspaceId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  const { workspaceId } = await params;
  const workspaceInfo = await db.query.workspace.findFirst({
    where: (w, { eq }) => eq(w.id, workspaceId),
  });
  console.log("WORKSPACE INFO", workspaceInfo);

  const workspaceMember = await db
    .select({
      roleName: role.name,
    })
    .from(workspaceMembers)
    .innerJoin(role, eq(role.id, workspaceMembers.roleId))
    .where(
      and(
        eq(workspaceMembers.userId, session.user.id),
        eq(workspaceMembers.workspaceId, workspaceId)
      )
    );
  console.log("WORKSPACE MEMBERSHIP", workspaceMember);
  if (workspaceMember.length === 0) {
    redirect("/dashboard");
  }
  // const loader = YoutubeLoader.createFromUrl(
  //   "https://www.youtube.com/watch?v=H8zTwiYXxDM",
  //   {
  //     language: "en",
  //     addVideoInfo: true,
  //   }
  // );
  // https://www.youtube.com/watch?v=0OaDyjB9Ib8
  // https://www.youtube.com/watch?v=H8zTwiYXxDM
  // const docs = await loader.load();

  // console.log("YOUTUBE", docs);
  return (
    <>
      <div className="absolute top-32 w-full overflow-x-hidden">
        <div className="flex flex-col w-full min-h-[60vh] space-y-10 max-w-6xl mx-auto ">
          {/* <NewDataForm workspaceId={workspaceId} userId={session.user.id}  /> */}
        </div>
      </div>
    </>
  );
};

export default Page;
