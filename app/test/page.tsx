"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ArrowLeft } from "lucide-react"

type TestSection = "reading" | "listening" | "writing"
type ReadingPassage = 1 | 2 | 3
type WritingTask = 1 | 2

type TimerConfig = {
  reading: number
  listening: number
  writing: number
}

// Store test results locally in browser for backup
const storeLocalResults = (results: any) => {
  try {
    const existingResults = JSON.parse(localStorage.getItem("testResults") || "[]")
    existingResults.push({
      timestamp: new Date().toISOString(),
      ...results,
    })
    localStorage.setItem("testResults", JSON.stringify(existingResults))
  } catch (e) {
    console.error("Error storing results locally:", e)
  }
}

// Convert raw score to IELTS band score
const calculateBandScore = (rawScore: number, totalQuestions: number): number => {
  // Return 0 if the raw score is 0
  if (rawScore === 0) return 0

  // IELTS approximate band score conversion
  const percentage = (rawScore / totalQuestions) * 100

  if (percentage >= 90) return 9.0
  if (percentage >= 85) return 8.5
  if (percentage >= 80) return 8.0
  if (percentage >= 75) return 7.5
  if (percentage >= 70) return 7.0
  if (percentage >= 65) return 6.5
  if (percentage >= 60) return 6.0
  if (percentage >= 55) return 5.5
  if (percentage >= 50) return 5.0
  if (percentage >= 45) return 4.5
  if (percentage >= 40) return 4.0
  if (percentage >= 35) return 3.5
  if (percentage >= 30) return 3.0
  if (percentage >= 25) return 2.5

  return 2.0 // Minimum band score (unless score is 0)
}

// Add this CSS to the component to support animation delays
// Add this near the top of the file, after the imports
const audioLoadingStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .animation-delay-300 {
    animation-delay: 300ms;
  }
  .animation-delay-600 {
    animation-delay: 600ms;
  }
