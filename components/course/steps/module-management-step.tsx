"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, GripVertical, Edit2, Trash2, BookOpen, CheckCircle } from "lucide-react"
import type { Module } from "@/types"

interface ModuleManagementStepProps {
  modules: Module[]
  setModules: (modules: Module[]) => void
  onNext: () => void
  onPrevious: () => void
}

export function ModuleManagementStep({ modules, setModules, onNext, onPrevious }: ModuleManagementStepProps) {
  const [isAddingModule, setIsAddingModule] = useState(false)
  const [editingModule, setEditingModule] = useState<string | null>(null)
  const [newModule, setNewModule] = useState({ title: "", description: "" })

  const addModule = () => {
    if (newModule.title.trim()) {
      const module: Module = {
        id: `module-${Date.now()}`,
        title: newModule.title,
        description: newModule.description,
        order: modules.length + 1,
        courseId: "", // Will be set when course is created
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setModules([...modules, module])
      setNewModule({ title: "", description: "" })
      setIsAddingModule(false)
    }
  }

  const updateModule = (id: string, updates: Partial<Module>) => {
    setModules(modules.map((module) => (module.id === id ? { ...module, ...updates } : module)))
    // setEditingModule(null)
  }

  const deleteModule = (id: string) => {
    setModules(modules.filter((module) => module.id !== id))
  }

  const moveModule = (fromIndex: number, toIndex: number) => {
    const newModules = [...modules]
    const [movedModule] = newModules.splice(fromIndex, 1)
    newModules.splice(toIndex, 0, movedModule)

    // Update order numbers
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index + 1,
    }))

    setModules(updatedModules)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Structure Your Course</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Organize your content into logical modules that guide students through their learning journey
        </p>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.map((module, index) => (
          <Card key={module.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <Badge variant="outline" className="text-xs">
                    {module.order}
                  </Badge>
                </div>

                <div className="flex-1">
                  {editingModule === module.id ? (
                    <div className="space-y-3">
                      <Input
                        value={module.title}
                        onChange={(e) => updateModule(module.id, { title: e.target.value })}
                        placeholder="Module title"
                      />
                      <Textarea
                        value={module.description}
                        onChange={(e) => updateModule(module.id, { description: e.target.value })}
                        placeholder="Module description"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setEditingModule(null)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingModule(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingModule(module.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteModule(module.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{module.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />0 lessons
                        </span>
                        <span>~0 min</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Module */}
        {isAddingModule ? (
          <Card className="border-dashed border-2 border-primary-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="module-title">Module Title</Label>
                  <Input
                    id="module-title"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    placeholder="e.g., Introduction to React Hooks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-description">Module Description</Label>
                  <Textarea
                    id="module-description"
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    placeholder="Describe what students will learn in this module..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addModule} disabled={!newModule.title.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingModule(false)
                      setNewModule({ title: "", description: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-gray-300 hover:border-primary-400 transition-colors">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Add Your First Module</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Break your course into digestible modules that build upon each other
              </p>
              <Button onClick={() => setIsAddingModule(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Indicator */}
      {modules.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 dark:text-green-200">
              Great! You've created {modules.length} module{modules.length !== 1 ? "s" : ""}. You can always add more
              modules later.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous Step
        </Button>
        <Button onClick={onNext} disabled={modules.length === 0} size="lg" className="px-8">
          Continue to Lessons
        </Button>
      </div>
    </div>
  )
}
