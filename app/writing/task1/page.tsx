"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavigationButtons } from "@/components/navigation-buttons"
import { TextAnnotator } from "@/components/text-annotator"
import Image from "next/image"

const chartImages = [
  "/images/task1/chart1.png",
  "/images/task1/chart2.png",
  "/images/task1/chart3.png",
  "/images/task1/chart4.png",
  "/images/task1/chart5.png",
  "/images/task1/chart6.png",
]

const chartDescriptions = [
  "The graph below shows average carbon dioxide (CO2) emissions per person in the United Kingdom, Sweden, Italy and Portugal between 1967 and 2007. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  "The chart below shows the number of men and women in further education in Britain in three periods and whether they were studying full-time or part-time. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  "The following maps show the changes in the town of Springer from 1970 until now. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
  "The diagram below shows the stages in the recycling of aluminium drinks cans. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  "The pie charts below give information on the ages of the populations of Oman and Spain in 2005 and projections for 2055. Summarise the information by selecting and reporting the main features and make comparisons where relevant.",
  "The table shows data about underground railway systems in six major cities with date opened, kilometres of route and passenger numbers per year in millions. Summarise the information by selecting and reporting the main features, making comparisons where relevant.",
]

export default function WritingTask1() {
  const router = useRouter()
  const [answer, setAnswer] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [selectedChartIndex, setSelectedChartIndex] = useState(4) // Default to chart5.png (pie charts)
  const [timeLeft, setTimeLeft] = useState(20 * 60) // 20 minutes in seconds

  useEffect(() => {
    // Load saved answer from localStorage if exists
    const savedAnswer = localStorage.getItem("writingTask1Answer")
    if (savedAnswer) {
      setAnswer(savedAnswer)
      countWords(savedAnswer)
    }

    // Load saved chart index if exists
    const savedChartIndex = localStorage.getItem("writingTask1ChartIndex")
    if (savedChartIndex) {
      setSelectedChartIndex(Number.parseInt(savedChartIndex))
    }

    // Load saved time if exists
    const savedTime = localStorage.getItem("writingTask1TimeLeft")
    if (savedTime) {
      setTimeLeft(Number.parseInt(savedTime))
    }

    // Set up timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1
        localStorage.setItem("writingTask1TimeLeft", newTime.toString())
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Save answer to localStorage whenever it changes
    localStorage.setItem("writingTask1Answer", answer)
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
    router.push("/writing/task2")
  }

  const handlePrevious = () => {
    router.push("/test")
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Writing Task 1</CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Word Count: {wordCount}/150</div>
            <div className="text-sm font-medium">Time Left: {formatTime(timeLeft)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <TextAnnotator isWritingSection={true}>
            <div className="mb-6 space-y-4">
              <p className="text-lg font-medium">{chartDescriptions[selectedChartIndex]}</p>
              <p>Write at least 150 words.</p>
              <div className="flex justify-center my-4">
                <div className="relative w-full max-w-2xl h-[400px]">
                  <Image
                    src={chartImages[selectedChartIndex] || "/placeholder.svg"}
                    alt="Task 1 Chart"
                    fill
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </div>
              </div>
            </div>
          </TextAnnotator>

          <Textarea
            placeholder="Write your answer here..."
            className="min-h-[300px] mt-4"
            value={answer}
            onChange={handleAnswerChange}
          />
        </CardContent>
      </Card>

      <NavigationButtons
        onPrevious={handlePrevious}
        onNext={handleNext}
        previousLabel="Previous"
        nextLabel="Next: Task 2"
      />
    </div>
  )
}