`

// Task 2 writing topics
const writingTask2Topics = [
  "Some people believe that universities should focus on providing academic skills, while others think that universities should prepare students for their future careers. Discuss both views and give your opinion.",
  "In many countries, the amount of crime committed by teenagers is increasing. What are the causes of this, and what solutions can you suggest?",
  "Some people think that the government should provide free healthcare for all citizens. Others believe that individuals should pay for their own healthcare. Discuss both views and give your opinion.",
  "Some people think that children should be taught how to manage money at school. Others believe that this is the responsibility of parents. Discuss both views and give your opinion.",
  "Some people believe that technology has made our lives too complex and that we should return to a simpler way of life. To what extent do you agree or disagree?",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.",
  "Some people think that all university students should study whatever they like. Others believe that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both views and give your opinion.",
  "Some people think that governments should spend money on measures to save languages with few speakers from dying out completely. Others think this is a waste of financial resources. Discuss both views and give your opinion.",
  "Some people think that the increasing use of computers and mobile phones for communication has had a negative effect on young people's reading and writing skills. To what extent do you agree or disagree?",
  "Some people think that the government should ban dangerous sports, while others think people should have freedom to do any sports or activity. Discuss both views and give your opinion.",
  "Some people think that the teenage years are the happiest times of most people's lives. Others think that adult life brings more happiness, in spite of greater responsibilities. Discuss both views and give your opinion.",
  "Some people think that parents should teach children how to be good members of society. Others, however, believe that school is the place to learn this. Discuss both views and give your opinion.",
  "Some people think that the main purpose of schools is to turn children into good citizens and workers, rather than to benefit them as individuals. To what extent do you agree or disagree?",
  "Some people think that the main environmental problem facing by the world is the loss of particular species of plants and animals. Others believe that there are more important environmental problems. Discuss both views and give your opinion.",
  "Some people think that the best way to solve global environmental problems is to increase the cost of fuel. To what extent do you agree or disagree?",
  "Some people think that schools should select students according to their academic abilities, while others believe that it is better to have students with different abilities studying together. Discuss both views and give your opinion.",
  "Some people think that the government is wasting money on the arts and that this money could be better spent elsewhere. To what extent do you agree or disagree?",
  "Some people think that all young people should be required to have full-time education until they are at least 18 years old. To what extent do you agree or disagree?",
  "Some people think that in order to prevent illness and disease, governments should make efforts in reducing environmental pollution and housing problems. To what extent do you agree or disagree?",
  "Some people think that the increasing business and cultural contact between countries brings many positive effects. Others say that it causes the loss of national identities. Discuss both sides and give your opinion.",
  "Some people think that young people should be required to do unpaid work helping people in the community. To what extent do you agree or disagree?",
  "Some people think that the news media nowadays have influenced people's lives in negative ways. To what extent do you agree or disagree?",
  "Some people think that robots are very important for humans' future development. Others, however, think that robots are a dangerous invention that could have negative effects on society. Discuss both views and give your opinion.",
  "Some people think that the government should provide assistance to all kinds of artists including painters, musicians and poets. Others think that it is a waste of money. Discuss both views and give your opinion.",
  "Some people think that the government should ban dangerous sports, while others think people should have freedom to do any sports or activity. Discuss both views and give your opinion.",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.",
  "Some people think that children should begin their formal education at a very early age and should spend most of their time studying. Others believe that young children should spend most of their time playing. Discuss both views and give your opinion.",
  "Some people think that it is better to educate boys and girls in separate schools. Others, however, believe that boys and girls benefit more from attending mixed schools. Discuss both views and give your opinion.",
  "Some people think that the government should ban dangerous sports, while others think people should have freedom to do any sports or activity. Discuss both views and give your opinion.",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.",
  "Some people think that the government should ban dangerous sports, while others think people should have freedom to do any sports or activity. Discuss both views and give your opinion.",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.",
  "Some people think that the government should ban dangerous sports, while others think people should have freedom to do any sports or activity. Discuss both views and give your opinion.",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.",
  "Some people think that the government should ban dangerous sports, while others think people should have freedom to do any sports or activity. Discuss both views and give your opinion.",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.",
  "Some people think that the government should ban dangerous sports, while others think people should have freedom to do any sports or activity. Discuss both views and give your opinion.",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.",
  "Some people think that the government should ban dangerous sports, while others think people should have freedom to do any sports or activity. Discuss both views and give your opinion.",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime.",
]

// Task 1 chart images
const task1Images = [
  {
    id: 1,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chart1-JrRCRZzDfFv252b12m5ocFfm9gCmj1.png",
    description: "CO2 emissions per person in the UK, Sweden, Italy, and Portugal from 1967-2007",
  },
  {
    id: 2,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chart2-yUaZPrzLnGqFDg49iHN1Ag3m4nPFMA.png",
    description: "Men and women in further education in Britain across three time periods",
  },
  {
    id: 3,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chart3-CqwkiSOD6M806e18bOZ3wtwi4T0Ckh.png",
    description: "Maps showing changes in the town of Springer from 1970 until now",
  },
  {
    id: 4,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chart4-0LRxqfXNdXWtwN65wdgopqBJFcGvVl.png",
    description: "Diagram showing the recycling process of aluminum drink cans",
  },
  {
    id: 5,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chart5-z4eWtTy3yauEr6UOrcPLkGiKPHmqeq.png",
    description: "Pie charts showing age demographics in Oman and Spain in 2005 and projections for 2055",
  },
  {
    id: 6,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chart6-DXAPPZN9Hnfcak5TlpqjzgH8z5hFsH.png",
    description: "Table showing data about underground railway systems in six major cities",
  },
]

export default function TestPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialSection = (searchParams.get("section") as TestSection) || "reading"

  const [currentSection, setCurrentSection] = useState<TestSection>(initialSection)
  const [currentPassage, setCurrentPassage] = useState<ReadingPassage>(1)
  const [currentListeningSection, setCurrentListeningSection] = useState<number>(1)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isTestActive, setIsTestActive] = useState<boolean>(false)
  const [isTestComplete, setIsTestComplete] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<string>("")
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false)
  const [showFinishConfirmation, setShowFinishConfirmation] = useState<boolean>(false)
  const [isAudioLoaded, setIsAudioLoaded] = useState<boolean>(false)
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false)
  const [currentWritingTask, setCurrentWritingTask] = useState<WritingTask>(1)
  const [selectedTask1Image, setSelectedTask1Image] = useState<number>(0)
  const [selectedTask2Topic, setSelectedTask2Topic] = useState<number>(0)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [testTakers, setTestTakers] = useState<any[]>([])
  const [isAnnotationMode, setIsAnnotationMode] = useState<boolean>(false)
  const writingContentRef = useRef<HTMLDivElement>(null)

  // Reading test answers - 40 questions
  const [readingAnswers, setReadingAnswers] = useState<string[]>(Array(40).fill(""))

  // Correct answers for reading
  const correctReadingAnswers = [
    // Passage 1 (13 questions)
    "TRUE", // 1
    "FALSE", // 2
    "FALSE", // 3
    "TRUE", // 4
    "FALSE", // 5
    "TRUE", // 6
    "NOT GIVEN", // 7
    "46", // 8
    "the human eye", // 9
    "Indo-European", // 10
    "Richard Brocklesby", // 11
    "Royal Institution", // 12
    "gas lighting", // 13

    // Passage 2 (13 questions)
    "v", // 14
    "ii", // 15
    "iv", // 16
    "viii", // 17
    "i", // 18
    "iii", // 19
    "vi", // 20
    "sewing machine", // 21
    "department stores", // 22
    "prices", // 23
    "Europe", // 24
    "C", // 25
    "D", // 26

    // Passage 3 (14 questions)
    "D", // 27
    "L", // 28
    "F", // 29
    "J", // 30
    "I", // 31
    "B", // 32
    "YES", // 33
    "NOT GIVEN", // 34
    "YES", // 35
    "NOT GIVEN", // 36
    "D", // 37
    "A", // 38
    "B", // 39
    "C", // 40
  ]

  // Listening test answers - 40 questions
  const [listeningAnswers, setListeningAnswers] = useState<string[]>(Array(40).fill(""))

  // Correct answers for listening
  const correctListeningAnswers = [
    // Section 1 (10 questions)
    "database", // 1
    "rock", // 2
    "month", // 3
    "25", // 4
    "500", // 5
    "studio", // 6
    "legal", // 7
    "photograph", // 8
    "King", // 9
    "alive", // 10

    // Section 2 (10 questions)
    "A", // 11
    "B", // 12
    "C", // 13
    "C", // 14
    "F", // 15
    "A", // 16
    "D", // 17
    "H", // 18
    "B", // 19
    "G", // 20

    // Section 3 (10 questions)
    "A", // 21
    "C", // 22
    "C", // 23
    "A", // 24
    "C", // 25
    "C", // 26
    "B", // 27
    "C", // 28
    "F", // 29
    "D", // 30

    // Section 4 (10 questions)
    "erosion", // 31
    "fuel", // 32
    "pesticides", // 33
    "rubbish", // 34
    "bamboo", // 35
    "red", // 36
    "nursery", // 37
    "fresh", // 38
    "crab", // 39
    "storm", // 40
  ]

  // Writing test answers
  const [writingAnswer1, setWritingAnswer1] = useState<string>("")
  const [writingAnswer2, setWritingAnswer2] = useState<string>("")

  // Band scores
  const [readingBand, setReadingBand] = useState<number>(0)
  const [listeningBand, setListeningBand] = useState<number>(0)
  const [writingBand, setWritingBand] = useState<number>(0)
  const [overallBand, setOverallBand] = useState<number>(0)

  // Timer configuration in seconds
  const timerConfig: TimerConfig = {
    reading: 60 * 60, // 60 minutes
    listening: 30 * 60, // 30 minutes
    writing: 60 * 60, // 60 minutes
  }

  // For development/testing, use shorter times
  const devTimerConfig: TimerConfig = {
    reading: 3 * 60, // 3 minutes
    listening: 3 * 60, // 3 minutes
    writing: 3 * 60, // 3 minutes
  }

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn")
    const user = sessionStorage.getItem("currentUser") || ""

    if (!isLoggedIn) {
      router.push("/")
    } else {
      setCurrentUser(user)

      // Check if user is admin
      if (user === "superadmin8071") {
        setIsAdmin(true)
        // Fetch test takers
        const testTakers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
        setTestTakers(testTakers)
      }
    }
  }, [router])

  // Initialize timer based on current section
  useEffect(() => {
    if (!isTestActive) {
      // Use development timer in preview mode
      const isDev = process.env.NODE_ENV === "development" || window.location.hostname === "localhost"
      setTimeRemaining(isDev ? devTimerConfig[currentSection] : timerConfig[currentSection])
    }
  }, [currentSection, isTestActive])

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isTestActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
    } else if (isTestActive && timeRemaining === 0) {
      // Move to next section when timer ends
      if (currentSection === "reading" && currentPassage < 3) {
        handleNextPassage()
      } else {
        handleSectionComplete()
      }
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isTestActive, timeRemaining, currentSection, currentPassage])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Randomly select Task 1 image and Task 2 topic when test starts
  useEffect(() => {
    if (isTestActive) {
      // Random Task 1 image (1-6)
      const randomImageIndex = Math.floor(Math.random() * 6) + 1
      setSelectedTask1Image(randomImageIndex)

      // Random Task 2 topic
      const randomTopicIndex = Math.floor(Math.random() * writingTask2Topics.length)
      setSelectedTask2Topic(randomTopicIndex)
    }
  }, [isTestActive])

  const startTest = () => {
    setIsTestActive(true)
  }

  const handleNextPassage = () => {
    if (currentPassage < 3) {
      setCurrentPassage((prev) => (prev + 1) as ReadingPassage)
    }
  }

  const handlePreviousPassage = () => {
    if (currentPassage > 1) {
      setCurrentPassage((prev) => (prev - 1) as ReadingPassage)
    }
  }

  const handleNextListeningSection = () => {
    if (currentListeningSection < 4) {
      setCurrentListeningSection(currentListeningSection + 1)
    }
  }

  const handlePreviousListeningSection = () => {
    if (currentListeningSection > 1) {
      setCurrentListeningSection(currentListeningSection - 1)
    }
  }

  const handleSectionComplete = () => {
    // Move to next section
    if (currentSection === "reading") {
      // Calculate reading band score before moving to next section
      const readingScore = calculateReadingScore()
      const band = calculateBandScore(readingScore, correctReadingAnswers.length)
      setReadingBand(band)

      setCurrentSection("listening")
      setCurrentListeningSection(1)
      setTimeRemaining(process.env.NODE_ENV === "development" ? devTimerConfig.listening : timerConfig.listening)
    } else if (currentSection === "listening") {
      // Calculate listening band score
      const listeningScore = calculateListeningScore()
      const band = calculateBandScore(listeningScore, correctListeningAnswers.length)
      setListeningBand(band)

      setCurrentSection("writing")
      setTimeRemaining(process.env.NODE_ENV === "development" ? devTimerConfig.writing : timerConfig.writing)
    } else if (currentSection === "writing") {
      // Don't rate writing, just count words
      const task1Words = writingAnswer1.split(/\s+/).filter((word) => word.length > 0).length
      const task2Words = writingAnswer2.split(/\s+/).filter((word) => word.length > 0).length

      // Calculate overall band score (average of reading and listening only)
      const overall = (readingBand + listeningBand) / 2
      setOverallBand(Math.round(overall * 10) / 10) // Round to nearest 0.1

      // Test is complete - send results
      finishTest()
    }
  }

  const checkAudioLoaded = () => {
    if (audioRef.current) {
      if (audioRef.current.readyState >= 2) {
        setIsAudioLoaded(true)
        setIsAudioLoading(false)
      } else {
        setIsAudioLoaded(false)
      }
    }
  }

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause()
        setIsAudioPlaying(false)
      } else {
        // First, check if the audio is actually loaded
        if (audioRef.current.readyState < 2) {
          // Audio not loaded yet, try to load it first
          setIsAudioLoading(true)
          audioRef.current.load()

          // Show a message to the user
          alert(
            "Audio is loading. Please try again in a moment. If the issue persists, ensure the audio file exists in the public/audio directory.",
          )
          return
        }

        // Try to play the audio
        try {
          const playPromise = audioRef.current.play()

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsAudioPlaying(true)
                console.log("Audio playback started successfully")
              })
              .catch((error) => {
                console.error("Audio playback failed:", error)
                setIsAudioPlaying(false)

                // Provide a more helpful message
                if (error.name === "NotAllowedError") {
                  alert("Browser blocked autoplay. Please interact with the page first and try again.")
                } else if (error.name === "NotSupportedError") {
                  alert("Audio format not supported by your browser.")
                } else {
                  alert(
                    `Audio playback failed: ${error.message || "Unknown error"}. Please ensure the audio file exists in the public/audio directory.`,
                  )
                }
              })
          }
        } catch (error) {
          console.error("Error playing audio:", error)
          setIsAudioPlaying(false)
          alert(`Error playing audio: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      }
    } else {
      alert("Audio player not initialized. Please refresh the page and try again.")
    }
  }

  // Add this effect to auto-play audio when listening section starts and handle loading
  useEffect(() => {
    // Auto-play audio when listening section starts
    if (currentSection === "listening" && isTestActive && audioRef.current) {
      setIsAudioLoading(true)

      // Check if audio is already loaded
      if (audioRef.current.readyState >= 2) {
        setIsAudioLoaded(true)
        setIsAudioLoading(false)
        tryPlayAudio()
      } else {
        // Set up event listeners for audio loading
        const handleCanPlay = () => {
          setIsAudioLoaded(true)
          setIsAudioLoading(false)
          if (isTestActive && currentSection === "listening") {
            tryPlayAudio()
          }
        }

        audioRef.current.addEventListener("canplay", handleCanPlay)
        audioRef.current.load() // Start loading the audio

        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener("canplay", handleCanPlay)
          }
        }
      }
    }

    function tryPlayAudio() {
      if (!audioRef.current) return

      try {
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsAudioPlaying(true)
              console.log("Audio started automatically")
            })
            .catch((error) => {
              console.error("Auto-play failed:", error)

              // Provide more specific guidance based on the error
              if (error.name === "NotAllowedError") {
                console.log("Browser blocked autoplay due to lack of user interaction")
              }

              // Don't show alert as it might be disruptive, just log to console
              console.log("User needs to click 'Play Audio' button to start the listening test")
            })
        }
      } catch (error) {
        console.error("Error auto-playing audio:", error)
      }
    }
  }, [currentSection, isTestActive, isAudioPlaying])

  // Save test state to localStorage when it changes
  useEffect(() => {
    if (isTestActive) {
      const testState = {
        currentSection,
        currentPassage,
        currentListeningSection,
        timeRemaining,
        readingAnswers,
        listeningAnswers,
        writingAnswer1,
        writingAnswer2,
        currentWritingTask,
        selectedTask1Image,
        selectedTask2Topic,
        timestamp: Date.now(),
      }
      localStorage.setItem("ieltsTestState", JSON.stringify(testState))
    }
  }, [
    isTestActive,
    currentSection,
    currentPassage,
    currentListeningSection,
    timeRemaining,
    readingAnswers,
    listeningAnswers,
    writingAnswer1,
    writingAnswer2,
    currentWritingTask,
    selectedTask1Image,
    selectedTask2Topic,
  ])

  // Restore test state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("ieltsTestState")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        const currentTime = Date.now()
        const timePassed = Math.floor((currentTime - parsedState.timestamp) / 1000)

        // Apply time penalty (3 seconds) for refreshing
        const timeWithPenalty = Math.max(0, parsedState.timeRemaining - timePassed - 3)

        setCurrentSection(parsedState.currentSection)
        setCurrentPassage(parsedState.currentPassage)
        setCurrentListeningSection(parsedState.currentListeningSection)
        setTimeRemaining(timeWithPenalty)
        setReadingAnswers(parsedState.readingAnswers)
        setListeningAnswers(parsedState.listeningAnswers)
        setWritingAnswer1(parsedState.writingAnswer1 || "")
        setWritingAnswer2(parsedState.writingAnswer2 || "")
        setCurrentWritingTask(parsedState.currentWritingTask || 1)
        setSelectedTask1Image(parsedState.selectedTask1Image || 1)
        setSelectedTask2Topic(parsedState.selectedTask2Topic || 0)
        setIsTestActive(true)
      } catch (error) {
        console.error("Error restoring test state:", error)
      }
    }
  }, [])

  const finishTest = async () => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const readingScore = calculateReadingScore()
      const listeningScore = calculateListeningScore()
      const readingBandScore = calculateBandScore(readingScore, correctReadingAnswers.length)
      const listeningBandScore = calculateBandScore(listeningScore, correctListeningAnswers.length)

      // Calculate word counts for writing tasks
      const task1Words = writingAnswer1.split(/\s+/).filter((word) => word.length > 0).length
      const task2Words = writingAnswer2.split(/\s+/).filter((word) => word.length > 0).length

      // Define total questions for reading and listening
      const readingTotal = correctReadingAnswers.length
      const listeningTotal = correctListeningAnswers.length

      const results = {
        student: currentUser,
        readingScore,
        readingTotal,
        readingPercentage: Math.round((readingScore / readingTotal) * 100),
        readingBand: readingBandScore,
        listeningScore,
        listeningTotal,
        listeningPercentage: Math.round((listeningScore / listeningTotal) * 100),
        listeningBand: listeningBandScore,
        writingTask1: writingAnswer1 || "No response provided",
        writingTask1Words: task1Words,
        writingTask2: writingAnswer2 || "No response provided",
        writingTask2Words: task2Words,
        // Calculate overall band score without writing
        overallBand: Math.round(((readingBandScore + listeningBandScore) / 2) * 10) / 10,
        completed: new Date().toLocaleString(),
      }

      // Store results locally in browser for backup
      storeLocalResults(results)

      const message = `
📊 *IELTS Test Results*

👤 *Student*: ${results.student}

📚 *Reading*: ${results.readingScore}/${results.readingTotal} (${results.readingPercentage}%) - Band ${results.readingBand.toFixed(1)}
🎧 *Listening*: ${results.listeningScore}/${results.listeningTotal} (${results.listeningPercentage}%) - Band ${results.listeningBand.toFixed(1)}

✍️ *Writing*:
Task 1: ${task1Words} words
Task 2: ${task2Words} words

🌟 *Overall Band Score*: ${results.overallBand.toFixed(1)}

⏰ *Completed*: ${results.completed}
    `

      // Always log results to console as a reliable fallback
      console.log("========== TEST RESULTS ==========")
      console.log(message)
      console.log("==================================")

      try {
        // Send to API endpoint
        const response = await fetch("/api/send-telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to submit results")
        }
      } catch (apiError) {
        console.error("API route error:", apiError)
        // Continue with test completion even if API fails
      }

      // Show completion message
      setIsTestComplete(true)
      setIsTestActive(false)

      // Clear login session after test completion
      sessionStorage.removeItem("isLoggedIn")
    } catch (error) {
      console.error("Error submitting results:", error)
      setSubmitError("There was an error submitting your results, but your test will still be completed.")

      // Still complete the test even if there's an error
      setTimeout(() => {
        setIsTestComplete(true)
        setIsTestActive(false)
        // Clear login session after test completion
        sessionStorage.removeItem("isLoggedIn")
      }, 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return `${hours > 0 ? `${hours}:` : ""}${minutes < 10 && hours > 0 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`
  }

  const handleReadingAnswerChange = (index: number, value: string) => {
    const newAnswers = [...readingAnswers]
    newAnswers[index] = value
    setReadingAnswers(newAnswers)
  }

  const handleListeningAnswerChange = (index: number, value: string) => {
    const newAnswers = [...listeningAnswers]
    newAnswers[index] = value
    setListeningAnswers(newAnswers)
  }

  const calculateReadingScore = () => {
    return readingAnswers.filter(
      (answer, index) => answer.toLowerCase().trim() === correctReadingAnswers[index].toLowerCase().trim(),
    ).length
  }

  const calculateListeningScore = () => {
    return listeningAnswers.filter(
      (answer, index) => answer.toLowerCase().trim() === correctListeningAnswers[index].toLowerCase().trim(),
    ).length
  }

  const toggleAnnotationMode = () => {
    setIsAnnotationMode(!isAnnotationMode)
  }

  const renderReadingSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Reading Passage {currentPassage}</h3>
        <div className="flex items-center gap-2">
          {/* No annotation tools in reading section */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Passage on the left */}
        <div className="p-4 border rounded-md h-[600px] overflow-y-auto relative">
          <div className="prose dark:prose-invert max-w-none">
            {currentPassage === 1 && (
              <>
                <h2>The last man who knew everything</h2>
                <p>
                  In the 21st century, it would be quite impossible for even the most learned man to know everything.
                  However, as recently as the 18th century, there were those whose knowledge encompassed most of the
                  information available at that time. This is a review of a biography of one such man.
                </p>
                <p>
                  Thomas Young (1773–1829) contributed 63 articles to the great British encyclopaedia, Encyclopaedia
                  Britannica, including 46 biographical entries (mostly on scientists and classical scholars), and
                  substantial essays on 'Bridge' (a card game), 'Egypt', 'Languages' and 'Tides'. Was someone who could
                  write authoritatively about so many subjects a genius, or a dilettante?* In an ambitious biography,
                  Andrew Robinson argues that Young is a good contender to be described as 'the last man who knew
                  everything'. Young has competition, however: the phrase which Robinson uses as the title of his
                  biography of Young also serves as the subtitle of two other recent biographies: Leonard Warren's 1998
                  life of palaeontologist Joseph Leidy (1823–1891) and Paula Findlen's 2004 book on Athanasius Kircher
                  (1602–1680).
                </p>
                <p>
                  Young, of course, did more than write encyclopaedia entries. He presented his first paper, on the
                  human eye, to the prestigious academic institution, the Royal Society of London** at the age of 20 and
                  was elected a Fellow of the Society shortly afterwards. In the paper, which seeks to explain how the
                  eye focuses on objects at varying distances, Young hypothesised that this was achieved by changes in
                  the shape of the lens. He also theorised that light travels in waves, and believed that, to be able to
                  see in colour, there must be three receptors in the eye corresponding to the three 'principal colours'
                  (red, green and violet) to which the retina could respond. All these hypotheses were subsequently
                  proved to be correct. Later in his life, when he was in his forties, Young was instrumental in
                  cracking the code that unlocked the unknown script on the Rosetta Stone, a tablet found in Egypt by
                  the Napoleonic army in 1799. The stone has text in three alphabets: Greek, Egyptian hieroglyphs, and
                  something originally unrecognisable. The unrecognisable script is now known as 'demotic' and, as Young
                  deduced, is related directly to Egyptian hieroglyphs. His initial work on this appeared in the
                  Britannica entry 'Egypt'. In another entry, Young coined the term 'Indo-European' to describe the
                  family of languages spoken throughout most of Europe and northern India. These works are the landmark
                  achievements of a man who was a child prodigy but who, unlike many remarkable children, did not fade
                  into obscurity as an adult.
                </p>
                <p>
                  Born in 1773 in Somerset in England, Young lived with his maternal grandfather from an early age. He
                  devoured books from the age of two and excelled at Latin, Greek, mathematics and natural philosophy
                  (the 18th-century term for science). After leaving school, he was greatly encouraged by Richard
                  Brocklesby, a physician and Fellow of the Royal Society. Following Brocklesby's lead, Young decided to
                  pursue a career in medicine. He studied in London and then moved on to more formal education in
                  Edinburgh, Göttingen and Cambridge. After completing his medical training at the University of
                  Cambridge in 1808, Young set up practice as a physician in London and a few years later was appointed
                  physician at St. George's Hospital.
                </p>
                <p>
                  Young's skill as a physician, however, did not equal his talent as a scholar of natural philosophy or
                  linguistics. In 1801, he had been appointed to a professorship of natural philosophy at the Royal
                  Institution, where he delivered as many as 60 lectures a year. His opinions were requested by civic
                  and national authorities on matters such as the introduction of gas lighting to London streets and
                  methods of ship construction. From 1819, he was superintendent of the Nautical Almanac and secretary
                  to the Board of Longitude. Between 1816 and 1825, he contributed many entries to the Encyclopaedia
                  Britannica, and throughout his career he authored numerous other essays, papers and books.
                </p>
                <p>
                  Young is a perfect subject for a biography — perfect, but daunting. Few men contributed so much to so
                  many technical fields. Robinson's aim is to introduce non- scientists to Young's work and life. He
                  succeeds, providing clear expositions of the technical material (especially that on optics and
                  Egyptian hieroglyphs). Some readers of this book will, like Robinson, find Young's accomplishments
                  impressive; others will see him as some historians have — as a dilettante. Yet despite the rich
                  material presented in this book, readers will not end up knowing Young personally. We catch glimpses
                  of a playful Young, doodling Greek and Latin phrases in his notes on medical lectures and translating
                  the verses that a young lady had written on the walls of a summerhouse into Greek elegiacs. Young was
                  introduced into elite society, attended the theatre and learned to dance and play the flute. In
                  addition, he was an accomplished horseman. However, his personal life looks pale next to his vibrant
                  career and studies.
                </p>
                <p>
                  Young married Eliza Maxwell in 1804, and according to Robinson, 'their marriage was happy and she
                  appreciated his work'. Almost all we know about her is that she sustained her husband through some
                  rancorous disputes about optics and that she worried about money when his medical career was slow to
                  take off. Little evidence survives concerning the complexities of Young's relationships with his
                  mother and father. Robinson does not credit them with shaping Young's extraordinary mind. Despite the
                  lack of details concerning Young's relationships, however, anyone interested in what it means to be a
                  genius should read this book.
                </p>
              </>
            )}

            {currentPassage === 2 && (
              <>
                <h2>The fashion industry</h2>
                <p>
                  <strong>A</strong> The fashion industry is a multibillion-dollar global enterprise devoted to the
                  business of making and selling clothes. It encompasses all types of garments, from designer fashions
                  to ordinary everyday clothing. Because data on the industry are typically reported for national
                  economies, and expressed in terms of its many separate sectors, total figures for world production of
                  textiles* and clothing are difficult to obtain. However, by any measure, the industry accounts for a
                  significant share of world economic output.
                </p>
                <p>
                  <strong>B</strong> The fashion industry is a product of the modern age. Prior to the mid-19th century,
                  virtually all clothing was handmade for individuals, either as home production or on order from
                  dressmakers and tailors. By the beginning of the 20th century, with the development of new
                  technologies such as the sewing machine, the development of the factory system of production, and the
                  growth of department stores and other retail outlets, clothing had increasingly come to be
                  mass-produced in standard sizes, and sold at fixed prices. Although the fashion industry developed
                  first in Europe, today it is highly globalised, with garments often designed in one country,
                  manufactured in another, and sold in a third. For example, an American fashion company might source
                  fabric in China and have the clothes manufactured in Vietnam, finished in Italy, and shipped to a
                  warehouse in the United States for distribution to retail outlets internationally.
                </p>
                <p>
                  <strong>C</strong> One of the first accomplishments of the Industrial Revolution in the 18th century
                  was the partial automation of the spinning and weaving of wool, cotton, silk and other natural fibres.
                  Today, these processes are highly automated and carried out by computer-controlled, high-speed
                  machinery, and fabrics made from both natural fibres and synthetic fibres (such as nylon, acrylic, and
                  polyester) are produced. A growing interest in sustainable fashion (or 'eco-fashion') has led to
                  greater use of environmentally friendly fibres, such as hemp. In addition, high-tech synthetic fabrics
                  offer such properties as moisture absorption, stain resistance, retention or dissipation of body heat,
                  and protection against fire, weapons, cold, ultraviolet radiation, and other hazards. Fabrics are also
                  produced with a wide range of visual effects through dyeing, weaving, printing, and other processes.
                  Together with fashion forecasters, fabric manufacturers work well in advance of the clothing
                  production cycle, to create fabrics with colours, textures, and other qualities that anticipate
                  consumer demand.
                </p>
                <p>
                  <strong>D</strong> Historically, very few fashion designers have become famous brands such as Coco
                  Chanel or Calvin Klein, who have been responsible for prestigious high-fashion collections. These
                  designers are influential in the fashion world, but, contrary to popular belief, they do not dictate
                  new fashions; rather, they endeavour to design clothes that will meet consumer demand. The vast
                  majority of designers work in anonymity for manufacturers, as part of design teams, adapting designs
                  into marketable garments for average consumers. They draw inspiration from a wide range of sources,
                  including film and television costumes, street clothing, and active sportswear.
                </p>
                <p>
                  The fashion industry's traditional design methods, such as paper sketches and the draping of fabric on
                  mannequins, have been supplemented or replaced by computer- assisted design techniques. These allow
                  designers to rapidly make changes to a proposed design, and instantaneously share the proposed changes
                  with colleagues – whether they are in the next room or on another continent.
                </p>
                <p>
                  <strong>E</strong> An important stage in garment production is the translation of the clothing design
                  into templates, in a range of sizes, for cutting the cloth. Because the proportions of the human body
                  change with increases or decreases in weight, templates cannot simply be scaled up or down. Template
                  making was traditionally a highly skilled profession. Today, despite innovations in computer
                  programming, designs in larger sizes are difficult to adjust for every body shape. Whatever the size,
                  the template – whether drawn on paper or programmed as a set of computer instructions – determines how
                  fabric is cut into the pieces that will be joined to make a garment. For all but the most expensive
                  clothing, fabric cutting is accomplished by computer-guided knives or high- intensity lasers that can
                  cut many layers of fabric at once.
                </p>
                <p>
                  <strong>F</strong> The next stage of production is the assembly process. Some companies use their own
                  production facilities for some or all of the manufacturing process, but the majority rely on
                  separately owned manufacturing firms or contractors to produce garments to their specifications. In
                  the field of women's clothing, manufacturers typically produce several product lines a year, which
                  they deliver to retailers on predetermined dates. Technological innovation, including the development
                  of computer-guided machinery, has resulted in the automation of some stages of assembly. Nevertheless,
                  the fundamental process of sewing remains labour-intensive. In the late 20th century, China emerged as
                  the world's largest producer of clothing because of its low labour costs and highly disciplined
                  workforce.
                </p>
                <p>
                  Assembled items then go through various processes collectively known as 'finishing'. These include the
                  addition of decorative elements, fasteners, brand-name labels, and other labels (often legally
                  required) specifying fibre content, laundry instructions, and country of manufacture. Finished items
                  are then pressed and packed for shipment.
                </p>
                <p>
                  <strong>G</strong> For much of the period following World War II, trade in textiles and garments was
                  strictly regulated by purchasing countries, which imposed quotas and tariffs. Since the 1980s, these
                  protectionist measures, which were intended (ultimately without success) to prevent textile and
                  clothing production from moving from high-wage to low-wage countries, have gradually been abandoned.
                  They have been replaced by a free-trade approach, under the regulatory control of global
                  organisations. The advent of metal shipping containers and relatively inexpensive air freight have
                  also made it possible for production to be closely tied to market conditions, even across
                  globe-spanning distances.
                </p>
              </>
            )}

            {currentPassage === 3 && (
              <>
                <h2>How a prehistoric predator took to the skies</h2>
                <p>
                  Is that a bird in the sky? A plane? No, it's a pterosaur. Kate Thomas meets Professor Matthew
                  Wilkinson, who built a life-size model to find out how this prehistoric predator ever got off the
                  ground.
                </p>
                <p>
                  Pterosaurs existed from the Triassic period, 220 million years ago, to the end of the Cretaceous
                  period, 65 million years ago, when South America pulled away from Africa and the South Atlantic was
                  formed. They are among the least understood of all the extinct reptiles that once spent their lives in
                  the skies while the dinosaurs dominated the land. Pterosaurs had no feathers, but at least part of
                  their bodies was covered in hair, not unlike bats. Some believe this is an indication they were
                  warm-blooded. Researchers also debate whether pterosaurs travelled on the ground by walking on their
                  hind legs, like birds, or by using all fours, relying on their three-toed front feet as well as their
                  four-toed rear feet.
                </p>
                <p>
                  Pterosaurs were vertebrates, meaning they were the first species possessing backbones to become
                  airborne, but scientists have never quite understood their flight technique. How, they wondered, did
                  such a heavy creature ever manage to take off? How could a wing that appears to have been supported by
                  fine, hollow bones have carried one into the sky? Then came the discovery of a site in Brazil's
                  Araripe basin. Here, not only were hundreds of fossils of amphibians* and other reptiles found, but
                  archaeologists unearthed a number of very well-preserved pterosaurs. The anhanguera – a fish-eating
                  sub-species of pterosaur that ruled the skies in the Cretaceous period – was among them. With a
                  wingspan of up to 12 metres, they would have made an amazing sight in the sky – had any human been
                  there to witness it. 'I've been studying pterosaurs for about eight years now,' says Dr Matthew
                  Wilkinson, a professor of zoology at Cambridge University. With an anhanguera fossil as his model,
                  Wilkinson began gradually reconstructing its skeletal structure in his Cambridge studio. The
                  probability of finding three-dimensional pterosaur fossils anywhere is slim. 'That was quite a find,'
                  he says. 'Their bones are usually crushed to dust.' Once the structure was complete, it inspired him
                  to make a robot version as a way to understand the animal's locomotion. With a team of model-makers,
                  he has built a remote-controlled pterosaur in his studio. 'Fossils show just how large these creatures
                  were. I've always been interested in how they managed to launch themselves, so I thought the real test
                  would be to actually build one and fly it.'
                </p>
                <p>
                  Wilkinson hasn't been alone in his desire to recreate a prehistoric beast. Swiss scientists recently
                  announced they had built an amphibious robot that could walk on land and swim in water using the sort
                  of backbone movements that must have been employed by the first creatures to crawl from the sea. But
                  Wilkinson had the added complication of working out his beast's flight technique. Unlike those of bats
                  or flying squirrels, pterosaur wings – soft, stretchy membranes of skin tissue – are thought to have
                  reached from the chest right to the ankle, reinforced by fibres that stiffened the wing and prevented
                  tearing. Smaller subspecies flapped their wings during takeoff. That may have explained the creatures'
                  flexibility, but it did not answer the most pressing question: how did such heavy animals manage to
                  launch themselves into the sky? Working with researchers in London and Berlin, Wilkinson began to
                  piece together the puzzle.
                </p>
                <p>
                  It emerged that the anhanguera had an elongated limb called the pteroid. It had previously been
                  thought the pteroid pointed towards the shoulder of the creature and supported a soft forewing in
                  front of the arm. But if that were the case, the forewing would have been too small and ineffectual
                  for flight. However, to the surprise of many scientists, fossils from the Araripe basin showed the
                  pteroid possibly faced the opposite way, creating a much greater forewing that would have caught the
                  air, working in the same way as the flaps on the wings of an aeroplane. So, with both feet on the
                  ground, the anhanguera might have simply faced into the wind, spread its wings and risen up into the
                  sky. Initial trials in wind tunnels proved the point – models of pterosaurs with forward-facing
                  pteroids were not only adept at gliding, but were agile flyers in spite of their size. 'This high-lift
                  capability would have significantly reduced the minimum flight speed, allowing even the largest forms
                  to take off without difficulty,' Wilkinson says. 'It would have enabled them to glide very slowly and
                  may have been instrumental in the evolution of large size by the pterosaurs.'
                </p>
                <p>
                  Resting in the grass at the test site near Cambridge, the robot-model's wings ripple in the wind. In
                  flight, the flexible membrane, while much stiffer than the real thing, allows for a smooth takeoff and
                  landing. But the model has been troubled by other mechanical problems. 'Unlike an aircraft, which is
                  stabilised by the tail wing at the back, the model is stabilised by its head, which means it can start
                  spinning around. That's the most problematic bit as far as we're concerned,' Wilkinson says. 'We've
                  had to take it flying without the head so far.' When it flies with its head attached, Wilkinson will
                  finally have proved his point.
                </p>
                <p>
                  So what's next for the zoologist – perhaps a full-size Tyrannosaurus rex? 'No,' he tells me. 'We're
                  desperate to build really big pterosaurs. I'm talking creatures with even greater wingspans, weighing
                  a quarter of a ton. But,' he adds, just as one begins to fear for the safety and stress levels of
                  pilots landing nearby at Cambridge City Airport, 'it's more likely we'll start off with one of the
                  smaller, flapping pterosaurs.' This is certainly more reassuring. Let's hope he is content to leave it
                  at that.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Questions on the right */}
        <div className="p-4 border rounded-md h-[600px] overflow-y-auto relative">
          <div className="space-y-6 text-lg">
            {currentPassage === 1 && (
              <>
                <h3 className="text-xl font-semibold">Questions 1-7</h3>
                <p className="mb-4">
                  Do the following statements agree with the information given in Reading Passage 1?
                </p>
                <p className="mb-2">
                  In boxes 1-7 on your answer sheet, write:
                  <br />
                  <strong>TRUE</strong> if the statement agrees with the information
                  <br />
                  <strong>FALSE</strong> if the statement contradicts the information
                  <br />
                  <strong>NOT GIVEN</strong> if there is no information on this
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      1. Other people have been referred to as 'the last man who knew everything'.
                    </p>
                    <Input
                      value={readingAnswers[0]}
                      onChange={(e) => handleReadingAnswerChange(0, e.target.value)}
                      placeholder="TRUE / FALSE / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      2. The fact that Young's childhood brilliance continued into adulthood was normal.
                    </p>
                    <Input
                      value={readingAnswers[1]}
                      onChange={(e) => handleReadingAnswerChange(1, e.target.value)}
                      placeholder="TRUE / FALSE / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      3. Young's talents as a doctor are described as surpassing his other skills.
                    </p>
                    <Input
                      value={readingAnswers[2]}
                      onChange={(e) => handleReadingAnswerChange(2, e.target.value)}
                      placeholder="TRUE / FALSE / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      4. Young's advice was sought by several bodies responsible for local and national matters.
                    </p>
                    <Input
                      value={readingAnswers[3]}
                      onChange={(e) => handleReadingAnswerChange(3, e.target.value)}
                      placeholder="TRUE / FALSE / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      5. All Young's written works were published in the Encyclopaedia Britannica.
                    </p>
                    <Input
                      value={readingAnswers[4]}
                      onChange={(e) => handleReadingAnswerChange(4, e.target.value)}
                      placeholder="TRUE / FALSE / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">6. Young was interested in a range of social pastimes.</p>
                    <Input
                      value={readingAnswers[5]}
                      onChange={(e) => handleReadingAnswerChange(5, e.target.value)}
                      placeholder="TRUE / FALSE / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">7. Young suffered from poor health in his later years.</p>
                    <Input
                      value={readingAnswers[6]}
                      onChange={(e) => handleReadingAnswerChange(6, e.target.value)}
                      placeholder="TRUE / FALSE / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-6">Questions 8-13</h3>
                <p className="mb-4">
                  Answer the questions below.
                  <br />
                  Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      8. How many life stories did Thomas Young write for the Encyclopaedia Britannica?
                    </p>
                    <Input
                      value={readingAnswers[7]}
                      onChange={(e) => handleReadingAnswerChange(7, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">9. What was the subject of Thomas Young's first academic paper?</p>
                    <Input
                      value={readingAnswers[8]}
                      onChange={(e) => handleReadingAnswerChange(8, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">10. What name did Young give to a group of languages?</p>
                    <Input
                      value={readingAnswers[9]}
                      onChange={(e) => handleReadingAnswerChange(9, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">11. Who inspired Young to enter the medical profession?</p>
                    <Input
                      value={readingAnswers[10]}
                      onChange={(e) => handleReadingAnswerChange(10, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">12. At which place of higher learning did Young hold a teaching position?</p>
                    <Input
                      value={readingAnswers[11]}
                      onChange={(e) => handleReadingAnswerChange(11, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      13. What was the improvement to London roads on which Young's ideas were sought?
                    </p>
                    <Input
                      value={readingAnswers[12]}
                      onChange={(e) => handleReadingAnswerChange(12, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}

            {currentPassage === 2 && (
              <>
                <h3 className="text-xl font-semibold">Questions 14-20</h3>
                <p className="mb-4">
                  Reading Passage 2 has seven sections, A-G.
                  <br />
                  Choose the correct heading for each section from the list of headings below.
                </p>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md mb-4">
                  <p className="font-medium text-lg">List of Headings</p>
                  <ol className="list-roman pl-5 mt-2 text-lg">
                    <li>How new clothing styles are created</li>
                    <li>The rise of the fashion industry</li>
                    <li>Joining the garment pieces together</li>
                    <li>Producing materials with a range of features</li>
                    <li>The importance of the fashion industry</li>
                    <li>Factors affecting international commerce</li>
                    <li>The attractions of becoming a fashion model</li>
                    <li>Making patterns for people with different figures</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">14. Section A</p>
                    <Input
                      value={readingAnswers[13]}
                      onChange={(e) => handleReadingAnswerChange(13, e.target.value)}
                      placeholder="Enter heading number (i-viii)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">15. Section B</p>
                    <Input
                      value={readingAnswers[14]}
                      onChange={(e) => handleReadingAnswerChange(14, e.target.value)}
                      placeholder="Enter heading number (i-viii)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">16. Section C</p>
                    <Input
                      value={readingAnswers[15]}
                      onChange={(e) => handleReadingAnswerChange(15, e.target.value)}
                      placeholder="Enter heading number (i-viii)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">17. Section D</p>
                    <Input
                      value={readingAnswers[16]}
                      onChange={(e) => handleReadingAnswerChange(16, e.target.value)}
                      placeholder="Enter heading number (i-viii)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">18. Section E</p>
                    <Input
                      value={readingAnswers[17]}
                      onChange={(e) => handleReadingAnswerChange(17, e.target.value)}
                      placeholder="Enter heading number (i-viii)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">19. Section F</p>
                    <Input
                      value={readingAnswers[18]}
                      onChange={(e) => handleReadingAnswerChange(18, e.target.value)}
                      placeholder="Enter heading number (i-viii)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">20. Section G</p>
                    <Input
                      value={readingAnswers[19]}
                      onChange={(e) => handleReadingAnswerChange(19, e.target.value)}
                      placeholder="Enter heading number (i-viii)"
                      className="mt-2"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-6">Questions 21-24</h3>
                <p className="mb-4">
                  Complete the summary below.
                  <br />
                  Choose NO MORE THAN TWO WORDS from the passage for each answer.
                </p>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md mb-4">
                  <p className="font-medium text-lg">The development of a modern fashion industry</p>
                  <p className="mt-2 text-lg">
                    Up until the middle of the 19th century, people generally wore handmade clothes. After that the
                    situation changed, and by the 20th century many clothes were mass produced. This development was
                    partly due to inventions like the 21 ........................... It was also the result of general
                    changes in manufacturing systems, as well as the spread of shops like 22 ................... The
                    changes also led to the standardisation of sizes and 23 ........................... Today, despite
                    the fact that the fashion industry originated in 24 ........................... it has become a
                    truly international enterprise.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">21.</p>
                    <Input
                      value={readingAnswers[20]}
                      onChange={(e) => handleReadingAnswerChange(20, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">22.</p>
                    <Input
                      value={readingAnswers[21]}
                      onChange={(e) => handleReadingAnswerChange(21, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">23.</p>
                    <Input
                      value={readingAnswers[22]}
                      onChange={(e) => handleReadingAnswerChange(22, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">24.</p>
                    <Input
                      value={readingAnswers[23]}
                      onChange={(e) => handleReadingAnswerChange(23, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-6">Questions 25 and 26</h3>
                <p className="mb-4 text-lg">Choose TWO letters, A-E.</p>
                <p className="mb-4 text-lg">
                  Which TWO of the following statements does the writer make about garment assembly?
                </p>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md mb-4">
                  <div className="space-y-2 text-lg">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">A.</span>
                      <p>The majority of sewing is done by computer-operated machines.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">B.</span>
                      <p>Highly skilled workers are the most important requirement.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">C.</span>
                      <p>Most businesses use other companies to manufacture their products.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">D.</span>
                      <p>Fasteners and labels are attached after the clothes have been made up.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">E.</span>
                      <p>Manufacturers usually produce one range of women's clothing annually.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">25. First choice</p>
                    <Input
                      value={readingAnswers[24]}
                      onChange={(e) => handleReadingAnswerChange(24, e.target.value)}
                      placeholder="Enter letter (A-E)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">26. Second choice</p>
                    <Input
                      value={readingAnswers[25]}
                      onChange={(e) => handleReadingAnswerChange(25, e.target.value)}
                      placeholder="Enter letter (A-E)"
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}

            {currentPassage === 3 && (
              <>
                <h3 className="text-xl font-semibold">Questions 27-32</h3>
                <p className="mb-4 text-lg">Complete the summary using the list of words, A-L, below.</p>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md mb-4">
                  <p className="mb-2 text-lg">
                    Pterosaurs are believed to have existed until the end of the Cretaceous period. They are classed as
                    27 ......................... which were capable of flight, although, unlike modern species, they had
                    some 28 ......................... which is evidence of their having had warm blood.
                  </p>
                  <p className="mb-2 text-lg">
                    There are two theories as to how they moved on land: perhaps with all their feet or by using their
                    29.......................... only. Another mystery has concerned the ability of the pterosaur to fly
                    despite its immense 30 .......................... and the fact that the bones making up the wing did
                    not have great 31 .......................... Thanks to reptile fossils found in Brazil, we now know
                    that the subspecies known as anhanguera had wings that were 12 metres across and that it mainly
                    survived on 32 ..................
                  </p>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-lg">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">A</span>
                      <p>front feet</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">B</span>
                      <p>fish</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">C</span>
                      <p>dinosaurs</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">D</span>
                      <p>reptiles</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">E</span>
                      <p>flexibility</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">F</span>
                      <p>hind legs</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">G</span>
                      <p>amphibians</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">H</span>
                      <p>birds</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">I</span>
                      <p>strength</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">J</span>
                      <p>weight</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">K</span>
                      <p>tail</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">L</span>
                      <p>hair</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">27.</p>
                    <Input
                      value={readingAnswers[26]}
                      onChange={(e) => handleReadingAnswerChange(26, e.target.value)}
                      placeholder="Enter letter (A-L)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">28.</p>
                    <Input
                      value={readingAnswers[27]}
                      onChange={(e) => handleReadingAnswerChange(27, e.target.value)}
                      placeholder="Enter letter (A-L)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">29.</p>
                    <Input
                      value={readingAnswers[28]}
                      onChange={(e) => handleReadingAnswerChange(28, e.target.value)}
                      placeholder="Enter letter (A-L)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">30.</p>
                    <Input
                      value={readingAnswers[29]}
                      onChange={(e) => handleReadingAnswerChange(29, e.target.value)}
                      placeholder="Enter letter (A-L)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">31.</p>
                    <Input
                      value={readingAnswers[30]}
                      onChange={(e) => handleReadingAnswerChange(30, e.target.value)}
                      placeholder="Enter letter (A-L)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">32.</p>
                    <Input
                      value={readingAnswers[31]}
                      onChange={(e) => handleReadingAnswerChange(31, e.target.value)}
                      placeholder="Enter letter (A-L)"
                      className="mt-2"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-6">Questions 33-36</h3>
                <p className="mb-4 text-lg">
                  Do the following statements agree with the claims of the writer in Reading Passage 3?
                </p>
                <p className="mb-2 text-lg">
                  In boxes 33-36 on your answer sheet, write:
                  <br />
                  <strong>YES</strong> if the statement agrees with the claims of the writer
                  <br />
                  <strong>NO</strong> if the statement contradicts the claims of the writer
                  <br />
                  <strong>NOT GIVEN</strong> if it is impossible to say what the writer thinks about this
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      33. It is rare to find a fossil of a pterosaur that clearly shows its skeleton.
                    </p>
                    <Input
                      value={readingAnswers[32]}
                      onChange={(e) => handleReadingAnswerChange(32, e.target.value)}
                      placeholder="YES / NO / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      34. The reason for building the model was to prove pterosaurs flew for long distances.
                    </p>
                    <Input
                      value={readingAnswers[33]}
                      onChange={(e) => handleReadingAnswerChange(33, e.target.value)}
                      placeholder="YES / NO / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      35. It is possible that pterosaur species achieved their wing size as a result of the pteroid.
                    </p>
                    <Input
                      value={readingAnswers[34]}
                      onChange={(e) => handleReadingAnswerChange(34, e.target.value)}
                      placeholder="YES / NO / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      36. Wilkinson has made several unsuccessful replicas of the pterosaur's head.
                    </p>
                    <Input
                      value={readingAnswers[35]}
                      onChange={(e) => handleReadingAnswerChange(35, e.target.value)}
                      placeholder="YES / NO / NOT GIVEN"
                      className="mt-2"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-6">Questions 37-40</h3>
                <p className="mb-4 text-lg">Choose the correct letter, A, B, C or D.</p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      37. What was Professor Wilkinson's main problem, according to the third paragraph?
                    </p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>Early amphibians had a more complex structure than pterosaurs.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>Pterosaur wings could easily be damaged while on the ground.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>Flying squirrels and bats were better adapted to flying than pterosaurs.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">D</span>
                        <p>Large pterosaurs were not able to take off like other flying animals.</p>
                      </div>
                    </div>
                    <Input
                      value={readingAnswers[36]}
                      onChange={(e) => handleReadingAnswerChange(36, e.target.value)}
                      placeholder="Enter letter (A-D)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      38. What did Professor Wilkinson discover about a bone in pterosaurs called a pteroid?
                    </p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>It was in an unexpected position.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>It existed only in large species of pterosaurs.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>It allowed pterosaurs to glide rather than fly.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">D</span>
                        <p>It increased the speed pterosaurs could reach in the air.</p>
                      </div>
                    </div>
                    <Input
                      value={readingAnswers[37]}
                      onChange={(e) => handleReadingAnswerChange(37, e.target.value)}
                      placeholder="Enter letter (A-D)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      39. According to the writer, the main problem with the remote-controlled 'pterosaur' is that
                    </p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>it has been unable to leave the ground so far.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>it cannot be controlled when its head is attached.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>its wing material is not flexible enough.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">D</span>
                        <p>the force of the wind may affect its test results.</p>
                      </div>
                    </div>
                    <Input
                      value={readingAnswers[38]}
                      onChange={(e) => handleReadingAnswerChange(38, e.target.value)}
                      placeholder="Enter letter (A-D)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">40. What does 'it' in the last sentence refer to?</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>The information the tests have revealed</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>Wilkinson's sense of achievement</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>Wilkinson's desire to build models</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">D</span>
                        <p>The comparison between types of models</p>
                      </div>
                    </div>
                    <Input
                      value={readingAnswers[39]}
                      onChange={(e) => handleReadingAnswerChange(39, e.target.value)}
                      placeholder="Enter letter (A-D)"
                      className="mt-3"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        {currentPassage > 1 ? (
          <Button onClick={handlePreviousPassage}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Passage
          </Button>
        ) : (
          <div></div> // Empty div to maintain flex spacing
        )}

        {currentPassage < 3 ? (
          <Button onClick={handleNextPassage}>
            Next Passage <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSectionComplete}>
            Next Section <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )

  const renderListeningSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Listening Section {currentListeningSection}</h3>
        <div className="flex items-center gap-2">
          {/* No annotation tools in listening section */}
        </div>
      </div>

      <audio
        ref={audioRef}
        src="/audio/listening-test.mp3"
        preload="auto"
        onCanPlay={() => setIsAudioLoaded(true)}
        onLoadStart={() => setIsAudioLoading(true)}
      />

      {isAudioLoading && !isAudioLoaded && (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-700 border-t-primary rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-b-primary rounded-full animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium">Loading audio</span>
            <span className="animate-pulse">.</span>
            <span className="animate-pulse animation-delay-300">.</span>
            <span className="animate-pulse animation-delay-600">.</span>
          </div>
        </div>
      )}

      {(!isAudioLoading || isAudioLoaded) && (
        <div className="p-4 border rounded-md w-full relative">
          <div className="space-y-6 text-lg">
            {currentListeningSection === 1 && (
              <>
                <h3 className="text-xl font-semibold">Questions 1-10</h3>
                <p className="mb-4">Complete the notes below.</p>
                <p className="mb-2">Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.</p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      <strong>Example</strong>
                      <br />
                      Type of club: <span className="font-semibold">Photography</span>
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Name of club: City and 1 ...........................</p>
                    <Input
                      value={listeningAnswers[0]}
                      onChange={(e) => handleListeningAnswerChange(0, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Main subject: 2 ...........................</p>
                    <Input
                      value={listeningAnswers[1]}
                      onChange={(e) => handleListeningAnswerChange(1, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Day of meeting: first Tuesday of the 3 ...........................</p>
                    <Input
                      value={listeningAnswers[2]}
                      onChange={(e) => handleListeningAnswerChange(2, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Cost per session: £ 4 ...........................</p>
                    <Input
                      value={listeningAnswers[3]}
                      onChange={(e) => handleListeningAnswerChange(3, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Annual fee: £ 5 ...........................</p>
                    <Input
                      value={listeningAnswers[4]}
                      onChange={(e) => handleListeningAnswerChange(4, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Meeting room: the 6 ...........................</p>
                    <Input
                      value={listeningAnswers[5]}
                      onChange={(e) => handleListeningAnswerChange(5, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Contact: the 7 ........................... advisor</p>
                    <Input
                      value={listeningAnswers[6]}
                      onChange={(e) => handleListeningAnswerChange(6, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Bring a 8 ........................... to the first meeting</p>
                    <Input
                      value={listeningAnswers[7]}
                      onChange={(e) => handleListeningAnswerChange(7, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Club leader: Ms 9 ...........................</p>
                    <Input
                      value={listeningAnswers[8]}
                      onChange={(e) => handleListeningAnswerChange(8, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">She is still 10 ...........................</p>
                    <Input
                      value={listeningAnswers[9]}
                      onChange={(e) => handleListeningAnswerChange(9, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}

            {currentListeningSection === 2 && (
              <>
                <h3 className="text-xl font-semibold">Questions 11-20</h3>
                <p className="mb-4">
                  What change has been made to each of the following items in the park?
                  <br />
                  Choose TEN answers from the box and write the correct letter, A-K, next to questions 11-20.
                </p>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-lg">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">A</span>
                      <p>extended</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">B</span>
                      <p>improved</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">C</span>
                      <p>shortened</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">D</span>
                      <p>modernised</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">E</span>
                      <p>widened</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">F</span>
                      <p>relocated</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">G</span>
                      <p>added</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">H</span>
                      <p>removed</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">I</span>
                      <p>replaced</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">J</span>
                      <p>renovated</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">K</span>
                      <p>redesigned</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">11. flower garden</p>
                    <Input
                      value={listeningAnswers[10]}
                      onChange={(e) => handleListeningAnswerChange(10, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">12. main entrance</p>
                    <Input
                      value={listeningAnswers[11]}
                      onChange={(e) => handleListeningAnswerChange(11, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">13. playground</p>
                    <Input
                      value={listeningAnswers[12]}
                      onChange={(e) => handleListeningAnswerChange(12, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">14. boating lake</p>
                    <Input
                      value={listeningAnswers[13]}
                      onChange={(e) => handleListeningAnswerChange(13, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">15. path around lake</p>
                    <Input
                      value={listeningAnswers[14]}
                      onChange={(e) => handleListeningAnswerChange(14, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">16. wooden bridge</p>
                    <Input
                      value={listeningAnswers[15]}
                      onChange={(e) => handleListeningAnswerChange(15, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">17. cafe</p>
                    <Input
                      value={listeningAnswers[16]}
                      onChange={(e) => handleListeningAnswerChange(16, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">18. park theatre</p>
                    <Input
                      value={listeningAnswers[17]}
                      onChange={(e) => handleListeningAnswerChange(17, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">19. car park</p>
                    <Input
                      value={listeningAnswers[18]}
                      onChange={(e) => handleListeningAnswerChange(18, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">20. toilets</p>
                    <Input
                      value={listeningAnswers[19]}
                      onChange={(e) => handleListeningAnswerChange(19, e.target.value)}
                      placeholder="Enter letter (A-K)"
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}

            {currentListeningSection === 3 && (
              <>
                <h3 className="text-xl font-semibold">Questions 21-30</h3>
                <p className="mb-4">Choose the correct letter, A, B or C.</p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">21. What is Brian going to do before the course starts?</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>attend a class</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>go to a meeting</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>write a report</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[20]}
                      onChange={(e) => handleListeningAnswerChange(20, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">22. Brian and Jenny agree that one problem with the design course is that</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>not enough time is allowed</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>the tutor is inexperienced</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>the aims are too ambitious</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[21]}
                      onChange={(e) => handleListeningAnswerChange(21, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">23. What does Jenny say about her current design work?</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>It is very varied</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>It is rather stressful</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>It is fairly challenging</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[22]}
                      onChange={(e) => handleListeningAnswerChange(22, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">24. Jenny thinks it would be a good idea to</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>explain some basic theory</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>show some historical examples</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>set some practical exercises</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[23]}
                      onChange={(e) => handleListeningAnswerChange(23, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">25. What does Brian say about his last design project?</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>It was very demanding</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>It was rather simple</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>It was fairly repetitive</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[24]}
                      onChange={(e) => handleListeningAnswerChange(24, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">26. Brian and Jenny agree they need to find out</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>how many students are on the course</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>what level the students are at</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>what kind of work the students do</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[25]}
                      onChange={(e) => handleListeningAnswerChange(25, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">27. What does Jenny say about the course organiser?</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>He is very helpful</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>He is rather inefficient</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>He is fairly new to the job</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[26]}
                      onChange={(e) => handleListeningAnswerChange(26, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">28. Brian and Jenny agree that the best approach is to</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>follow the organiser's plan</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>develop their own framework</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>invite suggestions from students</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[27]}
                      onChange={(e) => handleListeningAnswerChange(27, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">29. Brian is worried about</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>managing student behaviour</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>losing student interest</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>finishing the syllabus</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[28]}
                      onChange={(e) => handleListeningAnswerChange(28, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">30. What does Jenny suggest they should do next?</p>
                    <div className="space-y-2 mt-2 text-lg">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">A</span>
                        <p>contact the course organiser</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">B</span>
                        <p>prepare the first class</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">C</span>
                        <p>visit a design company</p>
                      </div>
                    </div>
                    <Input
                      value={listeningAnswers[29]}
                      onChange={(e) => handleListeningAnswerChange(29, e.target.value)}
                      placeholder="Enter letter (A-C)"
                      className="mt-3"
                    />
                  </div>
                </div>
              </>
            )}

            {currentListeningSection === 4 && (
              <>
                <h3 className="text-xl font-semibold">Questions 31-40</h3>
                <p className="mb-4">Complete the notes below.</p>
                <p className="mb-2">Write NO MORE THAN TWO WORDS for each answer.</p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      <strong>Environmental Problems in the Aral Sea</strong>
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">
                      <strong>Main cause:</strong> increased 31 ...........................
                    </p>
                    <Input
                      value={listeningAnswers[30]}
                      onChange={(e) => handleListeningAnswerChange(30, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Originally used for growing 32 ...........................</p>
                    <Input
                      value={listeningAnswers[31]}
                      onChange={(e) => handleListeningAnswerChange(31, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-md">
                    <p className="text-lg">Chemicals used caused 33 ...........................</p>
                    <Input
                      value={listeningAnswers[32]}
                      onChange={(e) => handleListeningAnswerChange(32, e.target.value)}
                      placeholder="Answer"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-m

\
