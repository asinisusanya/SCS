"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  AlertCircle,
  Info,
  Clock,
  Bell,
  Star,
  Users,
} from "lucide-react";
import { fetchNotices } from "@/lib/google-sheets";

interface Notice {
  id: string;
  title: string;
  message: string;
  type:
    | "info"
    | "warning"
    | "announcement"
    | "event"
    | "deadline"
    | "achievement";
  date: string;
  priority?: "critical" | "high" | "medium" | "low";
  category?: string;
  author?: string;
  validUntil?: string;
  isNew?: boolean;
}

interface CSVNoticeRow {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  priority: string;
  category: string;
  author: string;
  validUntil: string;
  isNew: string;
}

// Function to convert CSV data to Notice format
const convertCSVToNotices = (csvData: CSVNoticeRow[]): Notice[] => {
  return csvData.map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    type: (row.type as Notice["type"]) || "info",
    date: row.date,
    priority: (row.priority as Notice["priority"]) || "medium",
    category: row.category || undefined,
    author: row.author || undefined,
    validUntil: row.validUntil || undefined,
    isNew: row.isNew === "true" || row.isNew === "TRUE",
  }));
};

// Sample fallback data in case CSV loading fails
const FALLBACK_NOTICES: Notice[] = [
  {
    id: "1",
    title: "Semester Registration Now Open",
    message:
      "Registration for the new semester begins January 15th. Complete all required documentation and submit before the deadline.",
    type: "announcement",
    date: "2024-01-10",
    priority: "critical",
    category: "Academic",
    author: "Registrar Office",
    validUntil: "2024-01-20",
    isNew: true,
  },
  {
    id: "2",
    title: "Lab Maintenance Alert",
    message:
      "Computer Lab 2 will undergo scheduled maintenance from 2:00 PM to 4:00 PM today. Alternative labs are available.",
    type: "warning",
    date: "2024-01-12",
    priority: "high",
    category: "Facilities",
    author: "IT Department",
    validUntil: "2024-01-12",
  },
  {
    id: "3",
    title: "Distinguished Guest Lecture",
    message:
      "Prof. John Smith from MIT will deliver a special lecture on Advanced Machine Learning tomorrow at 10:00 AM in the Main Auditorium.",
    type: "event",
    date: "2024-01-13",
    priority: "high",
    category: "Academic",
    author: "Department Head",
    validUntil: "2024-01-14",
    isNew: true,
  },
];

