"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function TestCompletePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user completed the test
    const task1Answer = localStorage.getItem("writingTask1Answer")
    const task2Answer = localStorage.getItem("writingTask2Answer")

    if (!task1Answer && !task2Answer) {
      router.push("/")
    }

    // Clear test data
    const clearTestData = () => {
      localStorage.removeItem("writingTask1Answer")
      localStorage.removeItem("writingTask2Answer")
      localStorage.removeItem("ieltsTestState")
      sessionStorage.removeItem("isLoggedIn")
    }

    // Clear data after 5 seconds
    const timer = setTimeout(() => {
      clearTestData()
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  const handleReturnHome = () => {
    // Clear any remaining test data
    localStorage.removeItem("writingTask1Answer")
    localStorage.removeItem("writingTask2Answer")
    localStorage.removeItem("ieltsTestState")
    sessionStorage.removeItem("isLoggedIn")

    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Test Complete</CardTitle>
          <CardDescription>Your test has been completed and results submitted</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Thank you for completing the IELTS test. Your results have been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You will be redirected to the home page in a few seconds.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/")} className="w-full">
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
