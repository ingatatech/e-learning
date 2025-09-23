"use client"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, Underline, List, ListOrdered, Link, Type } from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const insertText = useCallback(
    (before: string, after = "") => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)

      const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
      onChange(newText)

      // Restore cursor position
      setTimeout(() => {
        if (textarea) {
          const newCursorPos = start + before.length + selectedText.length + after.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
          textarea.focus()
        }
      }, 0)
    },
    [value, onChange],
  )

  const formatText = useCallback(
    (format: string) => {
      switch (format) {
        case "bold":
          insertText("**", "**")
          break
        case "italic":
          insertText("*", "*")
          break
        case "underline":
          insertText("<u>", "</u>")
          break
        case "h1":
          insertText("# ")
          break
        case "h2":
          insertText("## ")
          break
        case "h3":
          insertText("### ")
          break
        case "ul":
          insertText("- ")
          break
        case "ol":
          insertText("1. ")
          break
        case "link":
          const url = prompt("Enter URL:")
          if (url) {
            insertText("[", `](${url})`)
          }
          break
      }
    },
    [insertText],
  )

  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/^1\. (.*$)/gm, "<li>$1</li>")
      .replace(/\n/g, "<br>")
  }

  const toolbarButtons = [
    { format: "bold", icon: Bold, label: "Bold" },
    { format: "italic", icon: Italic, label: "Italic" },
    { format: "underline", icon: Underline, label: "Underline" },
    { format: "ul", icon: List, label: "Bullet List" },
    { format: "ol", icon: ListOrdered, label: "Numbered List" },
    { format: "link", icon: Link, label: "Add Link" },
  ]

  const headingButtons = [
    { format: "h1", label: "H1" },
    { format: "h2", label: "H2" },
    { format: "h3", label: "H3" },
  ]

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="border-b p-2 flex flex-wrap items-center gap-1">
          {/* Heading Buttons */}
          <div className="flex items-center gap-1 mr-2 border-r pr-2">
            {headingButtons.map((btn) => (
              <Button
                key={btn.format}
                variant="ghost"
                size="sm"
                onClick={() => formatText(btn.format)}
                className="h-8 px-2 text-xs"
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {/* Format Buttons */}
          <div className="flex items-center gap-1 mr-2 border-r pr-2">
            {toolbarButtons.map((btn) => (
              <Button
                key={btn.format}
                variant="ghost"
                size="sm"
                onClick={() => formatText(btn.format)}
                className="h-8 w-8 p-0"
                title={btn.label}
              >
                <btn.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>

          {/* Preview Toggle */}
          <Button
            variant={previewMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="h-8 px-2 text-xs"
          >
            <Type className="w-4 h-4 mr-1" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>

        {/* Editor/Preview */}
        <div className="relative">
          {previewMode ? (
            <div
              className="min-h-[200px] p-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
            />
          ) : (
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || "Start typing your content...\n\nUse **bold**, *italic*, # headings, - lists"}
              className="min-h-[200px] border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              }}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="border-t p-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-4">
            <span>**bold**</span>
            <span>*italic*</span>
            <span># heading</span>
            <span>- list</span>
            <span>[link](url)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
