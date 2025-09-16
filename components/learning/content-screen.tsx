"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, BookOpen, Clock } from "lucide-react"
import { parse } from "path"

interface ContentBlock {
  type: "text" | "video" | "image"
  data: {
    text?: string
    url?: string
    caption?: string
    alt?: string
  }
  id: string
  order: number
}

interface ContentScreenProps {
  lesson: {
    id: string
    title: string
    content: string
    duration: number
  }
  onComplete: () => void
  isCompleted: boolean
}

function parseContentBlocks(content: string): ContentBlock[] {
  try {
    let parsedContent: any = content

    // Remove wrapping quotes if they exist (double-escaped JSON)
    if (parsedContent.startsWith('"') && parsedContent.endsWith('"')) {
      parsedContent = parsedContent.slice(1, -1) // remove first & last quote
      parsedContent = parsedContent.replace(/\\"/g, '"') // unescape inner quotes
    }

    const contentData = JSON.parse(parsedContent)
    return contentData.blocks || []
  } catch (error) {
    console.error("Failed to parse content blocks:", error)
    return [
      {
        type: "text",
        data: { text: content },
        id: "fallback-text",
        order: 1,
      },
    ]
  }
}


function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "text":
      return (
        <div className="prose prose-lg max-w-none mb-6">
          <div dangerouslySetInnerHTML={{ __html: block.data.text || "" }} />
        </div>
      )

    case "video":
      if (!block.data.url) {
        return null
      }
  const isYouTube = block.data.url.includes("youtube.com") || block.data.url.includes("youtu.be")

  return (
    <div className="mb-6">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        {isYouTube ? (
          <iframe
            src={block.data.url.replace("watch?v=", "embed/")}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <video src={block.data.url} controls className="w-full h-full" poster={block.data.caption}>
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {block.data.caption && (
        <p className="text-sm text-muted-foreground mt-2 text-center">{block.data.caption}</p>
      )}
    </div>
  )


    case "image":
      return (
        <div className="mb-6">
          <div className="rounded-lg overflow-hidden">
            <img
              src={block.data.url || "/placeholder.svg"}
              alt={block.data.alt || "Content image"}
              className="w-full h-auto"
            />
          </div>
          {block.data.caption && <p className="text-sm text-muted-foreground mt-2 text-center">{block.data.caption}</p>}
        </div>
      )

    default:
      return null
  }
}

export function ContentScreen({ lesson, onComplete, isCompleted }: ContentScreenProps) {
  const contentBlocks = parseContentBlocks(lesson.content)

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} minutes</span>
                </div>
              </div>
            </div>
            
          </div>
        </CardHeader>
        <CardContent>
          {contentBlocks.length > 0 ? (
            <div className="space-y-4">
              {contentBlocks
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <ContentBlockRenderer key={block.id} block={block} />
                ))}
                {!isCompleted && (
              <Button onClick={onComplete} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </Button>
            )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No content available for this lesson yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
