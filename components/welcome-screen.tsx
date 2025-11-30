"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
  Award,
  Clock,
  MapPin,
  Wifi,
  Coffee,
  Star,
  Activity,
  Zap,
  Globe,
  Code,
  Database,
  Brain,
  Cpu,
  Monitor,
  Smartphone,
} from "lucide-react";
import { fetchImages } from "@/lib/google-sheets";

interface CarouselImage {
  imageUrl: string;
  title: string;
  description: string;
}

const LIVE_STATS = [
  {
    icon: Users,
    label: "Active Students",
    value: "487",
    trend: "+12",
    color: "text-blue-400",
  },
  {
    icon: Monitor,
    label: "Lab Sessions",
    value: "24",
    trend: "+3",
    color: "text-green-400",
  },
  {
    icon: BookOpen,
    label: "Courses Running",
    value: "18",
    trend: "0",
    color: "text-purple-400",
  },
  {
    icon: Award,
    label: "Projects Active",
    value: "156",
    trend: "+8",
    color: "text-yellow-400",
  },
];

const TECH_HIGHLIGHTS = [
  { icon: Brain, label: "AI & Machine Learning", active: true },
  { icon: Database, label: "Big Data Analytics", active: true },
  { icon: Code, label: "Software Engineering", active: true },
  { icon: Cpu, label: "Computer Systems", active: false },
  { icon: Globe, label: "Web Technologies", active: true },
  { icon: Smartphone, label: "Mobile Development", active: false },
];

const RECENT_ACHIEVEMENTS = [
  {
    title: "National Programming Championship",
    description: "First place in inter-university competition",
    date: "2 days ago",
    type: "achievement",
  },
  {
    title: "Research Paper Published",
    description: "AI Ethics in Healthcare - IEEE Journal",
    date: "1 week ago",
    type: "research",
  },
  {
    title: "Industry Partnership",
    description: "Collaboration with Tech Giants for internships",
    date: "2 weeks ago",
    type: "partnership",
  },
];

