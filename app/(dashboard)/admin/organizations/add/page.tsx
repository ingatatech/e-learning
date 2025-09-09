"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export default function OrganizationFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orgId = searchParams.get("id")
  const { token } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "",
    phoneNumber: "",
    website: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  // Fetch org if editing
  useEffect(() => {
    if (!orgId) return
    setEditMode(true)
    setIsFetching(true)
    const fetchOrg = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch organization")
        const data = await res.json()
        setFormData({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          phoneNumber: data.phoneNumber || "",
          website: data.website || "",
        })
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setIsFetching(false)
      }
    }
    fetchOrg()
  }, [orgId, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const method = editMode ? "PUT" : "POST"
      const url = editMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/organizations/${orgId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/organizations`

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Something went wrong")
      toast.success(editMode ? "Organization updated!" : "Organization created!")
      router.push("/admin/organizations")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{editMode ? "Edit Organization" : "Add New Organization"}</h1>
          <p className="text-muted-foreground">
            {editMode ? "Update organization details" : "Create a new organization"}
          </p>
        </div>
      </div>

      <Card className="max-w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Organization Information
          </CardTitle>
          <CardDescription>Fill in the details</CardDescription>
        </CardHeader>
        <CardContent>
            {isFetching ? (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Example Organization"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="A corporate organization that provides services."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="KN 231 st"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Kigali"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Rwanda"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="+250 789 000 000 "
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://something.com"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (editMode ? "Updating..." : "Creating...") : editMode ? "Update Organization" : "Create Organization"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        </CardContent>
      </Card>
    </div>
  )
}
