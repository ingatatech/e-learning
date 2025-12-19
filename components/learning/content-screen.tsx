"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, BookOpen, Clock, FileDown } from "lucide-react"
import "react-quill/dist/quill.bubble.css" // Or quill.snow.css for full editor styling

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
    resources?: Array<{
      url: string
      title: string
      description?: string
    }>
  }
  onComplete: (score: number | undefined, passed: boolean) => void
  isCompleted: boolean
  isStepping: boolean
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
      <div className="ql-editor rich-text-content" style={{ 
        padding: 0,
        backgroundColor: 'transparent',
        border: 'none',
        minHeight: 'auto'
      }}>
        <div
          dangerouslySetInnerHTML={{ __html: block.data.text || "" }}
        />
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
          {block.data.caption && <p className="text-sm text-muted-foreground mt-2 text-center">{block.data.caption}</p>}
        </div>
      )

    case "image":
      return (
        <div className="mb-6">
          <div className="rounded-lg overflow-hidden">
            <img
              src={block.data.url || "/placeholder.svg"}
              alt={block.data.alt || "Content image"}
              className="w-full max-w-3xl h-auto mx-auto rounded-lg object-contain"
            />
          </div>
          {block.data.caption && <p className="text-sm text-muted-foreground mt-2 text-center">{block.data.caption}</p>}
        </div>
      )

    default:
      return null
  }
}

export function ContentScreen({ lesson, onComplete, isCompleted, isStepping }: ContentScreenProps) {
  const contentBlocks = parseContentBlocks(lesson.content)
  const handleComplete = () => {
    onComplete(undefined, true)
  }

  return (
    <div className="w-full space-y-6">
      <Card className="px-3 shadow-none border-0 ">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-xl">{lesson.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                  {(lesson.duration && lesson.duration > 0) ? (
                      <span>{lesson.duration} minutes</span>
                    ) : (
                      <span>Self-paced</span>
                    )}
                    </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="border-t pt-6">
          {contentBlocks.length > 0 ? (
            <div className="space-y-4 px-4">
              {contentBlocks
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <ContentBlockRenderer key={block.id} block={block} />
                ))}
              {!isCompleted && (
                <Button onClick={handleComplete} disabled={isStepping} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {isStepping ? "Completing..." : "Mark Complete"}
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

      {lesson.resources && lesson.resources.length > 0 && (
        <Card className="px-3 shadow-none mx-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-primary" />
              Lesson Resources
            </CardTitle>
            <CardDescription>Additional materials and resources for this lesson</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {(typeof lesson.resources === "string" ? JSON.parse(lesson.resources) : lesson.resources).map((resource: any, index: any) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <FileDown className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{resource.title}</h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild className="flex-shrink-0 bg-transparent">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      View Resource
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
