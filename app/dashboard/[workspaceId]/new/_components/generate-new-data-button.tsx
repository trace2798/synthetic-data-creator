"use client";
import { createNewData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const GenerateNewDataButton = ({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}) => {
  const router = useRouter();
  const handleClick = async () => {
    const response = await createNewData(userId, workspaceId);
    router.push(`/dashboard/${workspaceId}/${response.newDataFormId}`);
  };
  return (
    <>
      <Button size={"sm"} variant={"outline"} onClick={() => handleClick()}>
        Generate New Data
      </Button>
    </>
  );
};

export default GenerateNewDataButton;
