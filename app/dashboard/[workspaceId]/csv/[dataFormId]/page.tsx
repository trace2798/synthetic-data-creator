import { db } from "@/db";
import {
  role,
  syntheticCsvContent,
  syntheticCsvFile,
  syntheticDataFile,
  workspaceMembers,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewCSVDataForm from "../../new/_components/new-csv-data-form";

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
      id: syntheticCsvContent.id,
      domain: syntheticCsvContent.domain,
      resultStyle: syntheticCsvContent.resultStyle,
      inputType: syntheticCsvContent.inputType,
      s3Key: syntheticCsvContent.s3Key,
      instruction: syntheticCsvContent.instruction,
    })
    .from(syntheticCsvContent)
    .where(eq(syntheticCsvContent.id, dataFormId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!formData) {
    return <p>Form not found.</p>;
  }
  const generatedCsvFiles = await db
    .select({
      id: syntheticCsvFile.id,
      s3Key: syntheticCsvFile.s3Key,
      format: syntheticCsvFile.format,
      createdAt: syntheticCsvFile.createdAt,
    })
    .from(syntheticCsvFile)
    .where(eq(syntheticCsvFile.syntheticCsvContentId, dataFormId));
  return (
    <>
      <div className="absolute top-32 w-full overflow-x-hidden">
        <div className="flex flex-col w-full min-h-[60vh] space-y-5 max-w-6xl mx-auto ">
          <NewCSVDataForm
            workspaceId={workspaceId}
            userId={session.user.id}
            dataFormId={dataFormId}
            defaultValues={{
              domain: formData.domain ?? "",
              resultStyle: formData.resultStyle ?? "",
              inputType: formData.inputType ?? "",
              s3Key: formData.s3Key ?? "",
              instruction: formData.instruction ?? "",
            }}
          />
          <div>
            {generatedCsvFiles.length > 0 && (
              <div className="w-full max-w-5xl mx-auto pb-24">
                <h3 className="text-lg font-semibold mb-4">Generated Files</h3>
                <ul className="space-y-2">
                  {generatedCsvFiles.map((file) => (
                    <li
                      key={file.id}
                      className="border rounded p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {file.format.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 break-all">
                          {file.s3Key}
                        </p>
                      </div>
                      <a
                        href={`${process.env.CLOUDFRONT_BASE_URL}/${file.s3Key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
