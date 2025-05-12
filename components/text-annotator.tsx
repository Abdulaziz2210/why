"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { TextAnnotationTools } from "./text-annotation-tools"

interface TextAnnotatorProps {
  children: React.ReactNode
  isWritingSection: boolean
}

export function TextAnnotator({ children, isWritingSection }: TextAnnotatorProps) {
  const [annotationMode, setAnnotationMode] = useState<"circle" | "underline" | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [annotations, setAnnotations] = useState<
    Array<{
      type: "circle" | "underline"
      element: HTMLElement
      rect: DOMRect
    }>
  >([])

  const handleCircle = () => {
    setAnnotationMode(annotationMode === "circle" ? null : "circle")
  }

  const handleUnderline = () => {
    setAnnotationMode(annotationMode === "underline" ? null : "underline")
  }

  const handleTextSelection = () => {
    if (!annotationMode || !isWritingSection) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    if (range.collapsed) return

    // Get all text nodes in the selection
    const textNodes: Node[] = []
    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, null)

    let node
    while ((node = walker.nextNode())) {
      if (range.intersectsNode(node)) {
        textNodes.push(node)
      }
    }

    // Process each text node
    textNodes.forEach((textNode) => {
      const span = document.createElement("span")
      span.className = annotationMode === "circle" ? "text-annotation-circle" : "text-annotation-underline"
      span.style.color = "blue"

      // Check if there are adjacent nodes that should be included
      const parentElement = textNode.parentElement
      if (parentElement) {
        const rect = parentElement.getBoundingClientRect()

        // Add to annotations
        setAnnotations((prev) => [
          ...prev,
          {
            type: annotationMode,
            element: parentElement,
            rect,
          },
        ])

        // Apply styling
        if (annotationMode === "circle") {
          parentElement.style.border = "2px solid blue"
          parentElement.style.borderRadius = "50%"
          parentElement.style.padding = "2px"
        } else {
          parentElement.style.borderBottom = "2px solid blue"
        }
      }
    })

    // Clear selection
    selection.removeAllRanges()
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("mouseup", handleTextSelection)

    return () => {
      container.removeEventListener("mouseup", handleTextSelection)
    }
  }, [annotationMode, isWritingSection])

  return (
    <div className="relative">
      <div ref={containerRef} className="text-annotator-container">
        {children}
      </div>
      <TextAnnotationTools onCircle={handleCircle} onUnderline={handleUnderline} isWritingSection={isWritingSection} />

      <style jsx global>{`
        .text-annotation-circle {
          border: 2px solid blue;
          border-radius: 50%;
          padding: 2px;
        }
        
        .text-annotation-underline {
          border-bottom: 2px solid blue;
        }
      `}</style>
    </div>
  )
}
