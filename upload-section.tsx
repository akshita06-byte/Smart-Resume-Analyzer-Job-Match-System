"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadSectionProps {
  onUpload: (files: File[]) => void
}

export default function UploadSection({ onUpload }: UploadSectionProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf" || file.type === "text/plain" || file.name.endsWith(".docx"),
    )
    onUpload(files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(Array.from(e.target.files))
    }
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/50",
      )}
    >
      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
      <p className="text-foreground font-medium mb-1">Drag and drop resumes here</p>
      <p className="text-sm text-muted-foreground mb-4">or</p>
      <label className="text-primary hover:underline cursor-pointer font-medium">
        Click to browse
        <input type="file" multiple accept=".pdf,.txt,.docx" onChange={handleChange} className="hidden" />
      </label>
      <p className="text-xs text-muted-foreground mt-3">PDF, TXT, or DOCX files</p>
    </div>
  )
}
