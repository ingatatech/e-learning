import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex ">
      {/* Left side - Form container */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-r from-background to-gray-100 dark:to-[#191919]">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Right side - Background image (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-right bg-no-repeat"
        style={{
          backgroundImage:"url(/bg.png)",
        }}
      >

        {/* overlay div  */}
        <div className="bg-gradient-to-r from-gray-100 dark:from-[#191919] to-transparent absolute inset-0"></div>
      </div>
    </div>
  )
}
