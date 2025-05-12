"\"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { useState } from "react"
import DrawingCanvas from "./drawing-canvas"

interface NavigationButtonsProps {
  previousUrl?: string
  nextUrl?: string
  showDrawing?: boolean
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ previousUrl, nextUrl, showDrawing = true }) => {
  const router = useRouter()
  const [isDrawingOpen, setIsDrawingOpen] = useState(false)

  return (
    <div className="flex justify-between items-center w-full mt-6 mb-4">
      <div>
        {previousUrl && (
          <Button variant="outline" onClick={() => router.push(previousUrl)} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {showDrawing && (
          <Button variant="outline" onClick={() => setIsDrawingOpen(true)} className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Draw
          </Button>
        )}

        {nextUrl && (
          <Button onClick={() => router.push(nextUrl)} className="flex items-center gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isDrawingOpen && <DrawingCanvas isOpen={isDrawingOpen} onClose={() => setIsDrawingOpen(false)} />}
    </div>
  )
}

export default NavigationButtons
