import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, X, FileImage, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/prompt";

interface FileUploadZoneProps {
  files: FileUpload[];
  onFilesChange: (files: FileUpload[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const ACCEPTED_DOCUMENT_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export function FileUploadZone({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSize = 20,
}: FileUploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const errorMessages = rejectedFiles.map((f) => {
          if (f.errors[0]?.code === "file-too-large") {
            return `${f.file.name} exceeds ${maxSize}MB limit`;
          }
          if (f.errors[0]?.code === "file-invalid-type") {
            return `${f.file.name} is not a supported file type`;
          }
          return f.errors[0]?.message || "Unknown error";
        });
        setError(errorMessages.join(". "));
        return;
      }

      if (files.length + acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newFiles: FileUpload[] = acceptedFiles.map((file) => {
        const isImage = file.type.startsWith("image/");
        return {
          file,
          type: isImage ? "image" : "document",
          preview: isImage ? URL.createObjectURL(file) : undefined,
        };
      });

      onFilesChange([...files, ...newFiles]);
    },
    [files, onFilesChange, maxFiles, maxSize]
  );

  const removeFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { ...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOCUMENT_TYPES },
    maxSize: maxSize * 1024 * 1024,
    maxFiles: maxFiles - files.length,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          files.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} disabled={files.length >= maxFiles} />
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
              isDragActive ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse • Images (JPG, PNG, WebP) or Documents (PDF, DOCX)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Max {maxSize}MB per file • {maxFiles - files.length} slots remaining
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((fileUpload, index) => (
            <div
              key={index}
              className="relative group rounded-lg border border-border bg-card overflow-hidden animate-scale-in"
            >
              {fileUpload.type === "image" && fileUpload.preview ? (
                <img
                  src={fileUpload.preview}
                  alt={fileUpload.file.name}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center bg-muted">
                  {fileUpload.type === "image" ? (
                    <FileImage className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-foreground truncate font-medium">
                  {fileUpload.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
