"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

export default function OrganizationsManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock organizations data
  const organizations = [
    {
      id: "1",
      name: "Tech University",
      tin: "123456789",
      address: "123 Tech Street, Silicon Valley, CA",
      contactInfo: { phone: "+1-555-0123", website: "techuni.edu" },
      userCount: 1250,
      courseCount: 45,
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Business Academy",
      tin: "987654321",
      address: "456 Business Ave, New York, NY",
      contactInfo: { phone: "+1-555-0456", website: "bizacademy.com" },
      userCount: 890,
      courseCount: 32,
      isActive: true,
      createdAt: "2024-02-10",
    },
    {
      id: "3",
      name: "Creative Institute",
      tin: "456789123",
      address: "789 Art District, Los Angeles, CA",
      contactInfo: { phone: "+1-555-0789", website: "creativeinst.org" },
      userCount: 567,
      courseCount: 28,
      isActive: false,
      createdAt: "2024-01-20",
    },
  ]

  const filteredOrganizations = organizations.filter((org) => org.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">Manage organizations and their settings</p>
        </div>
        <Button asChild>
          <Link href="/admin/organizations/new">
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
              {organizations.reduce((sum, org) => sum + org.userCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.reduce((sum, org) => sum + org.courseCount, 0)}</div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>TIN</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Status</TableHead>
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
                      <div className="text-sm text-muted-foreground">{org.address}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{org.tin}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{org.contactInfo.phone}</div>
                      <div className="text-muted-foreground">{org.contactInfo.website}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {org.userCount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      {org.courseCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={org.isActive ? "default" : "secondary"}>
                      {org.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
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
                          <Link href={`/admin/organizations/${org.id}`}>
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
                        <DropdownMenuItem className="text-red-600">
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
        </CardContent>
      </Card>
    </div>
  )
}