export default function WelcomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAchievement, setCurrentAchievement] = useState(0);
  const [animatedStats, setAnimatedStats] = useState(LIVE_STATS.map(() => 0));
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await fetchImages();
        setCarouselImages(images);
        console.log("Carousel images after fetch:", images);
      } catch (error) {
        console.error("Failed to load images from Google Sheet:", error);
      }
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (carouselImages.length > 0) {
      const imageTimer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
      }, 6000);
      return () => clearInterval(imageTimer);
    }
  }, [carouselImages]);

  useEffect(() => {
    const achievementTimer = setInterval(() => {
      setCurrentAchievement((prev) => (prev + 1) % RECENT_ACHIEVEMENTS.length);
    }, 4000);
    return () => clearInterval(achievementTimer);
  }, []);

  // Animate stats on mount
  useEffect(() => {
    const timers = LIVE_STATS.map((stat, index) => {
      return setTimeout(() => {
        const targetValue = Number.parseInt(stat.value);
        let currentValue = 0;
        const increment = targetValue / 30;

        const countTimer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            setAnimatedStats((prev) => {
              const newStats = [...prev];
              newStats[index] = targetValue;
              return newStats;
            });
            clearInterval(countTimer);
          } else {
            setAnimatedStats((prev) => {
              const newStats = [...prev];
              newStats[index] = Math.floor(currentValue);
              return newStats;
            });
          }
        }, 50);
      }, index * 200);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    );
  };

  if (carouselImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl">
        Loading images...
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#080808] via-[#0099FF] to-[#0099FF] text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#FF9900]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#0099FF]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#0099FF]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Enhanced Header Bar */}
      <div className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-white/10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
                  Department of Statistics & Computer Science
                </h1>
                <p className="text-lg text-white/70">
                  University of Peradeniya • Excellence in Innovation
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-[#f59e0b]/20 px-4 py-2 rounded-full border border-[#f59e0b]/30">
              <div className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></div>
              <span className="text-[#f59e0b] font-medium">LIVE</span>
            </div>

            {/* Time Display */}
            <div className="text-right bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
              <div className="text-2xl font-bold text-white">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-white/70">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-100px)]">
        {/* Left Side - Enhanced Image Carousel */}
        <div className="flex-1 p-6">
          <div className="relative h-full bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="relative h-full">
              <Image
                src={
                  carouselImages[currentImageIndex].imageUrl ||
                  "/placeholder.svg"
                }
                alt={carouselImages[currentImageIndex].title}
                fill
                className="object-cover transition-all duration-1000"
                priority
              />

              {/* Enhanced Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a8a]/80 via-[#1e3a8a]/20 to-transparent"></div>

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-[#1e3a8a]/50 hover:bg-[#1e3a8a]/70 text-white p-3 rounded-full transition-all z-10 backdrop-blur-sm border border-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-[#1e3a8a]/50 hover:bg-[#1e3a8a]/70 text-white p-3 rounded-full transition-all z-10 backdrop-blur-sm border border-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Enhanced Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="bg-[#1e3a8a]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-bold text-2xl mb-2">
                    {carouselImages[currentImageIndex].title}
                  </h3>
                  <p className="text-white/80 text-lg mb-4">
                    {carouselImages[currentImageIndex].description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      {carouselImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-[#f59e0b] scale-125"
                              : "bg-white/40 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {carouselImages.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Information Panel (Fixed Height) */}
        <div className="w-[500px] p-6 space-y-4">
          {/* Live Statistics */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <h3 className="text-xl font-bold text-[#f59e0b] mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Live Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {LIVE_STATS.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    {stat.trend !== "0" && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          stat.trend.startsWith("+")
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {animatedStats[index]}
                  </div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Focus Areas */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <h3 className="text-xl font-bold text-[#f59e0b] mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Technology Focus
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {TECH_HIGHLIGHTS.map((tech, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    tech.active
                      ? "bg-gradient-to-r from-[#3b82f6]/20 to-[#1e3a8a]/20 border-[#3b82f6]/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tech.icon
                      className={`w-4 h-4 ${
                        tech.active ? "text-[#3b82f6]" : "text-white/60"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        tech.active ? "text-white" : "text-white/60"
                      }`}
                    >
                      {tech.label}
                    </span>
                  </div>
                  {tech.active && (
                    <div className="mt-2">
                      <div className="w-full bg-white/10 rounded-full h-1">
                        <div
                          className="bg-gradient-to-r from-[#3b82f6] to-[#f59e0b] h-1 rounded-full animate-pulse"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements Carousel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <h3 className="text-xl font-bold text-[#f59e0b] mb-4 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Recent Achievements
            </h3>
            <div className="relative rounded-xl bg-gradient-to-r from-[#3b82f6]/20 to-[#1e3a8a]/20 border border-[#3b82f6]/30 p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    RECENT_ACHIEVEMENTS[currentAchievement].type ===
                    "achievement"
                      ? "bg-[#f59e0b]/20"
                      : RECENT_ACHIEVEMENTS[currentAchievement].type ===
                        "research"
                      ? "bg-[#3b82f6]/20"
                      : "bg-[#1e3a8a]/20"
                  }`}
                >
                  {RECENT_ACHIEVEMENTS[currentAchievement].type ===
                  "achievement" ? (
                    <Award className="w-5 h-5 text-[#f59e0b]" />
                  ) : RECENT_ACHIEVEMENTS[currentAchievement].type ===
                    "research" ? (
                    <BookOpen className="w-5 h-5 text-[#3b82f6]" />
                  ) : (
                    <Users className="w-5 h-5 text-[#1e3a8a]" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">
                    {RECENT_ACHIEVEMENTS[currentAchievement].title}
                  </h4>
                  <p className="text-sm text-white/80 mb-2">
                    {RECENT_ACHIEVEMENTS[currentAchievement].description}
                  </p>
                  <span className="text-xs text-white/60">
                    {RECENT_ACHIEVEMENTS[currentAchievement].date}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Today's Status */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-[#f59e0b]/30">
            <h3 className="text-xl font-bold text-[#f59e0b] mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Campus Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/20 to-green-500/10 rounded-xl border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Active Classes</span>
                </div>
                <span className="text-2xl font-bold text-green-400">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#3b82f6]/20 to-[#3b82f6]/10 rounded-xl border border-[#3b82f6]/30">
                <div className="flex items-center gap-3">
                  <Wifi className="w-4 h-4 text-[#3b82f6]" />
                  <span className="text-white font-medium">Network Status</span>
                </div>
                <span className="text-lg font-bold text-[#3b82f6]">
                  Optimal
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/10 rounded-xl border border-[#f59e0b]/30">
                <div className="flex items-center gap-3">
                  <Coffee className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-white font-medium">Cafeteria</span>
                </div>
                <span className="text-lg font-bold text-[#f59e0b]">Open</span>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <h3 className="text-xl font-bold text-[#f59e0b] mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Quick Access
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-[#3b82f6]/20 hover:to-[#1e3a8a]/10 rounded-xl transition-all border border-white/10 hover:border-[#3b82f6]/30">
                <div className="font-semibold text-white">Student Portal</div>
                <div className="text-sm text-white/70">
                  Access academic resources & grades
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-[#3b82f6]/20 hover:to-[#1e3a8a]/10 rounded-xl transition-all border border-white/10 hover:border-[#3b82f6]/30">
                <div className="font-semibold text-white">Research Hub</div>
                <div className="text-sm text-white/70">
                  Latest publications & projects
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
