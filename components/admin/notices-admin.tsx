"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Trash2,
  Plus,
  Save,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  AlertCircle,
  Info,
  Bell,
  Star,
  Users,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"

interface Notice {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "announcement" | "event" | "deadline" | "achievement"
  date: string
  priority?: "critical" | "high" | "medium" | "low"
  category?: string
  author?: string
  validUntil?: string
  isNew?: boolean
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

const NOTICE_TYPES = [
  { value: "info", label: "Information", icon: Info, color: "bg-blue-500/20 text-blue-300" },
  { value: "warning", label: "Warning", icon: AlertCircle, color: "bg-yellow-500/20 text-yellow-300" },
  { value: "announcement", label: "Announcement", icon: Bell, color: "bg-purple-500/20 text-purple-300" },
  { value: "event", label: "Event", icon: Calendar, color: "bg-green-500/20 text-green-300" },
  { value: "deadline", label: "Deadline", icon: Clock, color: "bg-red-500/20 text-red-300" },
  { value: "achievement", label: "Achievement", icon: Star, color: "bg-yellow-500/20 text-yellow-300" },
]

const PRIORITY_LEVELS = [
  { value: "critical", label: "Critical", color: "bg-red-500/20 text-red-300" },
  { value: "high", label: "High", color: "bg-orange-500/20 text-orange-300" },
  { value: "medium", label: "Medium", color: "bg-blue-500/20 text-blue-300" },
  { value: "low", label: "Low", color: "bg-gray-500/20 text-gray-300" },
]

const CATEGORIES = [
  "Academic",
  "Administrative",
  "Events",
  "Facilities",
  "Research",
  "Student Affairs",
  "IT Services",
  "Library",
  "General",
]

export default function NoticesAdmin() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as Notice["type"],
    priority: "medium" as Notice["priority"],
    category: "",
    author: "",
    date: new Date().toISOString().split("T")[0],
    validUntil: "",
    isNew: true,
    isActive: true,
  })

  useEffect(() => {
    loadNotices()
  }, [])

  const loadNotices = () => {
    const savedNotices = localStorage.getItem("notices")
    if (savedNotices) {
      const parsedNotices = JSON.parse(savedNotices)
      // Ensure all notices have required fields
      const updatedNotices = parsedNotices.map((notice: any) => ({
        ...notice,
        isActive: notice.isActive !== undefined ? notice.isActive : true,
        createdAt: notice.createdAt || new Date().toISOString(),
        updatedAt: notice.updatedAt || new Date().toISOString(),
        priority: notice.priority || "medium",
      }))
      setNotices(updatedNotices)
    }
  }

  const saveNotices = (updatedNotices: Notice[]) => {
    localStorage.setItem("notices", JSON.stringify(updatedNotices))
    setNotices(updatedNotices)
  }

  const addOrUpdateNotice = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please fill in all required fields (Title and Message)")
      return
    }

    const now = new Date().toISOString()

    if (editingId) {
      const updatedNotices = notices.map((notice) =>
        notice.id === editingId
          ? {
              ...notice,
              ...formData,
              updatedAt: now,
            }
          : notice,
      )
      saveNotices(updatedNotices)
      setEditingId(null)
    } else {
      const newNotice: Notice = {
        id: Date.now().toString(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      }
      saveNotices([...notices, newNotice])
    }

    resetForm()
  }

  const editNotice = (notice: Notice) => {
    setFormData({
      title: notice.title,
      message: notice.message,
      type: notice.type,
      priority: notice.priority || "medium",
      category: notice.category || "",
      author: notice.author || "",
      date: notice.date,
      validUntil: notice.validUntil || "",
      isNew: notice.isNew || false,
      isActive: notice.isActive !== undefined ? notice.isActive : true,
    })
    setEditingId(notice.id)
  }

  const deleteNotice = (id: string) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      const updatedNotices = notices.filter((notice) => notice.id !== id)
      saveNotices(updatedNotices)
    }
  }

  const toggleNoticeStatus = (id: string) => {
    const updatedNotices = notices.map((notice) =>
      notice.id === id
        ? {
            ...notice,
            isActive: !notice.isActive,
            updatedAt: new Date().toISOString(),
          }
        : notice,
    )
    saveNotices(updatedNotices)
  }

  const duplicateNotice = (notice: Notice) => {
    const duplicatedNotice: Notice = {
      ...notice,
      id: Date.now().toString(),
      title: `${notice.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isNew: true,
    }
    saveNotices([...notices, duplicatedNotice])
  }

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      category: "",
      author: "",
      date: new Date().toISOString().split("T")[0],
      validUntil: "",
      isNew: true,
      isActive: true,
    })
    setEditingId(null)
  }

  const getIcon = (type: Notice["type"]) => {
    const noticeType = NOTICE_TYPES.find((t) => t.value === type)
    if (noticeType) {
      const IconComponent = noticeType.icon
      return <IconComponent className="w-5 h-5" />
    }
    return <Info className="w-5 h-5" />
  }

  const getTypeColor = (type: Notice["type"]) => {
    const noticeType = NOTICE_TYPES.find((t) => t.value === type)
    return noticeType?.color || "bg-gray-500/20 text-gray-300"
  }

  const getPriorityColor = (priority: Notice["priority"]) => {
    const priorityLevel = PRIORITY_LEVELS.find((p) => p.value === priority)
    return priorityLevel?.color || "bg-gray-500/20 text-gray-300"
  }

  // Filter notices based on search and filters
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notice.author && notice.author.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === "all" || notice.type === filterType
    const matchesPriority = filterPriority === "all" || notice.priority === filterPriority
    const matchesStatus = showInactive || notice.isActive

    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  const activeNoticesCount = notices.filter((n) => n.isActive).length
  const criticalNoticesCount = notices.filter((n) => n.priority === "critical" && n.isActive).length
  const newNoticesCount = notices.filter((n) => n.isNew && n.isActive).length

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#1e3a8a]">Notices Management</h2>
          <p className="text-gray-600 mt-1">Create, edit, and manage digital signage notices</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center bg-[#1e3a8a]/10 px-4 py-3 rounded-xl border border-[#1e3a8a]/20">
            <div className="text-2xl font-bold text-[#1e3a8a]">{activeNoticesCount}</div>
            <div className="text-xs text-[#1e3a8a]/80">Active</div>
          </div>
          <div className="text-center bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
            <div className="text-2xl font-bold text-red-600">{criticalNoticesCount}</div>
            <div className="text-xs text-red-600/80">Critical</div>
          </div>
          <div className="text-center bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20">
            <div className="text-2xl font-bold text-green-600">{newNoticesCount}</div>
            <div className="text-xs text-green-600/80">New</div>
          </div>
          <Button onClick={() => saveNotices(notices)} className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1e3a8a] flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search Notices</Label>
              <Input
                id="search"
                placeholder="Search by title, message, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterType">Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {NOTICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterPriority">Filter by Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITY_LEVELS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch id="showInactive" checked={showInactive} onCheckedChange={setShowInactive} />
                <Label htmlFor="showInactive" className="text-sm">
                  Show Inactive
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Notice Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1e3a8a] flex items-center gap-2">
            {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingId ? "Edit Notice" : "Add New Notice"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notice title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter notice message"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: Notice["type"]) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: Notice["priority"]) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Author name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                  />
                  <Label htmlFor="isNew">Mark as New</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={addOrUpdateNotice} className="bg-[#3b82f6] hover:bg-[#3b82f6]/90">
                  {editingId ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {editingId ? "Update Notice" : "Add Notice"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1e3a8a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Current Notices ({filteredNotices.length})
            </div>
            <Button variant="outline" size="sm" onClick={loadNotices}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotices.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No notices found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredNotices
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((notice) => (
                  <div
                    key={notice.id}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      notice.isActive
                        ? "bg-white border-gray-200 hover:border-[#1e3a8a]/30"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-[#1e3a8a]">{getIcon(notice.type)}</div>
                          <h3 className="font-bold text-[#1e3a8a] text-lg">{notice.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(notice.type)}>{notice.type.toUpperCase()}</Badge>
                            <Badge className={getPriorityColor(notice.priority)}>
                              {notice.priority?.toUpperCase()}
                            </Badge>
                            {notice.isNew && <Badge className="bg-green-500/20 text-green-600">NEW</Badge>}
                            {!notice.isActive && <Badge className="bg-gray-500/20 text-gray-600">INACTIVE</Badge>}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">{notice.message}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          {notice.category && (
                            <div className="flex items-center gap-1">
                              <Filter className="w-4 h-4" />
                              <span>{notice.category}</span>
                            </div>
                          )}
                          {notice.author && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{notice.author}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(notice.date).toLocaleDateString()}</span>
                          </div>
                          {notice.validUntil && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Until {new Date(notice.validUntil).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleNoticeStatus(notice.id)}
                          className={notice.isActive ? "text-orange-600" : "text-green-600"}
                        >
                          {notice.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => duplicateNotice(notice)}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => editNotice(notice)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteNotice(notice.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
