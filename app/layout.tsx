import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth/auth-guard"
import { CoursesProvider } from "@/hooks/use-courses"
import { Suspense, useEffect } from "react"
import Script from "next/script"
import "./globals.css"
import { Toaster } from "sonner"
import { SocketProvider } from "@/components/socket/socket-provider"

export const metadata: Metadata = {
  title: "Ingata E-learning - Learning Management System",
  description: "A comprehensive Learning Management System",
  generator: "GagiN",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
                <SocketProvider />
              <CoursesProvider>
                <AuthGuard>{children}</AuthGuard>
              </CoursesProvider>
            </AuthProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
          <Analytics />
        </Suspense>

        {/* Google Identity SDK */}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  )
}
