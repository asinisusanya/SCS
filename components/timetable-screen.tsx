"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  User,
  Calendar,
  Wifi,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { fetchCourseSchedule } from "@/lib/google-sheets";

interface TimetableEntry {
  timeSlot: string;
  hall: string;
  courseCode: string;
  lecturer: string;
  subject?: string;
  students?: number;
  type?: "lecture" | "lab" | "tutorial";
}

interface WeeklyTimetable {
  [key: string]: TimetableEntry[];
}

interface CSVRow {
  courseCode: string;
  subject: string;
  lecturer: string;
  students: string;
  Day: string;
  timeSlot: string;
  hall: string;
  type: string;
}

const TIME_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
];

const ALL_HALLS = [
  "SCLT1",
  "SCLT2",
  "SCA",
  "Lab1",
  "Lab2",
  "DSLab",
  "SCTR",
  "Online",
];

const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Function to convert CSV data to timetable format
const convertCSVToTimetable = (csvData: CSVRow[]): WeeklyTimetable => {
  const timetable: WeeklyTimetable = {};

  // Initialize empty arrays for each day
  WORKING_DAYS.forEach((day) => {
    timetable[day] = [];
  });

  csvData.forEach((row) => {
    const entry: TimetableEntry = {
      timeSlot: row.timeSlot,
      hall: row.hall,
      courseCode: row.courseCode,
      lecturer: row.lecturer,
      subject: row.subject,
      students: Number.parseInt(row.students) || undefined,
      type: (row.type as "lecture" | "lab" | "tutorial") || "lecture",
    };

    if (timetable[row.Day]) {
      timetable[row.Day].push(entry);
    }
  });

  console.log("Final timetable:", timetable);
  return timetable;
};

