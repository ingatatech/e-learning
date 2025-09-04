"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Camera, Save, Award, BookOpen, Clock, Target } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    bio: "",
    preferredLanguage: "en",
    theme: "light",
  })

  const handleSave = () => {
    // TODO: Implement profile update API call
    setIsEditing(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "default" : "outline"}>
          {isEditing ? <Save className="w-4 h-4 mr-2" /> : "Edit Profile"}
          {isEditing ? "Save Changes" : ""}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      variant="secondary"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary">Level {user.level}</Badge>
                    <Badge variant="outline">{user.totalPoints} points</Badge>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={formData.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(value) => handleChange("preferredLanguage", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="rw">Kinyarwanda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{user.streakDays}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{user.totalPoints}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{user.level}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">45</span>
                  <span className="text-sm text-muted-foreground">hrs</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Badges</CardTitle>
              <CardDescription>Your learning milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Mock achievements */}
                {[
                  { name: "First Steps", description: "Completed first course", icon: "🎓", earned: true },
                  { name: "Week Streak", description: "7 days learning streak", icon: "🔥", earned: true },
                  { name: "Quick Learner", description: "Completed 5 lessons in one day", icon: "⚡", earned: true },
                  { name: "Course Master", description: "Complete 10 courses", icon: "📚", earned: false },
                  { name: "Point Collector", description: "Earn 1000 points", icon: "⭐", earned: false },
                  { name: "Social Learner", description: "Join 5 discussions", icon: "💬", earned: false },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      achievement.earned ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="font-medium">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && <Badge className="mt-2">Earned</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your learning activity and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock activity */}
                {[
                  { action: "Completed lesson", detail: "React State Management", time: "2 hours ago" },
                  { action: "Earned badge", detail: "Week Streak", time: "1 day ago" },
                  { action: "Started course", detail: "Advanced JavaScript", time: "3 days ago" },
                  { action: "Completed quiz", detail: "JavaScript Fundamentals Quiz", time: "5 days ago" },
                  { action: "Joined discussion", detail: "Best practices for React", time: "1 week ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.detail}</p>
                    </div>
                    <Badge variant="secondary">{activity.time}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
