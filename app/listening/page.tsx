"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavigationButtons } from "@/components/navigation-buttons"

export default function Listening() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [isLoading, setIsLoading] = useState(true)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Load saved time if exists
    const savedTime = localStorage.getItem("listeningTimeLeft")
    if (savedTime) {
      setTimeLeft(Number.parseInt(savedTime))
    }

    // Set up timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1
        localStorage.setItem("listeningTimeLeft", newTime.toString())
        return newTime
      })
    }, 1000)

    // Simulate audio loading
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)

      // Auto-play audio when loaded
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("Audio playback failed:", err)
          setAudioError(true)
        })
      }
    }, 2000)

    return () => {
      clearInterval(timer)
      clearTimeout(loadingTimeout)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handleNext = () => {
    router.push("/reading")
  }

  const handlePrevious = () => {
    router.push("/test")
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Listening Test</CardTitle>
          <div className="text-right text-sm font-medium">Time Left: {formatTime(timeLeft)}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center items-center min-h-[100px]">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>Loading audio...</p>
                </div>
              ) : audioError ? (
                <div className="text-center text-red-500">
                  <p>Error loading audio. Please try again.</p>
                  <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                    Reload
                  </Button>
                </div>
              ) : (
                <div className="w-full">
                  <audio ref={audioRef} controls className="w-full" controlsList="nodownload">
                    <source src="/sample-audio.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>

            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Sample Listening Questions</h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2">
                    <strong>Question 1:</strong> What is the woman's name?
                  </p>
                  <input type="text" className="border p-2 rounded w-full" placeholder="Type your answer here" />
                </div>
                <div>
                  <p className="mb-2">
                    <strong>Question 2:</strong> Where does the conversation take place?
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q2" /> A. At a restaurant
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q2" /> B. At a library
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q2" /> C. At a university
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q2" /> D. At a train station
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        onPrevious={handlePrevious}
        onNext={handleNext}
        previousLabel="Previous: Instructions"
        nextLabel="Next: Reading"
      />
    </div>
  )
}
