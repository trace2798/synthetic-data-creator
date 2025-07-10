"use client";
import { createNewCSVData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const GenerateNewCSVButton = ({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}) => {
  const router = useRouter();
  const handleClick = async () => {
    const response = await createNewCSVData(userId, workspaceId);
    router.push(`/dashboard/${workspaceId}/csv/${response.newDataFormId}`);
  };
  return (
    <>
      <Button size={"sm"} variant={"outline"} onClick={() => handleClick()}>
        Generate New CSV
      </Button>
    </>
  );
};

export default GenerateNewCSVButton;
