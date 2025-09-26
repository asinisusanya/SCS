"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Save } from "lucide-react"

interface TimetableEntry {
  id: string
  timeSlot: string
  hall: string
  courseCode: string
  lecturer: string
  subject?: string
  students?: number
  type?: "lecture" | "lab" | "tutorial"
}

interface WeeklyTimetable {
  [key: string]: TimetableEntry[]
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
]

const HALLS = ["Auditorium", "Lab1", "Lab2", "Lab3", "Lab4", "SCLT1", "SCLT2", "Tutorial Room", "Research Lab"]
const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const CLASS_TYPES = ["lecture", "lab", "tutorial"]

export default function TimetableAdmin() {
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>({})
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [newEntry, setNewEntry] = useState({
    timeSlot: "",
    hall: "",
    courseCode: "",
    lecturer: "",
    subject: "",
    students: "",
    type: "lecture" as "lecture" | "lab" | "tutorial",
  })

  useEffect(() => {
    const savedWeeklyTimetable = localStorage.getItem("weeklyTimetable")
    if (savedWeeklyTimetable) {
      setWeeklyTimetable(JSON.parse(savedWeeklyTimetable))
    } else {
      // Initialize empty timetables for all days
      const emptyTimetable: WeeklyTimetable = {}
      WORKING_DAYS.forEach((day) => {
        emptyTimetable[day] = []
      })
      setWeeklyTimetable(emptyTimetable)
    }
  }, [])

  const saveWeeklyTimetable = () => {
    localStorage.setItem("weeklyTimetable", JSON.stringify(weeklyTimetable))
    alert("Weekly timetable saved successfully!")
  }

  const addEntry = () => {
    if (!newEntry.timeSlot || !newEntry.hall || !newEntry.courseCode || !newEntry.lecturer) {
      alert("Please fill all required fields")
      return
    }

    const entry: TimetableEntry = {
      id: Date.now().toString(),
      timeSlot: newEntry.timeSlot,
      hall: newEntry.hall,
      courseCode: newEntry.courseCode,
      lecturer: newEntry.lecturer,
      subject: newEntry.subject || undefined,
      students: newEntry.students ? Number.parseInt(newEntry.students) : undefined,
      type: newEntry.type,
    }

    setWeeklyTimetable((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), entry],
    }))

    setNewEntry({
      timeSlot: "",
      hall: "",
      courseCode: "",
      lecturer: "",
      subject: "",
      students: "",
      type: "lecture",
    })
  }

  const deleteEntry = (day: string, id: string) => {
    setWeeklyTimetable((prev) => ({
      ...prev,
      [day]: prev[day]?.filter((entry) => entry.id !== id) || [],
    }))
  }

  const copyDaySchedule = (fromDay: string, toDay: string) => {
    if (fromDay === toDay) return

    const fromSchedule = weeklyTimetable[fromDay] || []
    const copiedSchedule = fromSchedule.map((entry) => ({
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }))

    setWeeklyTimetable((prev) => ({
      ...prev,
      [toDay]: copiedSchedule,
    }))

    alert(`Schedule copied from ${fromDay} to ${toDay}`)
  }

  const clearDaySchedule = (day: string) => {
    if (confirm(`Are you sure you want to clear all entries for ${day}?`)) {
      setWeeklyTimetable((prev) => ({
        ...prev,
        [day]: [],
      }))
    }
  }

  const getCurrentDayEntries = () => {
    return weeklyTimetable[selectedDay] || []
  }

  const getTotalEntriesCount = () => {
    return Object.values(weeklyTimetable).reduce((total, dayEntries) => total + dayEntries.length, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a8a]">Weekly Timetable Management</h2>
          <p className="text-gray-600">Manage schedules for all working days (9 rooms total)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1e3a8a]">{getTotalEntriesCount()}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
          <Button onClick={saveWeeklyTimetable} className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {WORKING_DAYS.map((day) => (
            <TabsTrigger key={day} value={day} className="relative">
              {day}
              {weeklyTimetable[day]?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1e3a8a] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {weeklyTimetable[day].length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {WORKING_DAYS.map((day) => (
          <TabsContent key={day} value={day} className="space-y-6">
            {/* Day Management Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1e3a8a] flex items-center justify-between">
                  {day} Schedule Management
                  <div className="flex gap-2">
                    <Select onValueChange={(fromDay) => copyDaySchedule(fromDay, day)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Copy from another day" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKING_DAYS.filter((d) => d !== day).map((d) => (
                          <SelectItem key={d} value={d}>
                            Copy from {d} ({weeklyTimetable[d]?.length || 0} classes)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => clearDaySchedule(day)} className="text-red-600">
                      Clear Day
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div>
                    <Label htmlFor="timeSlot">Time Slot *</Label>
                    <Select
                      value={newEntry.timeSlot}
                      onValueChange={(value) => setNewEntry({ ...newEntry, timeSlot: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hall">Room *</Label>
                    <Select value={newEntry.hall} onValueChange={(value) => setNewEntry({ ...newEntry, hall: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {HALLS.map((hall) => (
                          <SelectItem key={hall} value={hall}>
                            {hall}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="courseCode">Course Code *</Label>
                    <Input
                      id="courseCode"
                      value={newEntry.courseCode}
                      onChange={(e) => setNewEntry({ ...newEntry, courseCode: e.target.value })}
                      placeholder="CSC1031"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                      placeholder="Programming"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lecturer">Lecturer *</Label>
                    <Input
                      id="lecturer"
                      value={newEntry.lecturer}
                      onChange={(e) => setNewEntry({ ...newEntry, lecturer: e.target.value })}
                      placeholder="Dr. Hakim"
                    />
                  </div>
                  <div>
                    <Label htmlFor="students">Students</Label>
                    <Input
                      id="students"
                      type="number"
                      value={newEntry.students}
                      onChange={(e) => setNewEntry({ ...newEntry, students: e.target.value })}
                      placeholder="45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newEntry.type}
                      onValueChange={(value: "lecture" | "lab" | "tutorial") =>
                        setNewEntry({ ...newEntry, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addEntry} className="mt-4 bg-[#3b82f6] hover:bg-[#3b82f6]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to {day}
                </Button>
              </CardContent>
            </Card>

            {/* Current Day Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1e3a8a]">
                  {day} Schedule ({getCurrentDayEntries().length} classes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getCurrentDayEntries().length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No classes scheduled for {day}. Add some entries above.
                    </p>
                  ) : (
                    getCurrentDayEntries()
                      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                      .map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-6 gap-4 flex-1">
                            <span className="font-medium text-sm">{entry.timeSlot}</span>
                            <span className="text-[#3b82f6] font-medium text-sm">{entry.hall}</span>
                            <span className="text-[#1e3a8a] font-bold text-sm">{entry.courseCode}</span>
                            <span className="text-sm">{entry.subject || "-"}</span>
                            <span className="text-sm">{entry.lecturer}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  entry.type === "lab"
                                    ? "bg-blue-100 text-blue-800"
                                    : entry.type === "tutorial"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {entry.type}
                              </span>
                              {entry.students && <span className="text-xs text-gray-600">({entry.students})</span>}
                            </div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => deleteEntry(day, entry.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
