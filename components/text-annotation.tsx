"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Circle, Underline } from "lucide-react"

interface TextAnnotationProps {
  isOpen: boolean
  onClose: () => void
  containerRef: React.RefObject<HTMLElement>
}

const TextAnnotation: React.FC<TextAnnotationProps> = ({ isOpen, onClose, containerRef }) => {
  const [mode, setMode] = useState<"circle" | "underline" | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [annotations, setAnnotations] = useState<Array<{ type: "circle" | "underline"; range: Range }>>([])

  // Handle text selection
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        setSelection(selection)
      } else {
        setSelection(null)
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [isOpen, containerRef])

  // Apply annotation when mode is selected and text is selected
  const applyAnnotation = () => {
    if (!selection || !mode || !containerRef.current) return

    const range = selection.getRangeAt(0)

    // Check if selection is within the container
    if (!containerRef.current.contains(range.commonAncestorContainer)) return

    // Create a new annotation
    const newAnnotation = { type: mode, range: range.cloneRange() }

    // Apply the annotation visually
    const span = document.createElement("span")
    span.style.color = "blue"

    if (mode === "circle") {
      span.style.border = "2px solid blue"
      span.style.borderRadius = "50%"
      span.style.padding = "0 2px"
    } else if (mode === "underline") {
      span.style.textDecoration = "underline"
      span.style.textDecorationColor = "blue"
      span.style.textDecorationThickness = "2px"
    }

    // Check if there are adjacent words to include
    const text = range.toString()
    const words = text.split(/\s+/)

    if (words.length > 1) {
      // Multiple words selected, apply to all
      const fragment = document.createDocumentFragment()
      words.forEach((word, index) => {
        const wordSpan = document.createElement("span")
        wordSpan.textContent = word
        wordSpan.style.color = "blue"

        if (mode === "circle") {
          wordSpan.style.border = "2px solid blue"
          wordSpan.style.borderRadius = "50%"
          wordSpan.style.padding = "0 2px"
          wordSpan.style.display = "inline-block"
          wordSpan.style.margin = "0 2px"
        } else if (mode === "underline") {
          wordSpan.style.textDecoration = "underline"
          wordSpan.style.textDecorationColor = "blue"
          wordSpan.style.textDecorationThickness = "2px"
        }

        fragment.appendChild(wordSpan)

        // Add space between words except for the last word
        if (index < words.length - 1) {
          fragment.appendChild(document.createTextNode(" "))
        }
      })

      range.deleteContents()
      range.insertNode(fragment)
    } else {
      // Single word selected
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)
    }

    // Add to annotations list
    setAnnotations([...annotations, newAnnotation])

    // Clear selection
    window.getSelection()?.removeAllRanges()
    setSelection(null)
  }

  // Handle circle button click
  const handleCircleClick = () => {
    setMode("circle")
    if (selection) {
      applyAnnotation()
    }
  }

  // Handle underline button click
  const handleUnderlineClick = () => {
    setMode("underline")
    if (selection) {
      applyAnnotation()
    }
  }

  // Clear all annotations
  const clearAnnotations = () => {
    if (!containerRef.current) return

    // Reload the content to clear annotations
    const content = containerRef.current.innerHTML
    containerRef.current.innerHTML = content
    setAnnotations([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/90 p-2 rounded-lg shadow-md">
      <Button
        variant={mode === "circle" ? "default" : "outline"}
        size="icon"
        onClick={handleCircleClick}
        title="Circle"
      >
        <Circle className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === "underline" ? "default" : "outline"}
        size="icon"
        onClick={handleUnderlineClick}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={clearAnnotations} title="Clear">
        Clear
      </Button>
      <Button variant="outline" size="sm" onClick={onClose} title="Close">
        Close
      </Button>
    </div>
  )
}

export default TextAnnotation
