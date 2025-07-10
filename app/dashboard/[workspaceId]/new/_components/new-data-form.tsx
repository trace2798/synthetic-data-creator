"use client";
import { ImageUploader } from "./image-uploader";

const NewDataForm = ({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}) => {
  return (
    <>
      <div>
        <ImageUploader userId={userId} workspaceId={workspaceId} />
      </div>
    </>
  );
};

export default NewDataForm;
