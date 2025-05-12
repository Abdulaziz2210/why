"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavigationButtons } from "@/components/navigation-buttons"
import { TextAnnotator } from "@/components/text-annotator"
import { writingTask2Data } from "@/components/writing-task-data"

export default function WritingTask2() {
  const router = useRouter()
  const [answer, setAnswer] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(40 * 60) // 40 minutes in seconds

  useEffect(() => {
    // Load saved answer from localStorage if exists
    const savedAnswer = localStorage.getItem("writingTask2Answer")
    if (savedAnswer) {
      setAnswer(savedAnswer)
      countWords(savedAnswer)
    }

    // Load saved task index if exists
    const savedTaskIndex = localStorage.getItem("writingTask2Index")
    if (savedTaskIndex) {
      setSelectedTaskIndex(Number.parseInt(savedTaskIndex))
    } else {
      // If no saved index, select a random task
      const randomIndex = Math.floor(Math.random() * writingTask2Data.length)
      setSelectedTaskIndex(randomIndex)
      localStorage.setItem("writingTask2Index", randomIndex.toString())
    }

    // Load saved time if exists
    const savedTime = localStorage.getItem("writingTask2TimeLeft")
    if (savedTime) {
      setTimeLeft(Number.parseInt(savedTime))
    }

    // Set up timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1
        localStorage.setItem("writingTask2TimeLeft", newTime.toString())
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Save answer to localStorage whenever it changes
    localStorage.setItem("writingTask2Answer", answer)
  }, [answer])

  const countWords = (text: string) => {
    const words = text.trim().split(/\s+/)
    const count = text.trim() === "" ? 0 : words.length
    setWordCount(count)
  }

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value
    setAnswer(newAnswer)
    countWords(newAnswer)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handleNext = () => {
    router.push("/test-complete")
  }

  const handlePrevious = () => {
    router.push("/writing/task1")
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Writing Task 2</CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Word Count: {wordCount}/250</div>
            <div className="text-sm font-medium">Time Left: {formatTime(timeLeft)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <TextAnnotator isWritingSection={true}>
            <div className="mb-6 space-y-4">
              <p className="text-lg font-medium">{writingTask2Data[selectedTaskIndex].question}</p>
              <p>Write at least 250 words.</p>
            </div>
          </TextAnnotator>

          <Textarea
            placeholder="Write your answer here..."
            className="min-h-[400px] mt-4"
            value={answer}
            onChange={handleAnswerChange}
          />
        </CardContent>
      </Card>

      <NavigationButtons
        onPrevious={handlePrevious}
        onNext={handleNext}
        previousLabel="Previous: Task 1"
        nextLabel="Complete Test"
      />
    </div>
  )
}
