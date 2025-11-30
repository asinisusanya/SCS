"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Users,
  AlertTriangle,
  Activity,
} from "lucide-react";

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

interface HallAvailability {
  hall: string;
  status: "available" | "occupied" | "upcoming";
  currentClass?: TimetableEntry;
  nextClass?: TimetableEntry;
  availableSlots: string[];
  occupiedSlots: string[];
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

const ALL_HALLS = ["SCLT1", "SCLT2", "SCA", "Lab1", "Lab2", "DSLab", "SCTR"];
const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function AvailableHallsScreen() {
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [hallsAvailability, setHallsAvailability] = useState<
    HallAvailability[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load timetable data from localStorage
    const savedWeeklyTimetable = localStorage.getItem("weeklyTimetable");
    if (savedWeeklyTimetable) {
      setWeeklyTimetable(JSON.parse(savedWeeklyTimetable));
    }
    setIsLoading(false);
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

  useEffect(() => {
    if (selectedDay && weeklyTimetable[selectedDay]) {
      calculateHallsAvailability();
    }
  }, [selectedDay, weeklyTimetable, currentTime]);

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

  const calculateHallsAvailability = () => {
    const currentTimeSlot = getCurrentTimeSlot();
    const isToday = selectedDay === getCurrentDay();
    const dayTimetable = weeklyTimetable[selectedDay] || [];

    const availability: HallAvailability[] = ALL_HALLS.map((hall) => {
      const hallClasses = dayTimetable.filter((entry) => entry.hall === hall);
      const occupiedSlots = hallClasses.map((entry) => entry.timeSlot);
      const availableSlots = TIME_SLOTS.filter(
        (slot) => !occupiedSlots.includes(slot)
      );

      // Find current class
      const currentClass = hallClasses.find(
        (entry) => entry.timeSlot === currentTimeSlot
      );

      // Find next class
      const nextClass = hallClasses
        .filter((entry) => {
          if (!currentTimeSlot) return true;
          return (
            TIME_SLOTS.indexOf(entry.timeSlot) >
            TIME_SLOTS.indexOf(currentTimeSlot)
          );
        })
        .sort(
          (a, b) =>
            TIME_SLOTS.indexOf(a.timeSlot) - TIME_SLOTS.indexOf(b.timeSlot)
        )[0];

      // Determine status
      let status: "available" | "occupied" | "upcoming" = "available";
      if (isToday && currentClass) {
        status = "occupied";
      } else if (
        isToday &&
        nextClass &&
        TIME_SLOTS.indexOf(nextClass.timeSlot) ===
          TIME_SLOTS.indexOf(currentTimeSlot || "") + 1
      ) {
        status = "upcoming";
      }

      return {
        hall,
        status,
        currentClass,
        nextClass,
        availableSlots,
        occupiedSlots,
      };
    });

    setHallsAvailability(availability);
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case "available":
        return "bg-gradient-to-br from-green-500/30 to-green-600/20";
      case "occupied":
        return "bg-gradient-to-br from-red-500/30 to-red-600/20";
      case "upcoming":
        return "bg-gradient-to-br from-[#FF9900]/30 to-[#FF9900]/20";
      default:
        return "bg-gradient-to-br from-gray-500/30 to-gray-600/20";
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "available":
        return "border-green-500/40";
      case "occupied":
        return "border-red-500/40";
      case "upcoming":
        return "border-[#FF9900]/40";
      default:
        return "border-gray-500/40";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case "occupied":
        return <XCircle className="w-8 h-8 text-red-400" />;
      case "upcoming":
        return <AlertTriangle className="w-8 h-8 text-[#FF9900]" />;
      default:
        return <MapPin className="w-8 h-8 text-white/60" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "AVAILABLE";
      case "occupied":
        return "OCCUPIED";
      case "upcoming":
        return "NEXT CLASS";
      default:
        return "UNKNOWN";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-400";
      case "occupied":
        return "text-red-400";
      case "upcoming":
        return "text-[#FF9900]";
      default:
        return "text-white/60";
    }
  };

  const availableHalls = hallsAvailability.filter(
    (hall) => hall.status === "available"
  ).length;
  const occupiedHalls = hallsAvailability.filter(
    (hall) => hall.status === "occupied"
  ).length;
  const upcomingHalls = hallsAvailability.filter(
    (hall) => hall.status === "upcoming"
  ).length;
  const isToday = selectedDay === getCurrentDay();

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#080808] via-[#0099FF] to-[#0099FF] text-white overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF9900] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#FF9900] mb-2">
            Loading Hall Status
          </h2>
          <p className="text-white/80">Checking availability...</p>
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
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
                  Hall Status
                </h1>
                <p className="text-lg text-white/70 flex items-center gap-2">
                  {selectedDay} •{" "}
                  {currentTime.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Statistics */}
            <div className="flex items-center gap-4">
              <div className="text-center bg-green-500/20 px-4 py-3 rounded-xl border border-green-500/30">
                <div className="text-2xl font-bold text-green-400">
                  {availableHalls}
                </div>
                <div className="text-xs text-green-400/80">Available</div>
              </div>
              <div className="text-center bg-red-500/20 px-4 py-3 rounded-xl border border-red-500/30">
                <div className="text-2xl font-bold text-red-400">
                  {occupiedHalls}
                </div>
                <div className="text-xs text-red-400/80">Occupied</div>
              </div>
              <div className="text-center bg-[#f59e0b]/20 px-4 py-3 rounded-xl border border-[#f59e0b]/30">
                <div className="text-2xl font-bold text-[#f59e0b]">
                  {upcomingHalls}
                </div>
                <div className="text-xs text-[#f59e0b]/80">Upcoming</div>
              </div>
            </div>

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
      </div>

      {/* Hall Status Grid - Enhanced with consistent styling */}
      <div className="relative z-10 p-6 h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto h-full">
          {/* First Row - 4 Cards */}
          <div className="grid grid-cols-4 gap-4 h-1/2 mb-4">
            {hallsAvailability.slice(0, 4).map((hallInfo, index) => (
              <div
                key={hallInfo.hall}
                className={`
                  ${getStatusBackground(hallInfo.status)} ${getStatusBorder(
                  hallInfo.status
                )}
                  bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border-2 overflow-hidden
                  transform transition-all duration-500 flex flex-col hover:scale-105
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Enhanced Hall Header */}
                <div className="bg-black/20 backdrop-blur-sm p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        {hallInfo.hall}
                      </h2>
                    </div>
                    {isToday && (
                      <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></div>
                        <span className="text-[#f59e0b] text-xs font-medium">
                          LIVE
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center mb-2">
                    {getStatusIcon(hallInfo.status)}
                  </div>
                  <div
                    className={`text-lg font-bold tracking-wider text-center ${getStatusTextColor(
                      hallInfo.status
                    )}`}
                  >
                    {getStatusText(hallInfo.status)}
                  </div>
                </div>

                {/* Enhanced Status Info */}
                <div className="flex-1 p-4 flex flex-col justify-center">
                  {isToday && hallInfo.currentClass ? (
                    <div className="text-center text-white space-y-2">
                      <div className="text-sm font-bold text-[#f59e0b] mb-2">
                        CURRENT CLASS
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                        <div className="text-lg font-bold mb-1">
                          {hallInfo.currentClass.courseCode}
                        </div>
                        <div className="text-sm opacity-90 mb-2 line-clamp-2">
                          {hallInfo.currentClass.subject}
                        </div>
                        <div className="text-xs opacity-80 flex items-center justify-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="line-clamp-1">
                            {hallInfo.currentClass.lecturer}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : isToday && hallInfo.nextClass ? (
                    <div className="text-center text-white space-y-2">
                      <div className="text-sm font-bold text-[#f59e0b] mb-2">
                        NEXT CLASS
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                        <div className="text-base font-bold mb-1">
                          {hallInfo.nextClass.timeSlot}
                        </div>
                        <div className="text-sm font-semibold mb-1">
                          {hallInfo.nextClass.courseCode}
                        </div>
                        <div className="text-xs opacity-80 line-clamp-1">
                          {hallInfo.nextClass.lecturer}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white space-y-3">
                      <div className="text-sm font-bold text-[#f59e0b] mb-2">
                        {hallInfo.status === "available"
                          ? "FREE SLOTS"
                          : "NO CLASSES"}
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                        <div className="text-3xl font-bold opacity-80 mb-1">
                          {hallInfo.availableSlots.length}
                        </div>
                        <div className="text-xs opacity-80">
                          OF {TIME_SLOTS.length} SLOTS
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Status Bar */}
                <div className="bg-black/20 backdrop-blur-sm p-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full animate-pulse ${
                          hallInfo.status === "available"
                            ? "bg-green-400"
                            : hallInfo.status === "occupied"
                            ? "bg-red-400"
                            : "bg-[#f59e0b]"
                        }`}
                      ></div>
                      <span className="font-medium">
                        {hallInfo.status === "available"
                          ? "Ready to use"
                          : hallInfo.status === "occupied"
                          ? "In session"
                          : "Starting soon"}
                      </span>
                    </div>
                    <div className="font-bold text-[#f59e0b]">
                      {Math.round(
                        (hallInfo.availableSlots.length / TIME_SLOTS.length) *
                          100
                      )}
                      % FREE
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row - 3 Cards (Centered) */}
          <div className="grid grid-cols-6 gap-4 h-1/2">
            <div className="col-start-2 col-span-4 grid grid-cols-3 gap-4">
              {hallsAvailability.slice(4, 7).map((hallInfo, index) => (
                <div
                  key={hallInfo.hall}
                  className={`
                    ${getStatusBackground(hallInfo.status)} ${getStatusBorder(
                    hallInfo.status
                  )}
                    bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border-2 overflow-hidden
                    transform transition-all duration-500 flex flex-col hover:scale-105
                  `}
                  style={{
                    animationDelay: `${(index + 4) * 0.1}s`,
                  }}
                >
                  {/* Enhanced Hall Header */}
                  <div className="bg-black/20 backdrop-blur-sm p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          {hallInfo.hall}
                        </h2>
                      </div>
                      {isToday && (
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></div>
                          <span className="text-[#f59e0b] text-xs font-medium">
                            LIVE
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center mb-2">
                      {getStatusIcon(hallInfo.status)}
                    </div>
                    <div
                      className={`text-lg font-bold tracking-wider text-center ${getStatusTextColor(
                        hallInfo.status
                      )}`}
                    >
                      {getStatusText(hallInfo.status)}
                    </div>
                  </div>

                  {/* Enhanced Status Info */}
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    {isToday && hallInfo.currentClass ? (
                      <div className="text-center text-white space-y-2">
                        <div className="text-sm font-bold text-[#f59e0b] mb-2">
                          CURRENT CLASS
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                          <div className="text-lg font-bold mb-1">
                            {hallInfo.currentClass.courseCode}
                          </div>
                          <div className="text-sm opacity-90 mb-2 line-clamp-2">
                            {hallInfo.currentClass.subject}
                          </div>
                          <div className="text-xs opacity-80 flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className="line-clamp-1">
                              {hallInfo.currentClass.lecturer}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : isToday && hallInfo.nextClass ? (
                      <div className="text-center text-white space-y-2">
                        <div className="text-sm font-bold text-[#f59e0b] mb-2">
                          NEXT CLASS
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                          <div className="text-base font-bold mb-1">
                            {hallInfo.nextClass.timeSlot}
                          </div>
                          <div className="text-sm font-semibold mb-1">
                            {hallInfo.nextClass.courseCode}
                          </div>
                          <div className="text-xs opacity-80 line-clamp-1">
                            {hallInfo.nextClass.lecturer}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-white space-y-3">
                        <div className="text-sm font-bold text-[#f59e0b] mb-2">
                          {hallInfo.status === "available"
                            ? "FREE SLOTS"
                            : "NO CLASSES"}
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                          <div className="text-3xl font-bold opacity-80 mb-1">
                            {hallInfo.availableSlots.length}
                          </div>
                          <div className="text-xs opacity-80">
                            OF {TIME_SLOTS.length} SLOTS
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Status Bar */}
                  <div className="bg-black/20 backdrop-blur-sm p-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full animate-pulse ${
                            hallInfo.status === "available"
                              ? "bg-green-400"
                              : hallInfo.status === "occupied"
                              ? "bg-red-400"
                              : "bg-[#f59e0b]"
                          }`}
                        ></div>
                        <span className="font-medium">
                          {hallInfo.status === "available"
                            ? "Ready to use"
                            : hallInfo.status === "occupied"
                            ? "In session"
                            : "Starting soon"}
                        </span>
                      </div>
                      <div className="font-bold text-[#f59e0b]">
                        {Math.round(
                          (hallInfo.availableSlots.length / TIME_SLOTS.length) *
                            100
                        )}
                        % FREE
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
