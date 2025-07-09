import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
  if (workspaceInfo?.userId !== session.user.id) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col w-full h-full space-y-10 max-w-6xl mx-auto">
      <div className=" flex flex-col space-y-5">
        <Label className="text-primary/80">Add Images to this workspace</Label>
        {/* <ImageUploader userId={session.user.id} workspaceId={workspaceId} /> */}
        <Separator />
      </div>
      <div className="flex flex-col space-y-5">
        <Label>Images</Label>
        <div>
          <div className="flex flex-row space-x-10"></div>
        </div>
        {/* <DataTable columns={columns} data={images as Image[]} /> */}
      </div>
    </div>
  );
};

export default WorkspaceIdIdPage;
