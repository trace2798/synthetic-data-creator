import { db } from "@/db";
import { role, syntheticDataContent, workspaceMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewDataForm from "../new/_components/new-data-form";

interface PageProps {
  params: Promise<{ workspaceId: string; dataFormId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  const { workspaceId, dataFormId } = await params;
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
  const formData = await db
    .select({
      id: syntheticDataContent.id,
      domain: syntheticDataContent.domain,
      resultStyle: syntheticDataContent.resultStyle,
      inputType: syntheticDataContent.inputType,
      youtubeUrl: syntheticDataContent.youtubeUrl,
      s3Key: syntheticDataContent.s3Key,
      instruction: syntheticDataContent.instruction,
    })
    .from(syntheticDataContent)
    .where(eq(syntheticDataContent.id, dataFormId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!formData) {
    return <p>Form not found.</p>;
  }

  return (
    <>
      <div className="absolute top-32 w-full overflow-x-hidden">
        <div className="flex flex-col w-full min-h-[60vh] space-y-10 max-w-6xl mx-auto ">
          <NewDataForm
            workspaceId={workspaceId}
            userId={session.user.id}
            defaultValues={{
              domain: formData.domain ?? "",
              resultStyle: formData.resultStyle ?? "",
              inputType: formData.inputType ?? "",
              youtubeUrl: formData.youtubeUrl ?? "",
              s3Key: formData.s3Key ?? "",
              instruction: formData.instruction ?? "",
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
