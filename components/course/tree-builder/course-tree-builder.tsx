"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { BookOpen, ChevronDown, ChevronRight, Plus, Trash2, Trophy, Loader2 } from "lucide-react"
// import type { Module, Lesson, Assessment } from "@/types"
import { ContentEditor } from "./content-editor"
import { useAuth } from "@/hooks/use-auth"
import { generateTempId, isTempId } from "@/lib/utils"

// Enhanced types with status tracking
interface BaseEntity {
  id: string
  _status?: 'local' | 'synced' | 'modified' | 'deleting'
  _tempId?: string
  createdAt: Date
  updatedAt: Date
}

interface Module extends BaseEntity {
  title: string
  description: string
  order: number
  courseId: string
  duration: number
  lessons: Lesson[]
  finalAssessment?: Assessment
}

interface Lesson extends BaseEntity {
  title: string
  content: string
  duration: number
  order: number
  moduleId: string
  isProject: boolean
  isExercise: boolean
  assessments?: Assessment[]
}

interface Assessment extends BaseEntity {
  title: string
  description: string
  type: string
  questions: any[]
  passingScore: number
  timeLimit: number
  lessonId?: string
  fileRequired?: boolean
}

interface TreeItem {
  id: string
  type: "module" | "lesson" | "assignment" | "final-assessment"
  title: string
  moduleId?: string
  lessonId?: string
  data: Module | Lesson | Assessment
}

interface DeleteDialogState {
  open: boolean
  item: TreeItem | null
  isLocal: boolean
}

interface CourseTreeBuilderProps {
  modules: Module[]
  setModules: (modules: any) => void
  onNext: () => void
  onPrevious: () => void
  type?: string
  loading?: boolean
}

// API endpoints configuration
const API_ENDPOINTS = {
  modules: 'courses/module',
  lessons: 'courses/lesson',
  assessments: 'courses/assessment'
} as const

export function CourseTreeBuilder({ modules, setModules, onNext, onPrevious, type, loading }: CourseTreeBuilderProps) {
const [expandedModules, setExpandedModules] = useState<Set<string>>(
  Array.isArray(modules)
    ? new Set(modules.map(m => m.id))
    : new Set()
)
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<TreeItem | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ 
    open: false, 
    item: null, 
    isLocal: false 
  })
  const { token } = useAuth()
  console.log("modules on render:", modules, Array.isArray(modules))


  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  // Toggle lesson expansion
  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  // Add new module
  const addModule = () => {
    const moduleId = generateTempId()
    const newModule: Module = {
      id: moduleId,
      title: "New Module",
      description: "",
      order: modules.length + 1,
      courseId: "",
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lessons: [],
      _status: 'local',
      _tempId: moduleId,
    }
    setModules([...modules, newModule])
    setExpandedModules(new Set([...expandedModules, moduleId]))
    setSelectedItem({
      id: moduleId,
      type: "module",
      title: newModule.title,
      data: newModule,
    })
  }

  // Add lesson to module
  const addLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const lessonId = generateTempId()
    const newLesson: Lesson = {
      id: lessonId,
      title: "New Lesson",
      content: "",
      duration: 0,
      order: module.lessons?.length || 0,
      moduleId,
      isProject: false,
      isExercise: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      _status: 'local',
      _tempId: lessonId,
    }

    setModules(
      modules.map((module) =>
        module.id === moduleId 
          ? { 
              ...module, 
              lessons: [...(module.lessons || []), newLesson] 
            } 
          : module
      ),
    )
    setExpandedLessons(new Set([...expandedLessons, lessonId]))
    setSelectedItem({
      id: lessonId,
      type: "lesson",
      title: newLesson.title,
      moduleId,
      data: newLesson,
    })
  }

  // Add assessment to lesson
  const addAssessment = (moduleId: string, lessonId: string) => {
    const assessmentId = generateTempId()
    const newAssessment: Assessment = {
      id: assessmentId,
      title: "New Assessment",
      description: "",
      type: "assessment",
      questions: [],
      passingScore: 70,
      timeLimit: 30,
      lessonId,
      createdAt: new Date(),
      updatedAt: new Date(),
      _status: 'local',
      _tempId: assessmentId,
    }

    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons?.map((lesson) =>
                lesson.id === lessonId
                  ? {
                      ...lesson,
                      assessments: [...(lesson.assessments || []), newAssessment],
                    }
                  : lesson,
              ),
            }
          : module,
      ),
    )

    setSelectedItem({
      id: assessmentId,
      type: "assignment",
      title: newAssessment.title,
      moduleId,
      lessonId,
      data: newAssessment,
    })
  }

  // Add final assessment to module
  const addFinalAssessment = (moduleId: string) => {
    const assessmentId = generateTempId()
    const newFinalAssessment: Assessment = {
      id: assessmentId,
      title: "Final Assessment",
      type: "final-assessment",
      description: "",
      passingScore: 70,
      timeLimit: 60,
      fileRequired: false,
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      _status: 'local',
      _tempId: assessmentId,
    }

    setModules(
      modules.map((module) => 
        module.id === moduleId 
          ? { ...module, finalAssessment: newFinalAssessment } 
          : module
      ),
    )
    
    setSelectedItem({
      id: assessmentId,
      type: "final-assessment",
      title: newFinalAssessment.title,
      moduleId,
      data: newFinalAssessment,
    })
  }

 // Remove item from UI state - using functional updates
