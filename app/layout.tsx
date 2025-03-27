import type React from "react"
import { NavBar } from "@/components/nav-bar"
import { Toaster } from "sonner"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
        <Toaster />
      </body>
    </html>
  )
}

