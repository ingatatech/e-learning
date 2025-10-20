"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Share2, Linkedin } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CertificateProps {
  studentName: string
  courseName: string
  score: number
  instructorName: string
  institutionName: string
  directorName?: string
  completionDate: string
  verificationCode: string
}

export function Certificate({
  studentName,
  courseName,
  score,
  instructorName,
  institutionName,
  directorName = "Institution Director",
  completionDate,
  verificationCode,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    // Generate QR code URL for verification
    const verificationUrl = `${window.location.origin}/verify-certificate/${verificationCode}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verificationUrl)}`
    setQrCodeUrl(qrUrl)
  }, [verificationCode])

  const handleDownload = async () => {
    if (!certificateRef.current) return

    try {
      // Use html2canvas to convert the certificate to an image
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(".certificate-container")
          if (clonedElement) {
            // Force recompute all styles
            const allElements = clonedElement.querySelectorAll("*")
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement
              const computedStyle = window.getComputedStyle(htmlEl)
              htmlEl.style.color = computedStyle.color
              htmlEl.style.backgroundColor = computedStyle.backgroundColor
              htmlEl.style.borderColor = computedStyle.borderColor
            })
          }
        },
      })

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `certificate-${courseName.replace(/\s+/g, "-").toLowerCase()}.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      })

      toast({
        title: "Success",
        description: "Certificate downloaded successfully!",
      })
    } catch (error) {
      console.error("Failed to download certificate:", error)
      toast({
        title: "Error",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShareLinkedIn = () => {
    const verificationUrl = `${window.location.origin}/verify-certificate/${verificationCode}`
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`
    window.open(linkedInUrl, "_blank", "width=600,height=600")

    toast({
      title: "Opening LinkedIn",
      description: "Share your certificate on LinkedIn!",
    })
  }

  const handleShare = () => {
    const verificationUrl = `${window.location.origin}/verify-certificate/${verificationCode}`
    const shareText = `I've completed ${courseName} with a score of ${score}%!`

    if (navigator.share) {
      navigator.share({
        title: "My Course Certificate",
        text: shareText,
        url: verificationUrl,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${verificationUrl}`)
      toast({
        title: "Link Copied",
        description: "Certificate details copied to clipboard!",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div ref={certificateRef} className="certificate-container" style={{ backgroundColor: "#ffffff" }}>
        <div
          className="certificate p-[60px] shadow-2xl relative"
          style={{
            backgroundColor: "#ffffff",
            border: "20px solid #00a63e",
          }}
        >
          {/* Inner border */}
          <div
            className="absolute top-[40px] left-[40px] right-[40px] bottom-[40px] pointer-events-none"
            style={{ border: "2px solid #00a63e" }}
          />

          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <div
              className="text-sm font-semibold tracking-[3px] uppercase mb-2.5"
              style={{ color: "#00a63e", backgroundColor: "transparent" }}
            >
              Ingata - E-Learning
            </div>
            <div
              className="font-serif text-5xl font-bold mb-2.5 uppercase tracking-[2px]"
              style={{ color: "#00a63e", backgroundColor: "transparent" }}
            >
              Certificate
            </div>
            <div
              className="text-lg font-light tracking-wide"
              style={{ color: "#4b5563", backgroundColor: "transparent" }}
            >
              of Completion
            </div>
          </div>

          {/* Content */}
          <div className="text-center my-12 relative z-10">
            <div className="text-base mb-7 font-light" style={{ color: "#6b7280", backgroundColor: "transparent" }}>
              This is to certify that
            </div>

            <div
              className="font-serif text-[42px] font-bold my-7 py-5 inline-block min-w-[60%]"
              style={{ color: "#00a63e", borderBottom: "3px solid #00a63e", backgroundColor: "transparent" }}
            >
              {studentName}
            </div>

            <div
              className="text-base my-7 leading-relaxed"
              style={{ color: "#6b7280", backgroundColor: "transparent" }}
            >
              has successfully completed the course
              <br />
              <span className="font-semibold text-xl" style={{ color: "#1f2937", backgroundColor: "transparent" }}>
                {courseName}
              </span>
            </div>

            <div className="text-base" style={{ color: "#6b7280", backgroundColor: "transparent" }}>
              with a score of
            </div>

            <div
              className="inline-block px-7 py-2.5 rounded-full text-2xl font-semibold my-5"
              style={{ backgroundColor: "#00a63e", color: "#ffffff" }}
            >
              {score}%
            </div>

            <div className="text-base" style={{ color: "#6b7280", backgroundColor: "transparent" }}>
              at <strong style={{ color: "#1f2937" }}>{institutionName}</strong>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-around mt-[60px] pt-10 relative z-10">
            <div className="text-center flex-1 px-5">
              <div className="mb-2.5 w-[250px] mx-auto" style={{ borderTop: "2px solid #00a63e" }} />
              <div className="text-sm mb-1" style={{ color: "#6b7280", backgroundColor: "transparent" }}>
                Instructor
              </div>
              <div className="font-semibold text-base" style={{ color: "#1f2937", backgroundColor: "transparent" }}>
                {instructorName}
              </div>
            </div>

            <div
              className="w-[120px] h-[120px] rounded-full flex items-center justify-center opacity-90"
              style={{ border: "5px solid #00a63e", backgroundColor: "#ffffff" }}
            >
              <div className="text-center text-xs font-semibold" style={{ color: "#00a63e" }}>
                OFFICIAL
                <br />
                SEAL
              </div>
            </div>

            <div className="text-center flex-1 px-5">
              <div className="mb-2.5 w-[250px] mx-auto" style={{ borderTop: "2px solid #00a63e" }} />
              <div className="text-sm mb-1" style={{ color: "#6b7280", backgroundColor: "transparent" }}>
                Director
              </div>
              <div className="font-semibold text-base" style={{ color: "#1f2937", backgroundColor: "transparent" }}>
                {directorName}
              </div>
            </div>
          </div>

          {/* Date */}
          <div
            className="text-center mt-7 text-sm relative z-10"
            style={{ color: "#9ca3af", backgroundColor: "transparent" }}
          >
            Issued on{" "}
            {new Date(completionDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          {/* Verification */}
          <div
            className="flex items-center justify-center gap-5 mt-7 pt-5 relative z-10"
            style={{ borderTop: "1px solid #e5e7eb" }}
          >
            <div className="qr-code">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="Verification QR Code"
                  className="w-20 h-20 p-1"
                  style={{ border: "2px solid #00a63e", backgroundColor: "#ffffff" }}
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="text-xs max-w-[400px]" style={{ color: "#6b7280", backgroundColor: "transparent" }}>
              You can verify this certificate on:{" "}
              <a
                href={`${window.location.origin}/verify-certificate/${verificationCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline break-all hover:underline"
                style={{ color: "#00a63e" }}
              >
                {window.location.origin}/verify-certificate/{verificationCode}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Certificate
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShareLinkedIn} className="cursor-pointer">
              <Linkedin className="w-4 h-4 mr-2" />
              Share on LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