const removeFromUI = (item: TreeItem) => {
  let updatedModules = [...modules]

  if (item.type === "module") {
    updatedModules = updatedModules.filter(m => m.id !== item.id)
  } 
  else if (item.type === "lesson" && item.moduleId) {
    updatedModules = updatedModules.map(module =>
      module.id === item.moduleId
        ? {
            ...module,
            lessons: module.lessons?.filter(l => l.id !== item.id) || []
          }
        : module
    )
  }
  else if (item.type === "assignment" && item.moduleId && item.lessonId) {
    updatedModules = updatedModules.map(module =>
      module.id === item.moduleId
        ? {
            ...module,
            lessons: module.lessons?.map(lesson =>
              lesson.id === item.lessonId
                ? {
                    ...lesson,
                    assessments: lesson.assessments?.filter(a => a.id !== item.id) || []
                  }
                : lesson
            ) || []
          }
        : module
    )
  }
  else if (item.type === "final-assessment" && item.moduleId) {
    updatedModules = updatedModules.map(module =>
      module.id === item.moduleId
        ? { ...module, finalAssessment: undefined }
        : module
    )
  }
  console.log(updatedModules)
  setModules(updatedModules)

  if (selectedItem?.id === item.id) {
    setSelectedItem(null)
  }
}

  // Mark item as deleting for UI feedback
  const markItemAsDeleting = (id: string) => {
    setModules((prevModules: any[]) => 
      prevModules.map(module => {
        // Check module itself
        if (module.id === id) {
          return { ...module, _status: 'deleting' as const }
        }
        
        // Check lessons in module
        const updatedLessons = module.lessons?.map((lesson: { id: string; assessments: any[] }) => {
          if (lesson.id === id) {
            return { ...lesson, _status: 'deleting' as const }
          }
          
          // Check assessments in lesson
          const updatedAssessments = lesson.assessments?.map(assessment => {
            if (assessment.id === id) {
              return { ...assessment, _status: 'deleting' as const }
            }
            return assessment
          })
          
          return { 
            ...lesson, 
            assessments: updatedAssessments 
          }
        })
        
        // Check final assessment
        let updatedFinalAssessment = module.finalAssessment
        if (module.finalAssessment?.id === id) {
          updatedFinalAssessment = { 
            ...module.finalAssessment, 
            _status: 'deleting' as const 
          }
        }
        
        return { 
          ...module, 
          lessons: updatedLessons,
          finalAssessment: updatedFinalAssessment
        }
      })
    )
  }

  // Remove deleting status from item
