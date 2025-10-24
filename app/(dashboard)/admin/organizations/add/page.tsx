"use client"

import type React from "react"

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
import rwandaData from "@/data/rwandaLocation.json"

export default function OrganizationFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orgId = searchParams.get("id")
  const { token } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    country: "",
    phoneNumber: "",
    website: "",
    director: "",
    address: {
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
    },
  })
  const [editMode, setEditMode] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

  useEffect(() => {
    const provinceList = Object.keys(rwandaData)
    setProvinces(provinceList)
  }, [])

  useEffect(() => {
    if (formData.address.province) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtList = Object.keys(provinceData)
      setDistricts(districtList)

      if (!isInitialLoad) {
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
  }, [formData.address.province, isInitialLoad])

  useEffect(() => {
    if (formData.address.province && formData.address.district) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorList = Object.keys(districtData)
      setSectors(sectorList)

      if (!isInitialLoad) {
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
  }, [formData.address.district, isInitialLoad])

  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorData = districtData[formData.address.sector as keyof typeof districtData]
      const cellList = Object.keys(sectorData)
      setCells(cellList)

      if (!isInitialLoad) {
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
  }, [formData.address.sector, isInitialLoad])

  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector && formData.address.cell) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorData = districtData[formData.address.sector as keyof typeof districtData]
      const cellData = sectorData[formData.address.cell as keyof typeof sectorData]

      if (Array.isArray(cellData)) {
        setVillages(cellData)

        if (!isInitialLoad) {
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
  }, [formData.address.cell, isInitialLoad])

  useEffect(() => {
    if (!orgId) return
    setEditMode(true)
    setIsFetching(true)
    setIsInitialLoad(true)
    const fetchOrg = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch organization")
        const data = await res.json()

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
        })

        setTimeout(() => setIsInitialLoad(false), 100)
      } catch (err: any) {
        toast.error(err.message)
        setIsInitialLoad(false)
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
                <Label htmlFor="director">Director Name</Label>
                <Input
                  id="director"
                  value={formData.director}
                  onChange={(e) => handleInputChange("director", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

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
                    className="w-full border rounded-md p-2"
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
                    className="w-full border rounded-md p-2"
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
                    className="w-full border rounded-md p-2"
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
                    className="w-full border rounded-md p-2"
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
                    className="w-full border rounded-md p-2"
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
                  {isLoading
                    ? editMode
                      ? "Updating..."
                      : "Creating..."
                    : editMode
                      ? "Update Organization"
                      : "Create Organization"}
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
