"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"

interface TestResult {
  timestamp: string
  student: string
  readingScore: number
  readingTotal: number
  readingPercentage: number
  readingBand: number
  listeningScore: number
  listeningTotal: number
  listeningPercentage: number
  listeningBand: number
  writingTask1Words: number
  writingTask2Words: number
  overallBand: number
  completed: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Check if user is admin
    const username = sessionStorage.getItem("currentUser")
    const isLoggedIn = sessionStorage.getItem("isLoggedIn")

    if (username === "superadmin8071" && isLoggedIn === "true") {
      setIsAdmin(true)
      loadTestResults()
    } else {
      router.push("/")
    }
  }, [router])

  const loadTestResults = () => {
    try {
      // Load test results from localStorage
      const resultsJSON = localStorage.getItem("testResults")
      if (resultsJSON) {
        const results = JSON.parse(resultsJSON)
        setTestResults(results)
      }
    } catch (error) {
      console.error("Error loading test results:", error)
    }
  }

  const getAverageBand = (band: keyof TestResult) => {
    if (testResults.length === 0) return 0
    const sum = testResults.reduce((acc, result) => acc + result[band], 0)
    return (sum / testResults.length).toFixed(1)
  }

  const getTestsThisWeek = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return testResults.filter((result) => {
      const resultDate = new Date(result.timestamp)
      return resultDate >= oneWeekAgo
    }).length
  }

  if (!isAdmin) {
    return <div className="container mx-auto p-8 text-center">Checking credentials...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => router.push("/")}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testResults.length}</div>
                <p className="text-xs text-muted-foreground">{getTestsThisWeek()} tests this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Reading Band</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageBand("readingBand")}</div>
                <p className="text-xs text-muted-foreground">Out of 9.0 band score</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Listening Band</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageBand("listeningBand")}</div>
                <p className="text-xs text-muted-foreground">Out of 9.0 band score</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Overview of the most recent IELTS test results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Reading</TableHead>
                    <TableHead>Listening</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.slice(0, 5).map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.student}</TableCell>
                      <TableCell>{result.readingBand.toFixed(1)}</TableCell>
                      <TableCell>{result.listeningBand.toFixed(1)}</TableCell>
                      <TableCell>{result.overallBand.toFixed(1)}</TableCell>
                      <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {testResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No test results available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>All Test Results</CardTitle>
              <CardDescription>Complete list of all IELTS test results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Reading</TableHead>
                    <TableHead>Listening</TableHead>
                    <TableHead>Writing (Words)</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.student}</TableCell>
                      <TableCell>
                        {result.readingBand.toFixed(1)} ({result.readingScore}/{result.readingTotal})
                      </TableCell>
                      <TableCell>
                        {result.listeningBand.toFixed(1)} ({result.listeningScore}/{result.listeningTotal})
                      </TableCell>
                      <TableCell>
                        T1: {result.writingTask1Words}, T2: {result.writingTask2Words}
                      </TableCell>
                      <TableCell>{result.overallBand.toFixed(1)}</TableCell>
                      <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {testResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No test results available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Test Analytics</CardTitle>
              <CardDescription>Performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Band Score Distribution</h3>
                  <div className="h-[300px] flex items-end justify-around">
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-500 w-16 h-[200px] rounded-t"></div>
                      <div className="mt-2">Reading</div>
                      <div className="text-sm">{getAverageBand("readingBand")}</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-green-500 w-16 h-[180px] rounded-t"></div>
                      <div className="mt-2">Listening</div>
                      <div className="text-sm">{getAverageBand("listeningBand")}</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-amber-500 w-16 h-[190px] rounded-t"></div>
                      <div className="mt-2">Overall</div>
                      <div className="text-sm">{getAverageBand("overallBand")}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Test Completion Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Average Reading Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {testResults.length > 0
                            ? (
                                testResults.reduce((acc, result) => acc + result.readingPercentage, 0) /
                                testResults.length
                              ).toFixed(1) + "%"
                            : "0%"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Average Listening Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {testResults.length > 0
                            ? (
                                testResults.reduce((acc, result) => acc + result.listeningPercentage, 0) /
                                testResults.length
                              ).toFixed(1) + "%"
                            : "0%"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Average Writing Words</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {testResults.length > 0
                            ? Math.round(
                                testResults.reduce(
                                  (acc, result) => acc + result.writingTask1Words + result.writingTask2Words,
                                  0,
                                ) / testResults.length,
                              )
                            : "0"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
