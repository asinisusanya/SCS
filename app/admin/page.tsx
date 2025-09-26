"use client"

import { useState } from "react"
import TimetableAdmin from "@/components/admin/timetable-admin"
import NoticesAdmin from "@/components/admin/notices-admin"
import { Button } from "@/components/ui/button"
import { Calendar, Bell, Home } from "lucide-react"
import Link from "next/link"

type AdminTab = "timetable" | "notices"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("timetable")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e3a8a] text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Digital Signage Admin</h1>
          <Link href="/">
            <Button variant="outline" className="text-[#003366] border-white hover:bg-white/10">
              <Home className="w-4 h-4 mr-2" />
              View Signage
            </Button>
          </Link>
        </div>
        <p className="text-[#3b82f6] mt-2">Department of Statistics & Computer Science</p>
      </header>

      <div className="flex">
        <nav className="w-64 bg-white shadow-lg min-h-[calc(100vh-120px)]">
          <div className="p-6">
            <div className="space-y-2">
              <Button
                variant={activeTab === "timetable" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "timetable" ? "bg-[#1e3a8a] hover:bg-[#1e3a8a]/90" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("timetable")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Timetable Management
              </Button>
              <Button
                variant={activeTab === "notices" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "notices" ? "bg-[#1e3a8a] hover:bg-[#1e3a8a]/90" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("notices")}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notices Management
              </Button>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-6">
          {activeTab === "timetable" && <TimetableAdmin />}
          {activeTab === "notices" && <NoticesAdmin />}
        </main>
      </div>
    </div>
  )
}
