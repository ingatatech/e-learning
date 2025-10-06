"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export default function AddUserPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, user } = useAuth()
  const userId = searchParams.get("id")


  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    organizationId: user?.organization?.id,
  })

  const fetchUser = async (id: string) => {
    try {
      setIsFetching(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/get/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      console.log(data)
      if (res.ok) setFormData({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        role: data.user.role,
        organizationId: data.user.organization?.id.toString() || "",
      })
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (userId) fetchUser(userId)
  }, [userId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const method = userId ? "PUT" : "POST"
      const endpoint = userId
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/update/${userId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/auth/add`

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to save user")
      toast.success(`User ${userId ? "updated" : "created"} successfully!`)
      router.push("/sysAdmin/users")
    } catch (err:any) {
      toast.error(err.message || `Failed to ${userId ? "update" : "create"} user`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/sysAdmin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{userId ? "Edit User" : "Add New User"}</h1>
          <p className="text-muted-foreground">{userId ? "Update user account" : "Create a new user account"}</p>
        </div>
      </div>

      <Card className="max-w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            User Information
          </CardTitle>
          <CardDescription>Fill in the details to {userId ? "update" : "create"} a user account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="johndoe@example.com"
                required
                readOnly={!!userId}
                disabled={!!userId}
              />
            </div>
            {userId && <p className="text-muted-foreground text-sm">Email address is not allowed to be changed.</p>}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading ? (userId ? "Updating..." : "Creating...") : userId ? "Update User" : "Create User"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
