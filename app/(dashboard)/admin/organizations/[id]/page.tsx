"use client"

import { useAuth } from "@/hooks/use-auth"
import { use, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Edit, Loader2, MapPin, Phone, Globe, FileText, User, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
}

export default function OrgManagement({ params }: { params: Promise<{ id: string }> }) {
  const { token, user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    if (!token || !user) return

    const fetchOrg = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const data = await res.json()
          setOrganization(data.organization)
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
        <div className="flex items-center gap-4">
          <Link href="/admin/organizations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Organization Details</h1>
            <p className="text-muted-foreground">View and manage your organization information</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/organizations/add?id=${id}`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Organization
        </Button>
      </div>

      {/* Organization Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Organization Information
          </CardTitle>
          <CardDescription>Your organization's current information</CardDescription>
        </CardHeader>
        <CardContent>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
