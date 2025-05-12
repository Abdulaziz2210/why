"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavigationButtons } from "@/components/navigation-buttons"

export default function Reading() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(60 * 60) // 60 minutes in seconds

  useEffect(() => {
    // Load saved time if exists
    const savedTime = localStorage.getItem("readingTimeLeft")
    if (savedTime) {
      setTimeLeft(Number.parseInt(savedTime))
    }

    // Set up timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1
        localStorage.setItem("readingTimeLeft", newTime.toString())
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handleNext = () => {
    router.push("/writing/task1")
  }

  const handlePrevious = () => {
    router.push("/listening")
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reading Test</CardTitle>
          <div className="text-right text-sm font-medium">Time Left: {formatTime(timeLeft)}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg">
              This is a placeholder for the Reading test content. In a real test, you would see passages and questions
              here.
            </p>
            <p>
              The IELTS Reading test consists of 3 passages and 40 questions. You have 60 minutes to complete the test.
            </p>
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Sample Reading Passage</h3>
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt,
                nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies
                tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Question 1:</strong> What is the main idea of the passage?
                </p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q1" /> A. Option A
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q1" /> B. Option B
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q1" /> C. Option C
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q1" /> D. Option D
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        onPrevious={handlePrevious}
        onNext={handleNext}
        previousLabel="Previous: Listening"
        nextLabel="Next: Writing Task 1"
      />
    </div>
  )
}
