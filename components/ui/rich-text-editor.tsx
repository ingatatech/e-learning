"use client"

import React from "react"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"
import { Card, CardContent } from "@/components/ui/card"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, false] }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["link"]
  ],
}

const formats = [
  "header",
  "bold",
  "color",
  "background", 
  "italic",
  "underline",
  "blockquote",
  "code-block",
  "list",   
  "align",
  "size",
  "link"
]

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({ 
  value, 
  onChange, 
  className, 
  placeholder = "Write something awesome...",
  disabled = false 
}: RichTextEditorProps) {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="rich-text-editor-wrapper">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            readOnly={disabled}
            className="bg-background border-0"
          />
        </div>
      </CardContent>
    </Card>
  )
}