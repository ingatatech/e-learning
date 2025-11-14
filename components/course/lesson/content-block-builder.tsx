"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from 'lucide-react'
import { TextBlockEditor } from "./text-block-editor"
import { ImageBlockEditor } from "./image-block-editor"
import { VideoBlockEditor } from "./video-block-editor"
import type { ContentBlock } from "@/types"

interface ContentBlockBuilderProps {
  blocks: ContentBlock[]
  onBlocksChange: (blocks: ContentBlock[]) => void
}

export function ContentBlockBuilder({
  blocks,
  onBlocksChange,
}: ContentBlockBuilderProps) {
  const [blockType, setBlockType] = useState<"text" | "image" | "video" | "">("")

  const addBlock = () => {
    if (!blockType) return

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: blockType as "text" | "image" | "video",
      order: blocks.length,
      data: {
        text: "",
        url: "",
      },
    }

    onBlocksChange([...blocks, newBlock])
    setBlockType("")
  }

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    const updated = blocks.map((block) =>
      block.id === blockId ? { ...block, ...updates } : block
    )
    onBlocksChange(updated)
  }

  const deleteBlock = (blockId: string) => {
    const updated = blocks
      .filter((block) => block.id !== blockId)
      .map((block, index) => ({
        ...block,
        order: index,
      }))
    onBlocksChange(updated)
  }

  const updateBlockData = (blockId: string, newData: any) => {
    const updated = blocks.map((block) =>
      block.id === blockId ? { ...block, data: { ...block.data, ...newData } } : block
    )
    onBlocksChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Add Block Section */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-dashed border-2">
        <div className="flex gap-2">
          <Select value={blockType} onValueChange={(value: any) => setBlockType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select block type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Block</SelectItem>
              <SelectItem value="image">Image Block</SelectItem>
              <SelectItem value="video">Video Block</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addBlock} disabled={!blockType} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Block
          </Button>
        </div>
      </Card>

      {/* Blocks List */}
      {blocks.length > 0 ? (
        <div className="space-y-3">
          {blocks.map((block) => (
            <div key={block.id}>
              {block.type === "text" && (
                <TextBlockEditor
                  blockId={block.id}
                  content={block.data.text || ""}
                  onUpdate={(text) => updateBlockData(block.id, { text })}
                  onDelete={() => deleteBlock(block.id)}
                />
              )}
              {block.type === "image" && (
                <ImageBlockEditor
                  blockId={block.id}
                  imageUrl={block.data.url || ""}
                  onUpdate={(url) => updateBlockData(block.id, { url })}
                  onDelete={() => deleteBlock(block.id)}
                />
              )}
              {block.type === "video" && (
                <VideoBlockEditor
                  blockId={block.id}
                  videoUrl={block.data.url || ""}
                  onUpdate={(url) => updateBlockData(block.id, { url })}
                  onDelete={() => deleteBlock(block.id)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No content blocks yet. Add one to get started!</p>
        </div>
      )}
    </div>
  )
}
