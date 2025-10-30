"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, File } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  accept?: string
  onUpload: (file: File) => Promise<void>
}

export function FileUploader({ accept, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      setFileName(file.name)
      setUploading(true)
      try {
        await onUpload(file)
      } finally {
        setUploading(false)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? Object.fromEntries(accept.split(",").map((t) => [t, []])) : undefined,
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      } ${uploading ? "opacity-50" : ""}`}
    >
      <input {...getInputProps()} />
      {fileName ? (
        <div className="flex items-center justify-center gap-2">
          <File className="h-5 w-5" />
          <span className="text-sm">{fileName}</span>
        </div>
      ) : (
        <>
          <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="text-sm mt-1">
            {isDragActive ? "Drop file here" : "Drag file or click to upload"}
          </p>
        </>
      )}
    </div>
  )
}