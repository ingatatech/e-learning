"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Edit, Save, Loader2, MapPin, Phone, Globe, FileText, User, Upload, X } from "lucide-react"
import { toast } from "sonner"
import rwandaData from "@/data/rwandaLocation.json"

interface Organization {
  id: number
  name: string
  description: string
  address: string
  city: string
  country: string
  phoneNumber: string
  website: string
  director: string
  createdAt: string
  updatedAt: string
  stampUrl: string
}

export default function OrgManagement() {
  const { token, user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [stampFile, setStampFile] = useState<File | null>(null)
  const [stampPreview, setStampPreview] = useState<string>("")
  const [uploadingStamp, setUploadingStamp] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: {
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
    },
    city: "",
    country: "",
    phoneNumber: "",
    website: "",
    director: "",
    stampUrl: "",
  })

  useEffect(() => {
    const provinceList = Object.keys(rwandaData)
    setProvinces(provinceList)
  }, [])

  useEffect(() => {
    if (formData.address.province) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtList = Object.keys(provinceData)
      setDistricts(districtList)

      if (!isInitialLoad && !isEditing) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            district: "",
            sector: "",
            cell: "",
            village: "",
          },
        }))
        setSectors([])
        setCells([])
        setVillages([])
      }
    }
  }, [formData.address.province, isInitialLoad, isEditing])

  useEffect(() => {
    if (formData.address.province && formData.address.district) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorList = Object.keys(districtData)
      setSectors(sectorList)

      if (!isInitialLoad && !isEditing) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            sector: "",
            cell: "",
            village: "",
          },
        }))
        setCells([])
        setVillages([])
      }
    }
  }, [formData.address.district, isInitialLoad, isEditing])

  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorData = districtData[formData.address.sector as keyof typeof districtData]
      const cellList = Object.keys(sectorData)
      setCells(cellList)

      if (!isInitialLoad && !isEditing) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            cell: "",
            village: "",
          },
        }))
        setVillages([])
      }
    }
  }, [formData.address.sector, isInitialLoad, isEditing])

  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector && formData.address.cell) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorData = districtData[formData.address.sector as keyof typeof districtData]
      const cellData = sectorData[formData.address.cell as keyof typeof sectorData]

      if (Array.isArray(cellData)) {
        setVillages(cellData)

        if (!isInitialLoad && !isEditing) {
          setFormData((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              village: "",
            },
          }))
        }
      }
    }
  }, [formData.address.cell, isInitialLoad, isEditing])

  useEffect(() => {
    if (!token || !user) return

    const fetchOrg = async () => {
      setIsInitialLoad(true)
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

          let parsedAddress = {
            province: "",
            district: "",
            sector: "",
            cell: "",
            village: "",
          }

          try {
            if (data.organization.address) {
              parsedAddress = JSON.parse(data.organization.address)
            }
          } catch {
            console.error("Invalid address format in organization data")
          }

          setFormData({
            name: data.organization.name || "",
            description: data.organization.description || "",
            address: parsedAddress,
            city: data.organization.city || "",
            country: data.organization.country || "",
            phoneNumber: data.organization.phoneNumber || "",
            website: data.organization.website || "",
            director: data.organization.director || "",
            stampUrl: data.organization.stampUrl || "",
          })

          if (data.organization.stampUrl) {
            setStampPreview(data.organization.stampUrl)
          }

          setTimeout(() => setIsInitialLoad(false), 100)
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error)
        toast.error("Failed to load organization details")
        setIsInitialLoad(false)
      } finally {
        setLoading(false)
      }
    }

    fetchOrg()
  }, [token, user])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }
      setStampFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setStampPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadStamp = async (): Promise<string> => {
    if (!stampFile) return formData.stampUrl

    setUploadingStamp(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", stampFile)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      })

      if (!res.ok) throw new Error("Failed to upload stamp")
      const data = await res.json()
      return data.url
    } catch (error) {
      console.error("Failed to upload stamp:", error)
      toast.error("Failed to upload stamp image")
      return formData.stampUrl
    } finally {
      setUploadingStamp(false)
    }
  }

  const removeStamp = () => {
    setStampFile(null)
    setStampPreview("")
    setFormData((prev) => ({ ...prev, stampUrl: "" }))
  }

  const handleSave = async () => {
    if (!organization) return

    setIsSaving(true)
    try {
      let stampUrl = formData.stampUrl
      if (stampFile) {
        stampUrl = await uploadStamp()
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${organization.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, stampUrl }),
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
      let parsedAddress = {
        province: "",
        district: "",
        sector: "",
        cell: "",
        village: "",
      }

      try {
        if (organization.address) {
          parsedAddress = JSON.parse(organization.address)
        }
      } catch {
        console.error("Invalid address format")
      }

      setIsInitialLoad(true)
      setFormData({
        name: organization.name || "",
        description: organization.description || "",
        address: parsedAddress,
        city: organization.city || "",
        country: organization.country || "",
        phoneNumber: organization.phoneNumber || "",
        website: organization.website || "",
        director: organization.director || "",
        stampUrl: organization.stampUrl || "",
      })

      if (organization.stampUrl) {
        setStampPreview(organization.stampUrl)
      } else {
        setStampPreview("")
      }
      setStampFile(null)

      setTimeout(() => setIsInitialLoad(false), 100)
    }
    setIsEditing(false)
  }

  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

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
                <Label htmlFor="director">Director Name</Label>
                <Input
                  id="director"
                  value={formData.director}
                  onChange={(e) => handleInputChange("director", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="Rwanda"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Province</Label>
                    <select
                      value={formData.address.province}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, province: e.target.value },
                        }))
                      }
                      className="w-full border rounded-md p-2 bg-background"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>District</Label>
                    <select
                      value={formData.address.district}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, district: e.target.value },
                        }))
                      }
                      className="w-full border rounded-md p-2 bg-background"
                      disabled={!districts.length}
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <select
                      value={formData.address.sector}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, sector: e.target.value },
                        }))
                      }
                      className="w-full border rounded-md p-2 bg-background"
                      disabled={!sectors.length}
                    >
                      <option value="">Select Sector</option>
                      {sectors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cell</Label>
                    <select
                      value={formData.address.cell}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, cell: e.target.value },
                        }))
                      }
                      className="w-full border rounded-md p-2 bg-background"
                      disabled={!cells.length}
                    >
                      <option value="">Select Cell</option>
                      {cells.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Village</Label>
                    <select
                      value={formData.address.village}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, village: e.target.value },
                        }))
                      }
                      className="w-full border rounded-md p-2 bg-background"
                      disabled={!villages.length}
                    >
                      <option value="">Select Village</option>
                      {villages.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
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

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="stamp">Organization Stamp</Label>
                <p className="text-sm text-muted-foreground">
                  Upload an official stamp image to be used on certificates
                </p>

                {stampPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={stampPreview || "/placeholder.svg"}
                      alt="Stamp preview"
                      className="w-32 h-32 object-contain border-2 border-dashed border-primary rounded-lg p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeStamp}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="stamp-upload"
                      className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Choose Stamp Image</span>
                    </label>
                    <input
                      id="stamp-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleStampChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSaving || uploadingStamp}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving || uploadingStamp ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving || uploadingStamp}>
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
                      <User className="w-4 h-4" />
                      <span>Director</span>
                    </div>
                    <p className="text-base">{organization.director || "No director assigned"}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>Address</span>
                    </div>
                    {(() => {
                      let addressObj: any = {}
                      try {
                        addressObj = JSON.parse(organization.address || "{}")
                      } catch {
                        addressObj = {}
                      }

                      const hasAddress =
                        addressObj.province ||
                        addressObj.district ||
                        addressObj.sector ||
                        addressObj.cell ||
                        addressObj.village

                      return hasAddress ? (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          {organization.country && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Country:</span>
                              <span className="text-sm">{organization.country}</span>
                            </div>
                          )}
                          {addressObj.province && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Province:</span>
                              <span className="text-sm">{addressObj.province}</span>
                            </div>
                          )}
                          {addressObj.district && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">District:</span>
                              <span className="text-sm">{addressObj.district}</span>
                            </div>
                          )}
                          {addressObj.sector && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Sector:</span>
                              <span className="text-sm">{addressObj.sector}</span>
                            </div>
                          )}
                          {addressObj.cell && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Cell:</span>
                              <span className="text-sm">{addressObj.cell}</span>
                            </div>
                          )}
                          {addressObj.village && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Village:</span>
                              <span className="text-sm">{addressObj.village}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-base text-muted-foreground">No address provided</p>
                      )
                    })()}
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

              {organization.stampUrl && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Building className="w-4 h-4" />
                    <span>Organization Stamp</span>
                  </div>
                  <img
                    src={organization.stampUrl || "/placeholder.svg"}
                    alt="Organization stamp"
                    className="w-32 h-32 object-contain border-2 border-primary rounded-lg p-2"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