export default function NoticesScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load notices data
    const loadNoticesData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching notices from Google Sheets...");

        // First try to load from admin-created notices in localStorage
        const adminNotices = localStorage.getItem("notices");
        if (adminNotices) {
          const parsedAdminNotices = JSON.parse(adminNotices);
          const activeAdminNotices = parsedAdminNotices.filter(
            (notice: any) => notice.isActive !== false
          );
          if (activeAdminNotices.length > 0) {
            console.log("Using admin-created notices from localStorage");
            // Sort by date and take only the most recent 6
            const sortedAdminNotices = activeAdminNotices.sort(
              (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const displayAdminNotices = sortedAdminNotices.slice(0, 6);
            setNotices(displayAdminNotices);
            setIsLoading(false);
            return;
          }
        }

        // If no admin notices, fetch from Google Sheets
        const csvData = await fetchNotices();
        console.log("Fetched notices data:", csvData);

        if (csvData.length === 0) {
          throw new Error("No valid notice data found in Google Sheets");
        }

        const noticesData = convertCSVToNotices(csvData);
        console.log("Converted notices data:", noticesData);

        // Filter out expired notices and sort by date (most recent first)
        const currentDate = new Date();
        const activeNotices = noticesData
          .filter((notice) => {
            if (!notice.validUntil) return true;
            const validUntilDate = new Date(notice.validUntil);
            return validUntilDate >= currentDate;
          })
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        // Take only the most recent 6 notices if there are more than 6
        const displayNotices = activeNotices.slice(0, 6);

        setNotices(displayNotices); // Save to localStorage for future use
        localStorage.setItem("csvNotices", JSON.stringify(displayNotices));
        console.log("Notices data saved to localStorage");
      } catch (err) {
        console.error("Error loading notices data:", err);
        setError(`Failed to load notices data: ${err.message}`);

        // Try to load from localStorage as fallback
        const savedNotices = localStorage.getItem("csvNotices");
        if (savedNotices) {
          console.log("Loading notices from localStorage as fallback");
          const parsedData = JSON.parse(savedNotices);
          // Ensure we only show up to 6 notices
          const limitedData = parsedData.slice(0, 6);
          setNotices(limitedData);
          setError(null); // Clear error if we have cached data
        } else {
          // Use fallback sample data as last resort
          console.log("Using fallback sample notices");
          // Limit fallback notices to 6 as well
          const limitedFallback = FALLBACK_NOTICES.slice(0, 6);
          setNotices(limitedFallback);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNoticesData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Auto-scroll through notices every 8 seconds
    // const noticeTimer = setInterval(() => {
    //   setCurrentNoticeIndex((prev) => {
    //     const maxNotices = Math.min(notices.length, 6) // Show max 6 notices
    //     return ((prev + 6) % Math.ceil(maxNotices / 6)) * 6
    //   })
    // }, 8000)

    // return () => {
    //   clearInterval(timer)
    //   clearInterval(noticeTimer)
    // }
    return () => {
      clearInterval(timer);
    };
  }, [notices.length]);

  const getIcon = (type: Notice["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-6 h-6" />;
      case "announcement":
        return <Bell className="w-6 h-6" />;
      case "event":
        return <Calendar className="w-6 h-6" />;
      case "deadline":
        return <Clock className="w-6 h-6" />;
      case "achievement":
        return <Star className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getPriorityStyle = (priority: Notice["priority"]) => {
    switch (priority) {
      case "critical":
        return "border-l-red-500 bg-gradient-to-r from-red-500/20 to-red-500/5 shadow-red-500/20";
      case "high":
        return "border-l-[#FF9900] bg-gradient-to-r from-[#FF9900]/20 to-[#FF9900]/5 shadow-[#FF9900]/20";
      case "medium":
        return "border-l-[#0099FF] bg-gradient-to-r from-[#0099FF]/20 to-[#0099FF]/5 shadow-[#0099FF]/20";
      default:
        return "border-l-gray-500 bg-gradient-to-r from-gray-500/20 to-gray-500/5 shadow-gray-500/20";
    }
  };

  const getTypeColor = (type: Notice["type"]) => {
    switch (type) {
      case "warning":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "announcement":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "event":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "deadline":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "achievement":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const criticalNotices = notices.filter(
    (n) => n.priority === "critical"
  ).length;
  const newNotices = notices.filter((n) => n.isNew).length;
  const displayedNotices = notices.slice(0, Math.min(notices.length, 6));
  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#080808] via-[#0099FF] to-[#0099FF] text-white overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF9900] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#FF9900] mb-2">
            Loading Notices
          </h2>
          <p className="text-white/80">Fetching latest announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#080808] via-[#0099FF] to-[#0099FF] text-white overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#FF9900] mb-1 flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Notice Board
            </h1>
            <p className="text-lg font-semibold text-white flex items-center gap-2">
              Latest Updates & Important Information
              {error && (
                <span className="text-sm text-red-300 bg-red-500/20 px-2 py-1 rounded">
                  Using cached data
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {criticalNotices}
              </div>
              <div className="text-sm text-white/80">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FF9900]">
                {newNotices}
              </div>
              <div className="text-sm text-white/80">New</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {notices.length}
              </div>
              <div className="text-sm text-white/80">Total</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <Clock className="w-6 h-6" />
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-sm text-white/80">
                {currentTime.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notices Grid with Auto-Scroll */}
      <div className="p-4 h-[calc(100vh-140px)]">
        {notices.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bell className="w-16 h-16 mx-auto text-white/50 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                No Active Notices
              </h2>
              <p className="text-white/70">All notices are up to date</p>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-4 h-full ${
              notices.length === 1
                ? "grid-cols-1"
                : notices.length === 2
                ? "grid-cols-2"
                : notices.length === 3
                ? "grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {displayedNotices.map((notice, index) => (
              <div
                key={notice.id}
                className={`
                  ${getPriorityStyle(notice.priority)}
                  backdrop-blur-sm rounded-xl shadow-2xl border-l-4 overflow-hidden
                  transform transition-all duration-700 flex flex-col
                  animate-slide-in-left
                `}
                style={{
                  animationDelay: `${
                    index * 0.08 + Math.floor(index / 3) * 0.05
                  }s`,
                  animationFillMode: "both",
                }}
              >
                {/* Notice Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-[#FF9900]">
                        {getIcon(notice.type)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#FF9900] line-clamp-1">
                          {notice.title}
                        </h3>
                        {notice.category && (
                          <span className="text-xs text-white/60">
                            {notice.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {notice.isNew && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full font-semibold">
                          NEW
                        </span>
                      )}
                      {notice.priority === "critical" && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full font-semibold">
                          URGENT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                        notice.type
                      )}`}
                    >
                      {notice.type.toUpperCase()}
                    </span>
                    {notice.priority && notice.priority !== "low" && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notice.priority === "critical"
                            ? "bg-red-500/20 text-red-300"
                            : notice.priority === "high"
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {notice.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Notice Content */}
                <div className="flex-1 p-4">
                  <p className="text-sm text-white leading-relaxed line-clamp-4 mb-3">
                    {notice.message}
                  </p>

                  {notice.author && (
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                      <Users className="w-3 h-3" />
                      <span>By {notice.author}</span>
                    </div>
                  )}
                </div>

                {/* Notice Footer */}
                <div className="p-4 bg-black/10 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(notice.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {notice.validUntil && (
                      <div className="flex items-center gap-2 text-white/60">
                        <Clock className="w-3 h-3" />
                        <span>
                          Valid until{" "}
                          {new Date(notice.validUntil).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auto-Scroll Progress Indicator */}
        {notices.length > 6 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {Array.from({ length: Math.ceil(notices.length / 6) }).map(
              (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    Math.floor(currentNoticeIndex / 6) === index
                      ? "bg-[#FF9900]"
                      : "bg-white/30"
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
