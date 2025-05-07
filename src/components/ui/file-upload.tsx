"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { IconUpload } from "@tabler/icons-react"
import { useDropzone } from "react-dropzone"
import { useState, useRef } from "react"
import Link from "next/link"

export const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([])
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { shortId } = await response.json()
      setShortUrl(`${window.location.origin}/dl/${shortId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setFiles([])
    }
  }

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles)
      handleUpload(acceptedFiles[0])
    },
    disabled: isUploading,
  })

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        whileHover={!isUploading ? "animate" : undefined}
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center">
          <div className="relative z-20 flex flex-col items-center">
            <IconUpload className="h-8 w-8 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              {isDragActive ? "Drop to upload" : "Drag file here or click to browse"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Max file size: 100MB
            </p>
          </div>

          {isUploading && (
            <div className="mt-6 flex items-center gap-2 text-gray-500">
              <div className="h-4 w-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
              Uploading...
            </div>
          )}

          {shortUrl && (
            <div className="mt-6 text-center space-y-2">
              <p className="text-green-600">Upload successful!</p>
              <Link
                href={shortUrl}
                className="text-blue-600 dark:text-blue-400 underline break-all"
                target="_blank"
              >
                {shortUrl}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Expires after 3 downloads or 1 hour
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