export default function TimetableScreen() {
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slideProgress, setSlideProgress] = useState(0);

  const HALLS_PER_SLIDE = 1;
  const SLIDE_DURATION = 10000; // 10 seconds

  useEffect(() => {
    // Load timetable data
    const loadTimetableData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching course schedule from Google Sheets...");

        // Fetch from Google Sheets
        const csvData = await fetchCourseSchedule();
        console.log("Fetched course schedule data:", csvData);

        if (csvData.length === 0) {
          throw new Error("No valid data found in Google Sheets");
        }

        const timetableData = convertCSVToTimetable(csvData);
        console.log("Converted timetable data:", timetableData);

        setWeeklyTimetable(timetableData);
        // Save to localStorage for future use
        localStorage.setItem("weeklyTimetable", JSON.stringify(timetableData));
        console.log("Timetable data saved to localStorage");
      } catch (err: any) {
        console.error("Error loading timetable data:", err);
        setError(`Failed to load timetable data: ${err.message}`);

        // Try to load from localStorage as fallback
        const savedWeeklyTimetable = localStorage.getItem("weeklyTimetable");
        if (savedWeeklyTimetable) {
          console.log("Loading from localStorage as fallback");
          const parsedData = JSON.parse(savedWeeklyTimetable);
          setWeeklyTimetable(parsedData);
          setError(null); // Clear error if we have cached data
        } else {
          // Use minimal sample data as last resort
          console.log("Using minimal sample data as fallback");
          const sampleTimetable = {
            Monday: [
              {
                timeSlot: "09:00-10:00",
                hall: "SCLT1",
                courseCode: "CSC3033",
                lecturer: "Dr. Ruwanthini Siyambalapitiya",
                subject: "Operating Systems Concepts",
                students: 60,
                type: "lecture" as const,
              },
            ],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
          };
          setWeeklyTimetable(sampleTimetable);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTimetableData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Auto-detect current working day
    const today = getCurrentDay();
    const currentWorkingDay = WORKING_DAYS.includes(today) ? today : "Monday";
    setSelectedDay(currentWorkingDay);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Update selected day if day changes
      const newDay = getCurrentDay();
      const newWorkingDay = WORKING_DAYS.includes(newDay) ? newDay : "Monday";
      setSelectedDay(newWorkingDay);
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, [isLoading]);

  const getCurrentDay = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  };

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (const slot of TIME_SLOTS) {
      const [start, end] = slot.split("-");
      const [startHour, startMinute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);

      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      if (
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes < endTimeInMinutes
      ) {
        return slot;
      }
    }
    return null;
  };

  const getEntryForSlotAndHall = (
    timeSlot: string,
    hall: string,
    day: string
  ) => {
    const dayTimetable = weeklyTimetable[day] || [];
    return (
      dayTimetable.find(
        (entry) => entry.timeSlot === timeSlot && entry.hall === hall
      ) || null
    );
  };

  // Filter halls that have lectures for the selected day
  const getActiveHalls = (day: string) => {
    return ALL_HALLS.filter((hall) => {
      const hallLectures = TIME_SLOTS.some((slot) =>
        getEntryForSlotAndHall(slot, hall, day)
      );
      return hallLectures;
    });
  };

  const activeHalls = selectedDay ? getActiveHalls(selectedDay) : [];
  const TOTAL_SLIDES = Math.ceil(activeHalls.length / HALLS_PER_SLIDE);

  useEffect(() => {
    if (isLoading || TOTAL_SLIDES === 0) return;

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 100 / (SLIDE_DURATION / 100);
      });
    }, 100);

    // Auto-slide through hall groups
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
      setSlideProgress(0);
    }, SLIDE_DURATION);

    return () => {
      clearInterval(slideTimer);
      clearInterval(progressTimer);
    };
  }, [TOTAL_SLIDES, SLIDE_DURATION, isLoading]);

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "lab":
        return {
          bg: "bg-gradient-to-r from-[#0099FF]/30 to-[#0099FF]/20",
          border: "border-[#0099FF]/40",
          text: "text-[#0099FF]",
          badge: "bg-[#0099FF]/20 text-[#0099FF] border-[#0099FF]/30",
        };
      case "tutorial":
        return {
          bg: "bg-gradient-to-r from-[#FF9900]/30 to-[#FF9900]/20",
          border: "border-[#FF9900]/40",
          text: "text-[#FF9900]",
          badge: "bg-[#FF9900]/20 text-[#FF9900] border-[#FF9900]/30",
        };
      default: // lecture
        return {
          bg: "bg-gradient-to-r from-[#B166FF]/30 to-[#B166FF]/20",
          border: "border-[#B166FF]/40",
          text: "text-[#B166FF]",
          badge: "bg-[#B166FF]/20 text-[#B166FF] border-[#B166FF]/30",
        };
    }
  };

  const getTimeSlotStatus = (slot: string) => {
    const currentSlot = getCurrentTimeSlot();
    const isToday = selectedDay === getCurrentDay();

    if (!isToday || !currentSlot) return "upcoming";

    const currentIndex = TIME_SLOTS.indexOf(currentSlot);
    const slotIndex = TIME_SLOTS.indexOf(slot);

    if (slotIndex < currentIndex) return "past";
    if (slotIndex === currentIndex) return "current";
    return "upcoming";
  };

  const currentTimeSlot = getCurrentTimeSlot();
  const currentDayTimetable = weeklyTimetable[selectedDay] || [];
  const activeClasses =
    selectedDay === getCurrentDay()
      ? currentDayTimetable.filter(
          (entry) => entry.timeSlot === currentTimeSlot
        ).length
      : 0;
  const totalClassesToday = currentDayTimetable.length;
  const isToday = selectedDay === getCurrentDay();

  // Get current slide halls (only halls with lectures)
  const currentSlideHalls = activeHalls.slice(
    currentSlide * HALLS_PER_SLIDE,
    (currentSlide + 1) * HALLS_PER_SLIDE
  );

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#080808] via-[#0099FF] to-[#0099FF] text-white overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF9900] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#FF9900] mb-2">
            Loading Timetable
          </h2>
          <p className="text-white/80">Fetching latest schedule data...</p>
        </div>
      </div>
    );
  }

  // If no active halls, show a message
  if (activeHalls.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#080808] via-[#0099FF] to-[#0099FF] text-white overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Wifi className="w-16 h-16 mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-bold text-[#FF9900] mb-4">
            No Classes Today
          </h2>
          <p className="text-xl text-white/80">
            All halls are available on {selectedDay}
          </p>
          <p className="text-lg text-white/60 mt-2">Enjoy your free day!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#080808] via-[#0099FF] to-[#0099FF] text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#FF9900]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#0099FF]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-white/10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF9900] to-[#FF9900] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF9900] to-[#FF9900] bg-clip-text text-transparent">
                  Class Schedule
                </h1>
                <p className="text-lg text-white/70 flex items-center gap-2">
                  {selectedDay} •{" "}
                  {currentTime.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {error && (
                    <span className="text-sm text-red-300 bg-red-500/20 px-2 py-1 rounded">
                      Using cached data
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Stats */}
            {/* <div className="flex items-center gap-4">
              <div className="text-center bg-[#f59e0b]/20 px-4 py-3 rounded-xl border border-[#f59e0b]/30">
                <div className="text-2xl font-bold text-[#f59e0b]">
                  {totalClassesToday}
                </div>
                <div className="text-xs text-[#f59e0b]/80">Total Classes</div>
              </div>
              <div className="text-center bg-[#3b82f6]/20 px-4 py-3 rounded-xl border border-[#3b82f6]/30">
                <div className="text-2xl font-bold text-[#3b82f6]">
                  {activeHalls.length}
                </div>
                <div className="text-xs text-[#3b82f6]/80">Active Halls</div>
              </div>
              {isToday && (
                <div className="text-center bg-green-500/20 px-4 py-3 rounded-xl border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">
                    {activeClasses}
                  </div>
                  <div className="text-xs text-green-400/80">Live Now</div>
                </div>
              )}
            </div> */}

            {/* Time Display */}
            <div className="text-right bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <Clock className="w-6 h-6" />
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-sm text-white/70">Current Time</div>
            </div>
          </div>
        </div>

        {/* Progress Bar and Slide Indicator */}
        {/* {TOTAL_SLIDES > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">Active Halls:</span>
              <div className="flex items-center gap-2">
                {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === index ? "bg-[#f59e0b] scale-125" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-white/60">
                ({currentSlide + 1}/{TOTAL_SLIDES})
              </span>
            </div>
            <div className="flex-1 max-w-md mx-8">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] h-2 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${slideProgress}%` }}
                />
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-140px)]">
        {/* Enhanced Time Column */}
        <div className="w-48 bg-gradient-to-b from-[#1e3a8a]/50 to-[#1e40af]/30 backdrop-blur-sm border-r border-white/10 flex flex-col">
          {/* Time Column Header */}
          {/* <div className="h-24 p-4 border-b border-white/10 bg-[#1e3a8a]/30">
            <h3 className="text-lg font-bold text-[#f59e0b] mb-2 text-center">
              Daily Timeline
            </h3>
            <div className="text-center">
              <div className="text-sm text-white/80">
                {TIME_SLOTS.length} Time Slots
              </div>
            </div>
          </div> */}

          {/* Time Slots */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {TIME_SLOTS.map((slot) => {
                const status = getTimeSlotStatus(slot);
                return (
                  <div
                    key={slot}
                    className={`p-3 rounded-xl text-center transition-all duration-500 border ${
                      status === "current"
                        ? "bg-gradient-to-r from-[#f59e0b]/40 to-[#d97706]/30 border-[#f59e0b] shadow-lg shadow-[#f59e0b]/30 scale-105"
                        : status === "past"
                        ? "bg-white/5 border-white/10 opacity-60"
                        : "bg-white/10 border-white/20 hover:bg-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {status === "current" && (
                        <div className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse" />
                      )}
                      {status === "past" && (
                        <CheckCircle className="w-3 h-3 text-white/50" />
                      )}
                      {status === "upcoming" && (
                        <AlertCircle className="w-3 h-3 text-white/70" />
                      )}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        status === "current"
                          ? "text-white font-bold"
                          : status === "past"
                          ? "text-white/50"
                          : "text-white/90"
                      }`}
                    >
                      {slot}
                    </div>
                    {status === "current" && (
                      <div className="text-xs text-white/90 font-bold mt-1">
                        ● LIVE
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Hall Card */}
        <div className="flex-1 p-6">
          <div className="h-full">
            {currentSlideHalls.map((hall) => {
              // Calculate class count for this hall
              const classCount = TIME_SLOTS.filter((slot) => {
                const entry = getEntryForSlotAndHall(slot, hall, selectedDay);
                return entry !== null;
              }).length;

              return (
                <div
                  key={hall}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden h-full transform transition-all duration-700 hover:shadow-2xl"
                >
                  {/* Enhanced Hall Header */}
                  <div className="bg-gradient-to-r from-[#1e3a8a]/60 to-[#1e40af]/40 backdrop-blur-sm p-6 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-white mb-1">
                            {hall}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-lg text-[#f59e0b] font-semibold">
                              {classCount} Classes Today
                            </span>
                            <div className="flex items-center gap-2">
                              {isToday && (
                                <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-green-400 text-sm font-medium">
                                    LIVE
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <div className="text-right">
                        <div className="text-sm text-white/70 mb-1">
                          Utilization
                        </div>
                        <div className="text-2xl font-bold text-[#f59e0b]">
                          {Math.round((classCount / TIME_SLOTS.length) * 100)}%
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* Enhanced Classes Grid */}
                  <div className="p-6 h-[calc(100%-140px)]">
                    <div className="grid grid-cols-2 gap-4 h-full">
                      {TIME_SLOTS.map((slot) => {
                        const entry = getEntryForSlotAndHall(
                          slot,
                          hall,
                          selectedDay
                        );
                        if (!entry) return null;

                        const status = getTimeSlotStatus(slot);
                        const colors = getTypeColor(entry.type);

                        return (
                          <div
                            key={slot}
                            className={`${colors.bg} ${
                              colors.border
                            } border-2 rounded-2xl p-4 transition-all duration-500 ${
                              status === "current"
                                ? "ring-4 ring-[#f59e0b]/50 shadow-2xl shadow-[#f59e0b]/30 scale-105"
                                : status === "past"
                                ? "opacity-60 grayscale"
                                : "hover:scale-102 hover:shadow-xl"
                            }`}
                          >
                            {/* Class Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    status === "current"
                                      ? "bg-[#f59e0b] animate-pulse"
                                      : colors.text.replace("text-", "bg-")
                                  }`}
                                />
                                <span
                                  className={`text-sm font-bold ${
                                    status === "current"
                                      ? "text-white"
                                      : "text-white/90"
                                  }`}
                                >
                                  {slot}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.badge}`}
                                >
                                  {entry.type?.toUpperCase() || "LECTURE"}
                                </span>
                                {status === "current" && (
                                  <div className="flex items-center gap-1">
                                    <Play className="w-3 h-3 text-[#f59e0b]" />
                                    <span className="text-xs text-[#f59e0b] font-bold">
                                      LIVE
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Course Information */}
                            <div className="space-y-2">
                              <div
                                className={`text-xl font-bold ${
                                  status === "current"
                                    ? "text-white"
                                    : colors.text
                                } leading-tight`}
                              >
                                {entry.courseCode}
                              </div>
                              <div
                                className={`text-base font-medium ${
                                  status === "current"
                                    ? "text-white/90"
                                    : "text-white/80"
                                } line-clamp-2`}
                              >
                                {entry.subject || "No subject"}
                              </div>
                              <div
                                className={`flex items-center gap-2 text-sm ${
                                  status === "current"
                                    ? "text-white/80"
                                    : "text-white/70"
                                }`}
                              >
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {entry.lecturer || "No lecturer"}
                                </span>
                              </div>
                              {entry.students && (
                                <div
                                  className={`text-xs ${
                                    status === "current"
                                      ? "text-white/70"
                                      : "text-white/60"
                                  }`}
                                >
                                  {entry.students} students enrolled
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
