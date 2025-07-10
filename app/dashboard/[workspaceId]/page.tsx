import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { role, workspaceMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import GenerateNewDataButton from "./new/_components/generate-new-data-button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import GenerateNewCSVButton from "./new/_components/generate-new-csv-button";
import NewCSVDataForm from "./new/_components/new-csv-data-form";

interface WorkspaceIdIdPageProps {
  params: Promise<{ workspaceId: string }>;
}

const WorkspaceIdIdPage = async ({ params }: WorkspaceIdIdPageProps) => {
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
  const syntheticDataList = await db.query.syntheticDataContent.findMany({
    where: (table, { eq }) => eq(table.workspaceId, workspaceId),
    orderBy: (table, { desc }) => desc(table.createdAt),
  });
  const syntheticCsvDataList = await db.query.syntheticCsvContent.findMany({
    where: (table, { eq }) => eq(table.workspaceId, workspaceId),
    orderBy: (table, { desc }) => desc(table.createdAt),
  });
  return (
    <>
      <div className="absolute top-32 w-full overflow-x-hidden">
        <div className="flex flex-col w-full min-h-[60vh] space-y-10 max-w-6xl mx-auto ">
          <div className=" flex flex-col space-y-5">
            <div className="flex justify-between items-center">
              <Label>Synthetic Data</Label>
              <div className="flex flex-row items-center space-x-3">
                <GenerateNewDataButton
                  userId={session.user.id}
                  workspaceId={workspaceId}
                />
                <GenerateNewCSVButton
                  userId={session.user.id}
                  workspaceId={workspaceId}
                />
              </div>
            </div>
            <Separator />
          </div>
          <div className="flex flex-col space-y-5">
            <div>
              <div className="flex flex-row gap-10">
                {syntheticDataList.length === 0 ? (
                  <div className="w-full text-center flex flex-col space-y-5">
                    <h1 className="text-3xl">
                      Looks like you have not generated any data till now
                    </h1>
                    <div className="w-full max-w-sm mx-auto">
                      <GenerateNewDataButton
                        userId={session.user.id}
                        workspaceId={workspaceId}
                      />
                    </div>
                  </div>
                ) : (
                  syntheticDataList.map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/${workspaceId}/${item.id}`}
                      className="w-full max-w-sm"
                    >
                      <Card className="w-full max-w-sm">
                        <CardHeader>
                          <CardTitle>{item.title}</CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Label>CSV </Label>
              <Separator />
            </div>
            <div className="flex flex-row gap-10">
              {syntheticCsvDataList.length === 0 ? (
                <div className="w-full text-center flex flex-col space-y-5">
                  <h1 className="text-3xl">
                    Looks like you have not generated any data till now
                  </h1>
                  <div className="w-full max-w-sm mx-auto">
                    <GenerateNewCSVButton
                      userId={session.user.id}
                      workspaceId={workspaceId}
                    />
                  </div>
                </div>
              ) : (
                syntheticCsvDataList.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/${workspaceId}/csv/${item.id}`}
                    className="w-full max-w-sm"
                  >
                    <Card className="w-full max-w-sm">
                      <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                ))
              )}
            </div>
            {/* <div>
              <NewCSVDataForm dataFormId="" userId="" workspaceId="" />
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspaceIdIdPage;
