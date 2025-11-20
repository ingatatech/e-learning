"use client"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import Highlight from "@tiptap/extension-highlight"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  TableIcon,
  Highlighter,
  Undo,
  Redo,
  Palette,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCallback, useState } from "react"
import { DocumentMediaUpload } from "./document-media-upload"

interface DocumentEditorProps {
  content: string
  onChange: (content: string) => void
  documentId: string
  token: string
}

export function DocumentEditor({ content, onChange, documentId, token }: DocumentEditorProps) {
  const [mediaUploading, setMediaUploading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const handleMediaUploaded = useCallback(
    (mediaData: { id: string; documentId: string; type: string; url: string }) => {
      if (!editor) return

      if (mediaData.type === "image") {
        editor.chain().focus().setImage({ src: mediaData.url }).run()
      } else if (mediaData.type === "video") {
        editor
          .chain()
          .focus()
          .insertContent(
            `<div style="width: 100%; max-width: 640px; margin: 1rem 0; position: relative; padding-bottom: 56.25%;">
            <iframe
              src="${mediaData.url}"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 0.5rem;"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>`,
          )
          .run()
      }
    },
    [editor],
  )

  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL")
    if (url && editor) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }, [editor])

  const setColor = useCallback(() => {
    const color = window.prompt("Enter color (hex code)")
    if (color && editor) {
      editor.chain().focus().setColor(color).run()
    }
  }, [editor])

  const setHighlight = useCallback(() => {
    const color = window.prompt("Enter highlight color (hex code)")
    if (color && editor) {
      editor.chain().focus().setHighlight({ color }).run()
    }
  }, [editor])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err)
        setIsFullscreen(false)
      })
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    }
  }

  if (!editor) return null

  return (
    <div className={`flex flex-col h-full bg-background relative ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
        {/* Toolbar */}
        <div className="bg-background">
          <div className="flex flex-wrap items-center gap-1 p-2">
            {/* Undo/Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Font Size */}
            <Select
              value={
                editor.isActive("heading", { level: 1 })
                  ? "h1"
                  : editor.isActive("heading", { level: 2 })
                    ? "h2"
                    : editor.isActive("heading", { level: 3 })
                      ? "h3"
                      : "p"
              }
              onValueChange={(value) => {
                if (value === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run()
                else if (value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run()
                else if (value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run()
                else editor.chain().focus().setParagraph().run()
              }}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p">Normal</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text Formatting */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "bg-muted" : ""}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "bg-muted" : ""}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "bg-muted" : ""}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "bg-muted" : ""}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Colors */}
            <Button variant="ghost" size="sm" onClick={setColor}>
              <Palette className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={setHighlight}>
              <Highlighter className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={editor.isActive({ textAlign: "justify" }) ? "bg-muted" : ""}
            >
              <AlignJustify className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Lists */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "bg-muted" : ""}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "bg-muted" : ""}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Other Formatting */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive("blockquote") ? "bg-muted" : ""}
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive("code") ? "bg-muted" : ""}
            >
              <Code className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Insert */}
            <Button variant="ghost" size="sm" onClick={setLink}>
              <LinkIcon className="w-4 h-4" />
            </Button>

            <DocumentMediaUpload
              documentId={documentId}
              mediaType="image"
              token={token}
              onMediaUploaded={handleMediaUploaded}
              onUploadStart={() => setMediaUploading(true)}
              onUploadEnd={() => setMediaUploading(false)}
            />
            <DocumentMediaUpload
              documentId={documentId}
              mediaType="video"
              token={token}
              onMediaUploaded={handleMediaUploaded}
              onUploadStart={() => setMediaUploading(true)}
              onUploadEnd={() => setMediaUploading(false)}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              <TableIcon className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="max-w-[1000px] mx-auto py-12 px-20 bg-background my-8 shadow-sm min-h-[calc(100vh-200px)]">
          <EditorContent
            editor={editor}
            className="prose prose-lg max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[calc(100vh-250px)]"
          />
        </div>
      </div>
    </div>
  )
}
