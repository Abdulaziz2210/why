"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Eraser, X, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DrawingCanvasProps {
  isOpen: boolean
  onClose: () => void
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil")
  const [color, setColor] = useState("#FF0000") // Default red color
  const [lineWidth, setLineWidth] = useState(3)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Initialize canvas context
  useEffect(() => {
    if (!isOpen) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Make canvas transparent overlay over the entire viewport
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const context = canvas.getContext("2d")
    if (context) {
      setCtx(context)
      context.lineCap = "round"
      context.lineJoin = "round"
      context.strokeStyle = color
      context.lineWidth = lineWidth
    }

    // Handle window resize
    const handleResize = () => {
      if (canvas) {
        // Save current drawing
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        const tempCtx = tempCanvas.getContext("2d")
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0)
        }

        // Resize canvas
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        // Restore drawing
        if (context) {
          context.lineCap = "round"
          context.lineJoin = "round"
          context.strokeStyle = color
          context.lineWidth = lineWidth
          context.drawImage(tempCanvas, 0, 0)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen, color, lineWidth])

  // Update context when color or line width changes
  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color
      ctx.lineWidth = tool === "eraser" ? lineWidth * 2 : lineWidth
    }
  }, [ctx, color, lineWidth, tool])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return

    setIsDrawing(true)

    // Get position
    let x, y
    if ("touches" in e) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    setPosition({ x, y })

    // Start new path
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return

    // Get position
    let x, y
    if ("touches" in e) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    // Draw line
    ctx.lineTo(x, y)
    ctx.stroke()

    // Update position
    setPosition({ x, y })
  }

  const stopDrawing = () => {
    if (!ctx) return

    setIsDrawing(false)
    ctx.closePath()
  }

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white/90 p-2 rounded-lg shadow-md">
        <Button
          variant={tool === "pencil" ? "default" : "outline"}
          size="icon"
          onClick={() => setTool("pencil")}
          title="Pencil"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === "eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => setTool("eraser")}
          title="Eraser"
        >
          <Eraser className="h-4 w-4" />
        </Button>

        {/* Color picker */}
        <div className="flex items-center">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
            title="Color"
          />
        </div>

        {/* Line width */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" title="Line Width">
              <div className="w-4 h-4 flex items-center justify-center">
                <div
                  className="rounded-full bg-black"
                  style={{
                    width: `${Math.min(lineWidth, 4)}px`,
                    height: `${Math.min(lineWidth, 4)}px`,
                  }}
                />
                <ChevronDown className="h-3 w-3 ml-1" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="p-2 flex flex-col gap-2">
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number.parseInt(e.target.value))}
                className="w-32"
              />
              <div className="text-xs text-center">{lineWidth}px</div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear button */}
        <Button variant="outline" size="sm" onClick={clearCanvas} title="Clear">
          Clear
        </Button>

        {/* Close button */}
        <Button variant="destructive" size="icon" onClick={onClose} title="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="touch-none cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  )
}

export default DrawingCanvas