const unmarkItemAsDeleting = (id: string) => {
  setModules((prevModules: any[]) => 
    prevModules.map(module => ({
      ...module,
      _status: module.id === id ? 'synced' : module._status,
      lessons: module.lessons?.map((lesson: any) => ({
        ...lesson,
        _status: lesson.id === id ? 'synced' : lesson._status,
        assessments: lesson.assessments?.map((assessment: any) => ({
          ...assessment,
          _status: assessment.id === id ? 'synced' : assessment._status
        }))
      })),
      finalAssessment: module.finalAssessment?.id === id 
        ? { ...module.finalAssessment, _status: 'synced' as const }
        : module.finalAssessment
    }))
  );
};

  // Delete item from database
  const deleteFromDatabase = async (item: TreeItem) => {
    console.log(item)
    try {
      // Mark item as deleting for UI feedback
      markItemAsDeleting(item.id)
      
      // Determine endpoint based on item type
      let endpoint = ''
      let payload: any = { id: item.id }
      
      switch (item.type) {
        case 'module':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/${API_ENDPOINTS.modules}/${item.id}`
          break
        case 'lesson':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/${API_ENDPOINTS.lessons}/${item.id}`
          break
        case 'assignment':
        case 'final-assessment':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/${API_ENDPOINTS.assessments}/${item.id}`
          if (item.type === 'final-assessment') {
            payload.moduleId = item.moduleId
          }
          break
      }
      
      // Call API endpoint
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${item.type}`)
      }
      
      // Remove from UI after successful deletion
      removeFromUI(item)
      
      // Show success message (you might want to use a toast here)
      
    } catch (error) {
      console.error(`Error deleting ${item.type}:`, error)
      
      // Remove deleting state on error
      unmarkItemAsDeleting(item.id)
      
      // Show error message
      alert(`Failed to delete ${item.type}. Please try again.`)
      
      // Re-throw error for potential handling by parent component
      throw error
    }
  }

  // Handle delete click - opens confirmation dialog
  const handleDeleteClick = (e: React.MouseEvent, item: TreeItem) => {
    e.stopPropagation()
    
    // Prevent deletion if already deleting
    if (item.data._status === 'deleting') return
    const isLocal = isTempId(item.data.id)
    setDeleteDialog({
      open: true,
      item,
      isLocal
    })
  }

  // Confirm and execute deletion
  const confirmDelete = async () => {
    if (!deleteDialog.item) return
    
    try {
      if (deleteDialog.isLocal) {
        // Local item - just remove from UI
        removeFromUI(deleteDialog.item)
      } else {
        // Database item - delete from backend
        await deleteFromDatabase(deleteDialog.item)
      }
    } catch (error) {
      // Error is already handled in deleteFromDatabase
    } finally {
      // Close dialog
      setDeleteDialog({ open: false, item: null, isLocal: false })
    }
  }

  // Update item
  const updateItem = (item: TreeItem, updates: any) => {
    if (item.type === "module") {
      setModules(modules.map((m) => 
        m.id === item.id 
          ? { 
              ...m, 
              ...updates,
              _status: m._status === 'synced' ? 'modified' : m._status
            } 
          : m
      ))
    } else if (item.type === "lesson" && item.moduleId) {
      setModules(
        modules.map((module) =>
          module.id === item.moduleId
            ? {
                ...module,
                lessons: module.lessons?.map((l) => 
                  l.id === item.id 
                    ? { 
                        ...l, 
                        ...updates,
                        _status: l._status === 'synced' ? 'modified' : l._status
                      } 
                    : l
                ),
              }
            : module,
        ),
      )
    } else if (item.type === "assignment" && item.moduleId && item.lessonId) {
      setModules(
        modules.map((module) =>
          module.id === item.moduleId
            ? {
                ...module,
                lessons: module.lessons?.map((lesson) =>
                  lesson.id === item.lessonId
                    ? {
                        ...lesson,
                        assessments: lesson.assessments?.map((a) => 
                          a.id === item.id 
                            ? { 
                                ...a, 
                                ...updates,
                                _status: a._status === 'synced' ? 'modified' : a._status
                              } 
                            : a
                        ),
                      }
                    : lesson,
                ),
              }
            : module,
        ),
      )
    } else if (item.type === "final-assessment" && item.moduleId) {
      setModules(
        modules.map((module) =>
          module.id === item.moduleId
            ? { 
                ...module, 
                finalAssessment: { 
                  ...module.finalAssessment, 
                  ...updates,
                  _status: module.finalAssessment?._status === 'synced' ? 'modified' : module.finalAssessment?._status
                } as any 
              }
            : module,
        ),
      )
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (item: Module | Lesson | Assessment) => {
    switch (item._status) {
      case 'local':
        return (
          <Badge variant="outline" className="text-xs ml-1 bg-gray-100 text-gray-600">
            Unsaved
          </Badge>
        )
      case 'deleting':
        return (
          <Badge variant="destructive" className="text-xs ml-1">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Deleting...
          </Badge>
        )
      case 'modified':
        return (
          <Badge variant="outline" className="text-xs ml-1 bg-yellow-100 text-yellow-700">
            Modified
          </Badge>
        )
      default:
        return null
    }
  }

  const totalLessons = (modules && Array.isArray(modules)) && modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  const totalAssessments = (modules && Array.isArray(modules)) && modules.reduce(
    (acc, m) => acc + (m.lessons?.reduce((acc2, l) => acc2 + (l.assessments?.length || 0), 0) || 0),
    0,
  )

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({...deleteDialog, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.isLocal ? 'Delete Unsaved Item' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.isLocal 
                ? `Delete "${deleteDialog.item?.title}"? This item hasn't been saved to the database yet and will be permanently removed.`
                : `Are you sure you want to delete "${deleteDialog.item?.title}"? This will permanently remove it from the database. This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDialog.isLocal ? 'Delete' : 'Delete from Database'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px]">
        {/* Left: Tree Structure */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Course Structure</CardTitle>
                <Button size="sm" onClick={addModule} className="h-8 w-8 p-0 rounded" title="Add Module">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                {modules.length} modules • {totalLessons} lessons • {totalAssessments} assessments
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-1">
                {modules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No modules yet</p>
                    <p className="text-xs mt-1">Click the + button to create one</p>
                  </div>
                ) : (
                  modules.map((module) => (
                    <div key={module.id} className="space-y-1">
                      {/* Module Node */}
                      <div
                        className={`flex items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors group ${
                          selectedItem?.id === module.id
                            ? "bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        } ${
                          module._status === 'local' ? 'opacity-75 border-dashed border-gray-300' : ''
                        } ${
                          module._status === 'deleting' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => {
                          if (module._status !== 'deleting') {
                            setSelectedItem({
                              id: module.id,
                              type: "module",
                              title: module.title,
                              data: module,
                            })
                          }
                        }}
                      >
                        {module.lessons && module.lessons.length > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (module._status !== 'deleting') {
                                toggleModule(module.id)
                              }
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            disabled={module._status === 'deleting'}
                          >
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="w-4 h-4 p-1" />
                        )}
                        <BookOpen className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium truncate">{module.title || "Untitled Module"}</span>
                        
                        {/* Status Badge */}
                        {getStatusBadge(module)}
                        
                        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (module._status !== 'deleting') {
                                addLesson(module.id)
                              }
                            }}
                            disabled={module._status === 'deleting'}
                            className={`p-1 rounded ${
                              module._status === 'deleting'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-green-100 dark:hover:bg-green-900 text-green-600'
                            }`}
                            title={module._status === 'deleting' ? 'Cannot add lesson while deleting' : 'Add Lesson'}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, {
                              id: module.id,
                              type: "module",
                              title: module.title,
                              data: module,
                            })}
                            disabled={module._status === 'deleting'}
                            className={`p-1 rounded ${
                              module._status === 'deleting'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600'
                            }`}
                            title={module._status === 'deleting' ? 'Deleting...' : 'Delete Module'}
                          >
                            {module._status === 'deleting' ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Lessons */}
                      {expandedModules.has(module.id) && module.lessons && (
                        <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="space-y-1">
                              <div
                                className={`flex items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors group ${
                                  selectedItem?.id === lesson.id
                                    ? "bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                } ${
                                  lesson._status === 'local' ? 'opacity-75 border-dashed border-gray-300' : ''
                                } ${
                                  lesson._status === 'deleting' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                onClick={() => {
                                  if (lesson._status !== 'deleting') {
                                    setSelectedItem({
                                      id: lesson.id,
                                      type: "lesson",
                                      title: lesson.title,
                                      moduleId: module.id,
                                      data: lesson,
                                    })
                                  }
                                }}
                              >
                                {lesson.assessments && lesson.assessments.length > 0 ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (lesson._status !== 'deleting') {
                                        toggleLesson(lesson.id)
                                      }
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    disabled={lesson._status === 'deleting'}
                                  >
                                    {expandedLessons.has(lesson.id) ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </button>
                                ) : (
                                  <div className="w-4 h-4 p-1" />
                                )}
                                <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="flex-1 text-xs font-medium truncate">
                                  {lesson.title || "Untitled Lesson"}
                                </span>
                                
                                {/* Status Badge */}
                                {getStatusBadge(lesson)}
                                
                                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (lesson._status !== 'deleting') {
                                        addAssessment(module.id, lesson.id)
                                      }
                                    }}
                                    disabled={lesson._status === 'deleting'}
                                    className={`p-1 rounded ${
                                      lesson._status === 'deleting'
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        : 'hover:bg-green-100 dark:hover:bg-green-900 text-green-600'
                                    }`}
                                    title={lesson._status === 'deleting' ? 'Cannot add assessment while deleting' : 'Add Assessment'}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteClick(e, {
                                      id: lesson.id,
                                      type: "lesson",
                                      title: lesson.title,
                                      moduleId: module.id,
                                      data: lesson,
                                    })}
                                    disabled={lesson._status === 'deleting'}
                                    className={`p-1 rounded ${
                                      lesson._status === 'deleting'
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600'
                                    }`}
                                    title={lesson._status === 'deleting' ? 'Deleting...' : 'Delete Lesson'}
                                  >
                                    {lesson._status === 'deleting' ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Assessments */}
                              {expandedLessons.has(lesson.id) && lesson.assessments && (
                                <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                                  {lesson.assessments.map((assessment) => (
                                    <div
                                      key={assessment.id}
                                      className={`flex items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors group ${
                                        selectedItem?.id === assessment.id
                                          ? "bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800"
                                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                      } ${
                                        assessment._status === 'local' ? 'opacity-75 border-dashed border-gray-300' : ''
                                      } ${
                                        assessment._status === 'deleting' ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                      onClick={() => {
                                        if (assessment._status !== 'deleting') {
                                          setSelectedItem({
                                            id: assessment.id,
                                            type: "assignment",
                                            title: assessment.title,
                                            moduleId: module.id,
                                            lessonId: lesson.id,
                                            data: assessment,
                                          })
                                        }
                                      }}
                                    >
                                      <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                                      <span className="flex-1 text-xs font-medium truncate">
                                        {assessment.title || "Untitled Assessment"}
                                      </span>
                                      
                                      {/* Status Badge */}
                                      {getStatusBadge(assessment)}
                                      
                                      <button
                                        onClick={(e) => handleDeleteClick(e, {
                                          id: assessment.id,
                                          type: "assignment",
                                          title: assessment.title,
                                          moduleId: module.id,
                                          lessonId: lesson.id,
                                          data: assessment,
                                        })}
                                        disabled={assessment._status === 'deleting'}
                                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                                          assessment._status === 'deleting'
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                            : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600'
                                        }`}
                                        title={assessment._status === 'deleting' ? 'Deleting...' : 'Delete Assessment'}
                                      >
                                        {assessment._status === 'deleting' ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <Trash2 className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Final Assessment */}
                      {expandedModules.has(module.id) && (
                        <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                          {module.finalAssessment ? (
                            <div
                              className={`flex items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors group ${
                                selectedItem?.id === module.finalAssessment.id
                                  ? "bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
                              } ${
                                module.finalAssessment._status === 'local' ? 'opacity-75 border-dashed border-gray-300' : ''
                              } ${
                                module.finalAssessment._status === 'deleting' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              onClick={() => {
                                if (module.finalAssessment?._status !== 'deleting') {
                                  setSelectedItem({
                                    id: module.finalAssessment?.id || "",
                                    type: "final-assessment",
                                    title: module.finalAssessment?.title || "Final Assessment",
                                    moduleId: module.id,
                                    data: module.finalAssessment || {},
                                  })
                                }
                              }}
                            >
                              <Trophy className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              <span className="flex-1 text-sm font-medium truncate">
                                {module.finalAssessment.title}
                              </span>
                              
                              {/* Status Badge */}
                              {getStatusBadge(module.finalAssessment)}
                              
                              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleDeleteClick(e, {
                                    id: module.finalAssessment!.id,
                                    type: "final-assessment",
                                    title: module.finalAssessment!.title,
                                    moduleId: module.id,
                                    data: module.finalAssessment,
                                  })}
                                  disabled={module.finalAssessment._status === 'deleting'}
                                  className={`p-1 rounded ${
                                    module.finalAssessment._status === 'deleting'
                                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                      : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600'
                                  }`}
                                  title={module.finalAssessment._status === 'deleting' ? 'Deleting...' : 'Delete Final Assessment'}
                                >
                                  {module.finalAssessment._status === 'deleting' ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => addFinalAssessment(module.id)}
                              className="flex items-center gap-1 p-2 w-full rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors text-sm"
                              disabled={module._status === 'deleting'}
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Final Assessment</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Content Editor */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ContentEditor
                  item={selectedItem}
                  modules={modules}
                  onUpdate={(updates) => updateItem(selectedItem, updates)}
                  onDelete={() => handleDeleteClick(
                    { stopPropagation: () => {} } as React.MouseEvent, 
                    selectedItem
                  )}
                  isDeleting={(selectedItem.data as any)._status === 'deleting'}
                  isLocal={isTempId(selectedItem.data.id)}
                  generateTempId={generateTempId}
                />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="h-full flex items-center justify-center min-h-[700px]">
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Select or Create Content
                    </h3>
                    <p className="text-gray-400 dark:text-gray-500 mb-6">
                      Click on any item in the tree to edit it, or add new modules, lessons, and assessments
                    </p>
                    <Button onClick={addModule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Module
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>

        <div className="text-sm text-gray-500">
          {modules.length > 0
            ? `Ready to review: ${modules.length} modules, ${totalLessons} lessons`
            : "Create at least one module to continue"}
        </div>

        <Button onClick={onNext} disabled={modules.length === 0 || loading} size="lg" className="px-8">
          {type === "update" ? (loading ? "Updating..." : "Update Course") : "Review & Publish"}
        </Button>
      </div>
    </div>
  )
}