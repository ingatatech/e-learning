"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from 'lucide-react'
import type { Module, Lesson, Assessment } from "@/types"
import { ContentEditor } from "./content-editor"

interface TreeItem {
  id: string
  type: "module" | "lesson" | "assignment"
  title: string
  moduleId?: string
  lessonId?: string
  data: Module | Lesson | Assessment
}

interface CourseTreeBuilderProps {
  modules: Module[]
  setModules: (modules: Module[]) => void
  courseData: any
  onNext: () => void
  onPrevious: () => void
  type?: string
  loading?: boolean
}

export function CourseTreeBuilder({
  modules,
  setModules,
  courseData,
  onNext,
  onPrevious,
  type,
  loading,
}: CourseTreeBuilderProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  )
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<TreeItem | null>(null)

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
    const newModule: Module = {
      title: "New Module",
      description: "",
      order: modules.length + 1,
      courseId: "",
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lessons: [],
    }
    setModules([...modules, newModule])
    setExpandedModules(new Set([...expandedModules, newModule.id]))
    setSelectedItem({
      id: newModule.id,
      type: "module",
      title: newModule.title,
      data: newModule,
    })
  }

  // Add lesson to module
  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      title: "New Lesson",
      content: "",
      duration: 0,
      order: 1,
      moduleId,
      isProject: false,
      isExercise: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? { ...module, lessons: [...(module.lessons || []), newLesson] }
          : module
      )
    )
    setExpandedLessons(new Set([...expandedLessons, newLesson.id]))
    setSelectedItem({
      id: newLesson.id,
      type: "lesson",
      title: newLesson.title,
      moduleId,
      data: newLesson,
    })
  }

  // Add assessment to lesson
  const addAssessment = (moduleId: string, lessonId: string) => {
    const newAssessment: Assessment = {
      title: "New Assessment",
      description: "",
      type: "quiz",
      questions: [],
      passingScore: 70,
      timeLimit: 30,
      lessonId,
      createdAt: new Date(),
      updatedAt: new Date(),
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
                  : lesson
              ),
            }
          : module
      )
    )

    setSelectedItem({
      id: newAssessment.id,
      type: "assignment",
      title: newAssessment.title,
      moduleId,
      lessonId,
      data: newAssessment,
    })
  }

  // Delete item
  const deleteItem = (item: TreeItem) => {
    if (item.type === "module") {
      setModules(modules.filter((m) => m.id !== item.id))
    } else if (item.type === "lesson" && item.moduleId) {
      setModules(
        modules.map((module) =>
          module.id === item.moduleId
            ? { ...module, lessons: module.lessons?.filter((l) => l.id !== item.id) }
            : module
        )
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
                        assessments: lesson.assessments?.filter((a) => a.id !== item.id),
                      }
                    : lesson
                ),
              }
            : module
        )
      )
    }

    if (selectedItem?.id === item.id) {
      setSelectedItem(null)
    }
  }

  // Update item
  const updateItem = (item: TreeItem, updates: any) => {
    if (item.type === "module") {
      setModules(
        modules.map((m) => (m.id === item.id ? { ...m, ...updates } : m))
      )
    } else if (item.type === "lesson" && item.moduleId) {
      setModules(
        modules.map((module) =>
          module.id === item.moduleId
            ? {
                ...module,
                lessons: module.lessons?.map((l) =>
                  l.id === item.id ? { ...l, ...updates } : l
                ),
              }
            : module
        )
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
                          a.id === item.id ? { ...a, ...updates } : a
                        ),
                      }
                    : lesson
                ),
              }
            : module
        )
      )
    }

    // Update selectedItem if it's the same one
    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...item, data: { ...item.data, ...updates } })
    }
  }

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  const totalAssessments = modules.reduce(
    (acc, m) =>
      acc + (m.lessons?.reduce((acc2, l) => acc2 + (l.assessments?.length || 0), 0) || 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Build Your Course
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1 rounded">
            {modules.length} Modules
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 rounded">
            {totalLessons} Lessons
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 rounded">
            {totalAssessments} Assessments
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px]">
        {/* Left: Tree Structure */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Course Structure</CardTitle>
                <Button
                  size="sm"
                  onClick={addModule}
                  className="h-8 w-8 p-0"
                  title="Add Module"
                >
                  <Plus className="w-4 h-4" />
                </Button>
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
                        }`}
                        onClick={() =>
                          setSelectedItem({
                            id: module.id,
                            type: "module",
                            title: module.title,
                            data: module,
                          })
                        }
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleModule(module.id)
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <BookOpen className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium truncate">
                          {module.title || "Untitled Module"}
                        </span>
                        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addLesson(module.id)
                            }}
                            className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600"
                            title="Add Lesson"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteItem({
                                id: module.id,
                                type: "module",
                                title: module.title,
                                data: module,
                              })
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                            title="Delete Module"
                          >
                            <Trash2 className="w-3 h-3" />
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
                                }`}
                                onClick={() =>
                                  setSelectedItem({
                                    id: lesson.id,
                                    type: "lesson",
                                    title: lesson.title,
                                    moduleId: module.id,
                                    data: lesson,
                                  })
                                }
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleLesson(lesson.id)
                                  }}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                  {expandedLessons.has(lesson.id) ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                </button>
                                <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="flex-1 text-xs font-medium truncate">
                                  {lesson.title || "Untitled Lesson"}
                                </span>
                                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      addAssessment(module.id, lesson.id)
                                    }}
                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600"
                                    title="Add Assessment"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteItem({
                                        id: lesson.id,
                                        type: "lesson",
                                        title: lesson.title,
                                        moduleId: module.id,
                                        data: lesson,
                                      })
                                    }}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3 h-3" />
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
                                      }`}
                                      onClick={() =>
                                        setSelectedItem({
                                          id: assessment.id,
                                          type: "assignment",
                                          title: assessment.title,
                                          moduleId: module.id,
                                          lessonId: lesson.id,
                                          data: assessment,
                                        })
                                      }
                                    >
                                      <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                                      <span className="flex-1 text-xs font-medium truncate">
                                        {assessment.title || "Untitled Assessment"}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          deleteItem({
                                            id: assessment.id,
                                            type: "assignment",
                                            title: assessment.title,
                                            moduleId: module.id,
                                            lessonId: lesson.id,
                                            data: assessment,
                                          })
                                        }}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Assessment"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
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
                  onDelete={() => deleteItem(selectedItem)}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="h-full flex items-center justify-center min-h-[700px]">
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Select or Create Content
                    </h3>
                    <p className="text-gray-400 dark:text-gray-500 mb-6">
                      Click on any item in the tree to edit it, or add new modules, lessons, and
                      assessments
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
          {type === 'update' ? (loading ? "Updating..." : "Update Course") : 'Review & Publish'}
        </Button>
      </div>
    </div>
  )
}
