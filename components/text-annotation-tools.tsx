"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Circle, Underline } from "lucide-react"

interface TextAnnotationToolsProps {
  onCircle: () => void
  onUnderline: () => void
  isWritingSection: boolean
}

export function TextAnnotationTools({ onCircle, onUnderline, isWritingSection }: TextAnnotationToolsProps) {
  const [activeMode, setActiveMode] = useState<"circle" | "underline" | null>(null)

  // Only show the tools in the writing section
  if (!isWritingSection) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-50">
      <Button
        variant={activeMode === "circle" ? "default" : "outline"}
        size="icon"
        onClick={() => {
          setActiveMode(activeMode === "circle" ? null : "circle")
          onCircle()
        }}
        title="Circle Text"
      >
        <Circle className="h-4 w-4" />
      </Button>
      <Button
        variant={activeMode === "underline" ? "default" : "outline"}
        size="icon"
        onClick={() => {
          setActiveMode(activeMode === "underline" ? null : "underline")
          onUnderline()
        }}
        title="Underline Text"
      >
        <Underline className="h-4 w-4" />
      </Button>
    </div>
  )
}
