"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Edit, Save, Loader2, MapPin, Phone, Globe, FileText } from "lucide-react"
import { toast } from "sonner"

interface Organization {
  id: number
  name: string
  description: string
  address: string
  city: string
  country: string
  phoneNumber: string
  website: string
  createdAt: string
  updatedAt: string
}

export default function OrgManagement() {
  const { token, user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "",
    phoneNumber: "",
    website: "",
  })

  useEffect(() => {
    if (!token || !user) return

    const fetchOrg = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${user.organization?.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const data = await res.json()
          setOrganization(data.organization)
          setFormData({
            name: data.organization.name || "",
            description: data.organization.description || "",
            address: data.organization.address || "",
            city: data.organization.city || "",
            country: data.organization.country || "",
            phoneNumber: data.organization.phoneNumber || "",
            website: data.organization.website || "",
          })
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error)
        toast.error("Failed to load organization details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrg()
  }, [token, user])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!organization) return

    setIsSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${organization.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const updatedData = await res.json()
        setOrganization(updatedData.organization)
        setIsEditing(false)
        toast.success("Organization updated successfully!")
      } else {
        throw new Error("Failed to update organization")
      }
    } catch (error) {
      console.error("Failed to update organization:", error)
      toast.error("Failed to update organization")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        description: organization.description || "",
        address: organization.address || "",
        city: organization.city || "",
        country: organization.country || "",
        phoneNumber: organization.phoneNumber || "",
        website: organization.website || "",
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">No Organization Found</h2>
        <p className="text-muted-foreground">Unable to load organization details</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Details</h1>
          <p className="text-muted-foreground">View and manage your organization information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Organization
          </Button>
        )}
      </div>

      {/* Organization Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            {isEditing ? "Update your organization details" : "Your organization's current information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Organization Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of your organization"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="+250 788 123 456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Building className="w-4 h-4" />
                      <span>Organization Name</span>
                    </div>
                    <p className="text-lg font-medium">{organization.name}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <FileText className="w-4 h-4" />
                      <span>Description</span>
                    </div>
                    <p className="text-base">{organization.description || "No description provided"}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>Address</span>
                    </div>
                    <p className="text-base">
                      {organization.address || "No address"}
                      {organization.city && `, ${organization.city}`}
                      {organization.country && `, ${organization.country}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </div>
                    <p className="text-base">{organization.phoneNumber || "No phone number"}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </div>
                    {organization.website ? (
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-primary hover:underline"
                      >
                        {organization.website}
                      </a>
                    ) : (
                      <p className="text-base">No website</p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(organization.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
