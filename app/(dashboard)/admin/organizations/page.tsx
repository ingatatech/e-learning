"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Building, MoreHorizontal, Edit, Trash2, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Organization } from "@/types"

export default function OrganizationsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)


const handleDeleteClick = (id: number) => {
  setOrgToDelete(id)
  setIsDeleteOpen(true)
}

const confirmDelete = async () => {
  if (!orgToDelete) return
  setIsDeleting(true)
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${orgToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error("Failed to delete organization")
    setOrganizations((prev) => prev.filter((o) => o.id !== orgToDelete))
  } catch (err: any) {
    console.error(err)
  } finally {
    setIsDeleting(false)
    setIsDeleteOpen(false)
    setOrgToDelete(null)
  }
}

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (typeof window === "undefined") return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data.organizations)
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  const filteredOrganizations = organizations.filter((org) =>
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground">Manage organizations and their settings</p>
          </div>
          <Button asChild>
            <Link href="/admin/organizations/add">
              <Building className="w-4 h-4 mr-2" />
              Add Organization
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading organizations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">Manage organizations and their settings</p>
        </div>
        <Button asChild>
          <Link href="/admin/organizations/add">
            <Building className="w-4 h-4 mr-2" />
            Add Organization
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.filter((o) => o.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + (org.userCount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + (org.courses?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Manage all organizations in the platform</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrganizations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No organizations found. Add your first organization to get started.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/organizations/add">
                  <Building className="w-4 h-4 mr-2" />
                  Add Organization
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>address</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{org.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{org.phoneNumber || "No phone number"}</div>
                        <div className="text-muted-foreground">{org.website || "No website"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {(org.address || "No address")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        {org.courses?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>{org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/organizations/add?id=${org.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Organization
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/organizations/${org.id}/users`}>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Users
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(Number(org.id))}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Organization
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
