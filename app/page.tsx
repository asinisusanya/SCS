"use client"

import { useState, useEffect } from "react"
import WelcomeScreen from "@/components/welcome-screen"
import TimetableScreen from "@/components/timetable-screen"
import AvailableHallsScreen from "@/components/available-halls-screen"
import NoticesScreen from "@/components/notices-screen"

const SCREEN_DURATIONS = {
  welcome: 15000, // 15 seconds
  timetable: 120000, // 120 seconds (2 minutes) - increased to show all 8 locations properly
  availableHalls: 30000, // 30 seconds - new screen for hall availability
  notices: 25000, // 25 seconds - time for notice auto-navigation
}

type Screen = "welcome" | "timetable" | "availableHalls" | "notices"

export default function DigitalSignage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [fadeClass, setFadeClass] = useState("opacity-100")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let progressTimer: NodeJS.Timeout

    const rotateScreen = () => {
      setFadeClass("opacity-0")
      setProgress(0)

      setTimeout(() => {
        setCurrentScreen((prev) => {
          switch (prev) {
            case "welcome":
              return "timetable"
            case "timetable":
              return "availableHalls"
            case "availableHalls":
              return "notices"
            case "notices":
              return "welcome"
            default:
              return "welcome"
          }
        })
        setFadeClass("opacity-100")
      }, 500) // Longer fade duration for smoother transition
    }

    // Progress bar update
    progressTimer = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (SCREEN_DURATIONS[currentScreen] / 100)
        return prev >= 100 ? 0 : prev + increment
      })
    }, 100)

    const duration = SCREEN_DURATIONS[currentScreen]
    const timer = setTimeout(() => {
      rotateScreen()
      setProgress(0)
    }, duration)

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [currentScreen])

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen />
      case "timetable":
        return <TimetableScreen />
      case "availableHalls":
        return <AvailableHallsScreen />
      case "notices":
        return <NoticesScreen />
      default:
        return <WelcomeScreen />
    }
  }

  return (
    <div className="responsive-height-screen bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#3b82f6] overflow-hidden relative">
      <div className={`transition-opacity duration-500 ${fadeClass}`}>{renderCurrentScreen()}</div>

      {/* Screen Transition Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-[#f59e0b] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
