"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface FileWithPreview extends FileWithPath {
  preview: string;
}

interface InitialFileUploadProps {
  userId: string;
  workspaceId: string;
}

export function FileUploader({
  userId,
  workspaceId,
  onUploadComplete,
}: InitialFileUploadProps & {
  onUploadComplete?: (keys: string[]) => void;
}) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(5);
  const [uploadProgressIndex, setUploadProgressIndex] = useState<number>(1);
  const router = useRouter();
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const removeFile = (file: File) => () => {
    const newFiles = files.filter((f) => f !== file);
    setFiles(newFiles);
  };

  const uploadFiles = async () => {
    setUploading(true);
    setUploadProgress(10);
    const uploadedKeys: string[] = [];
    for (const [index, file] of files.entries()) {
      setUploadProgressIndex(index);
      setUploadProgress(20);
      try {
        setUploadProgress(35);
        const presignRes = await fetch("/api/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            userId,
            workspaceId,
          }),
        });
        console.log("Presifned call done");
        if (!presignRes.ok) throw new Error("Failed to get presigned URL");
        const { key, url: uploadUrl } = await presignRes.json();
        console.log("KEY", key);
        console.log("URL", uploadUrl);
        console.log("GOT PREDEFINED URL", { key, uploadUrl });
        setUploadProgress(50);
        console.log("WILL UPLOAD NOW");
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });
        if (!uploadRes.ok) {
          toast.error("Upload to S3 Failed");
        }
        uploadedKeys.push(key);
        toast.success(`Successfully uploaded ${file.name}`);
      } catch (error) {
        console.error("Upload error: ", error);
        toast.error(`Failed to upload ${file.name}`);
        console.error("Upload error: ", error);
      }
    }
    setFiles([]);
    setUploading(false);
    onUploadComplete?.(uploadedKeys);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
    },
  });

  const thumbs = files.map((file) => (
    <div key={file.name} className={`w-full`}>
      <div className="flex justify-evenly">
        <p className="bg-accent rounded-2xl px-3 py-2">{file.name}</p>
        <button onClick={removeFile(file)} className="text-red-400 size-4">
          <Trash className="size-4" />
        </button>
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );
  return (
    <>
      <Card
        className="w-full h-32 flex flex-col items-center justify-center hover:cursor-pointer"
        {...(!uploading && getRootProps())}
      >
        <>
          {uploading ? (
            <>
              <div className="w-full flex flex-col justify-center items-center space-y-3 max-w-6xl">
                <h1 className="text-sm">
                  {" "}
                  <UploadCloud className="animate-bounce size-8" />
                </h1>
                <h2 className="text-sm text-slate-500">
                  {" "}
                  {`${
                    uploadProgressIndex !== null ? uploadProgressIndex + 1 : 0
                  }/${files.length}`}
                </h2>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center">
                <input {...getInputProps()} />
                <p className="text-base lg:text-lg ">
                  Drag &apos;n&apos; drop file here
                </p>
                <Button type="button" variant="outline" className="mt-3">
                  Or click to select files
                </Button>
              </div>
            </>
          )}
        </>
      </Card>
      {files && files.length > 0 && !uploading && (
        <>
          <Card className="w-full h-fit mt-3 flex p-5 items-center justify-between">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {thumbs}
            </div>
          </Card>
          <Button
            variant="default"
            type="button"
            onClick={uploadFiles}
            className="mt-5 hover:cursor-pointer w-full max-w-sm"
            disabled={uploading}
          >
            Confirm and Upload Files
          </Button>
        </>
      )}
    </>
  );
}
