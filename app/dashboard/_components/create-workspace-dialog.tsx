import CreateWorkspaceForm from "./create-workspace-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function CreateWorkspaceDialog({
  currentUserId,
}: {
  currentUserId: string;
}) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="secondary" className="w-full flex items-center">
            Create new workspace
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-background/10 p-0">
          <CreateWorkspaceForm userId={currentUserId} />
        </DialogContent>
      </form>
    </Dialog>
  );
}
