"use client"

import { useState, useEffect, use } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, UserPlus, MoreHorizontal, Trash2, Mail, Plus, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { User } from "@/types"

interface StudentFormData {
  firstName: string
  lastName: string
  email: string
  role: string
  organizationId: number
}

// Skeleton Components
const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

const StudentTableRowSkeleton = () => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
      </TableCell>
      <TableCell>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
      </TableCell>
      <TableCell>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
      </TableCell>
      <TableCell>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
      </TableCell>
    </TableRow>
  )
}

const StudentTableSkeleton = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <StudentTableRowSkeleton key={i} />
        ))}
      </TableBody>
    </Table>
  )
}

const HeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-80"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
    </div>
  )
}

const CardHeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
      </div>
    </div>
  )
}

const StudentFormSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse w-40"></div>
      </div>
      {[...Array(2)].map((_, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4 relative">
          <div className="absolute top-2 right-2 h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function StudentsManagement({ params }: { params: Promise<{ id: string }> }) {
  const { token, user } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newStudents, setNewStudents] = useState<StudentFormData[]>([
    { firstName: "", lastName: "", email: "", role: "student", organizationId: Number(user!.organization!.id) }
  ])
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [studentToRemove, setStudentToRemove] = useState<{ id: string; name: string } | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const { id } = use(params)
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}/students`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setStudents(data.students)
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [id, token])

  const filteredStudents = students.filter(
    (student) =>
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "instructor":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const addStudentField = () => {
    setNewStudents([...newStudents, { firstName: "", lastName: "", email: "", role: "student", organizationId: Number(user!.organization!.id) }])
  }

  const removeStudentField = (index: number) => {
    if (newStudents.length > 1) {
      const updatedStudents = newStudents.filter((_, i) => i !== index)
      setNewStudents(updatedStudents)
    }
  }

  const updateStudentField = (index: number, field: keyof StudentFormData, value: string) => {
    const updatedStudents = [...newStudents]
    if (field === 'organizationId') {
      updatedStudents[index][field] = parseInt(value) || 1
    } else {
      updatedStudents[index][field] = value
    }
    setNewStudents(updatedStudents)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Filter out empty student entries
      const validStudents = newStudents.filter(
        student => student.firstName.trim() && student.lastName.trim() && student.email.trim()
      )

      if (validStudents.length === 0) {
        alert("Please add at least one valid student")
        return
      }

      const payload = {
        courseId: parseInt(id),
        students: validStudents
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/enrollMultiple`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Refresh the students list
        const fetchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}/students`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (fetchResponse.ok) {
          const data = await fetchResponse.json()
          setStudents(data.students)
        }

        // Reset form and close dialog
        setNewStudents([{ firstName: "", lastName: "", email: "", role: "student", organizationId: Number(user?.organization!.id) }])
        setIsAddDialogOpen(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to add students: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Failed to add students:", error)
      alert("Failed to add students. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openRemoveDialog = (student: User) => {
    setStudentToRemove({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`
    })
    setRemoveDialogOpen(true)
  }

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return

    setIsRemoving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(id),
          studentIds: [parseInt(studentToRemove.id)]
        }),
      })

      if (response.ok) {
        // Refresh the students list
        const fetchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}/students`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (fetchResponse.ok) {
          const data = await fetchResponse.json()
          setStudents(data.students)
        }

        // Close dialog and reset state
        setRemoveDialogOpen(false)
        setStudentToRemove(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to remove student: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Failed to remove student:", error)
      alert("Failed to remove student. Please try again.")
    } finally {
      setIsRemoving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <Card>
          <CardHeader>
            <CardHeaderSkeleton />
          </CardHeader>
          <CardContent>
            <StudentTableSkeleton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Manage students who are enrolled in this course</p>
          </div>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Students
            </Button>
          </DialogTrigger>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>A list of all students enrolled in this course</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students found in this course.</p>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Students
                  </Button>
                </DialogTrigger>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {student.email}
                          {!student.isEmailVerified && <Mail className="w-4 h-4 text-yellow-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(student.role)}>
                          {student.role?.charAt(0).toUpperCase() + student.role?.slice(1) || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? "default" : "secondary"}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => openRemoveDialog(student)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Student
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

        {/* Dialog Content */}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Students to Course</DialogTitle>
            <DialogDescription>
              Add one or more students to this course. Fill in the details for each student below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Student Details</h3>
              <Button type="button" variant="outline" onClick={addStudentField} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Another Student
              </Button>
            </div>
            
            {newStudents.map((student, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                {newStudents.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeStudentField(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`firstName-${index}`} className="text-sm font-medium">
                      First Name *
                    </label>
                    <Input
                      id={`firstName-${index}`}
                      value={student.firstName}
                      onChange={(e) => updateStudentField(index, 'firstName', e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`lastName-${index}`} className="text-sm font-medium">
                      Last Name *
                    </label>
                    <Input
                      id={`lastName-${index}`}
                      value={student.lastName}
                      onChange={(e) => updateStudentField(index, 'lastName', e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                  
                <div >
                  <div>
                    <label htmlFor={`email-${index}`} className="text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={student.email}
                      onChange={(e) => updateStudentField(index, 'email', e.target.value)}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Adding Students..." : "Add Students"}
            </Button>
          </DialogFooter>
        </DialogContent>

        {/* Remove Student Confirmation Dialog */}
        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Student</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <strong>{studentToRemove?.name}</strong> from this course?
                This action cannot be undone and the student will lose access to all course materials.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setStudentToRemove(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRemoveStudent}
                disabled={isRemoving}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isRemoving ? "Removing..." : "Remove Student"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Dialog>
  )
}