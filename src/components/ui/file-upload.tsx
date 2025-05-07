"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const FileUpload = ({ onChange }: { onChange?: (files: File[]) => void }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validityHours, setValidityHours] = useState(1);
  const [maxDownloads, setMaxDownloads] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("validityHours", validityHours.toString());
      formData.append("maxDownloads", maxDownloads.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { shortId } = await response.json();
      setShortUrl(`${window.location.origin}/dl/${shortId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
    
    if (newFiles.length > 0) {
      void handleUpload(newFiles[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
    disabled: isUploading,
  });

  const showUploadInstructions = files.length === 0 && !shortUrl;
  
  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={!isUploading && !shortUrl ? handleClick : undefined}
        whileHover={!isUploading && !shortUrl ? "animate" : undefined}
        className={cn(
          "p-10 group/file block rounded-lg w-full relative overflow-hidden",
          !isUploading && !shortUrl ? "cursor-pointer" : "cursor-default"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />

        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none">
          <GridPattern />
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-4 mt-4 w-full max-w-xl">
            <div className="w-1/2">
              <Label>Link Validity</Label>
              <Select 
                value={validityHours.toString()} 
                onValueChange={(v) => setValidityHours(Number(v))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select validity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="3">3 Hours</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="24">24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-1/2">
              <Label>Max Downloads</Label>
              <Select 
                value={maxDownloads.toString()} 
                onValueChange={(v) => setMaxDownloads(Number(v))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select downloads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Download</SelectItem>
                  <SelectItem value="3">3 Downloads</SelectItem>
                  <SelectItem value="5">5 Downloads</SelectItem>
                  <SelectItem value="10">10 Downloads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showUploadInstructions && (
            <>
              <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                Upload file
              </p>
              <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                Drag or drop your files here or click to upload
              </p>
            </>
          )}

          {shortUrl && (
            <p className="relative z-20 font-sans font-bold text-green-600 dark:text-green-400 text-base">
              File uploaded successfully!
            </p>
          )}

          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className="relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md shadow-sm"
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
                    >
                      {file.type}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}

            {!files.length && !shortUrl && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!files.length && !shortUrl && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}

            {isUploading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
                <div className="h-4 w-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
                Uploading...
              </div>
            )}

            {shortUrl && (
              <div className="mt-4 text-center space-y-2">
                <Link href={shortUrl} className="text-blue-500 underline break-all">
                  {shortUrl}
                </Link>
                <div className="text-amber-600 dark:text-amber-400 mt-2 space-y-1">
                  <p>This link will expire in {validityHours} hour{validityHours !== 1 && 's'}.</p>
                  <p>Maximum of {maxDownloads} download{maxDownloads !== 1 && 's'} allowed.</p>
                </div>
              </div>
            )}

            {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
