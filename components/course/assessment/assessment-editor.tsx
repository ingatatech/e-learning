"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GripVertical, Target, X } from "lucide-react"
import type { Assessment, AssessmentQuestion } from "@/types"

interface AssessmentEditorProps {
  assessment: Assessment
  onUpdate: (updates: Partial<Assessment>) => void
  onDelete: () => void
}

export function AssessmentEditor({ assessment, onUpdate, onDelete }: AssessmentEditorProps) {
  const [activeTab, setActiveTab] = useState("questions")

  const addQuestion = () => {
    const newQuestion: AssessmentQuestion = {
      id: `question-${Date.now()}`,
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    }
    onUpdate({ questions: [...assessment.questions || [], newQuestion] })
  }

  const updateQuestion = (index: number, updates: Partial<AssessmentQuestion>) => {
    const updatedQuestions = assessment.questions?.map((q, i) => (i === index ? { ...q, ...updates } : q))
    onUpdate({ questions: updatedQuestions })
  }

  const deleteQuestion = (index: number) => {
    const updatedQuestions = assessment.questions?.filter((_, i) => i !== index)
    onUpdate({ questions: updatedQuestions })
  }

  const renderQuestionEditor = (question: AssessmentQuestion, index: number) => {
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : question.correctAnswer
        ? [question.correctAnswer]
        : []

    const toggleCorrectAnswer = (option: string) => {
      if (question.type === "multiple_choice") {
        const newCorrectAnswers = correctAnswers.includes(option)
          ? correctAnswers.filter((a) => a !== option)
          : [...correctAnswers, option]
        updateQuestion(index, { correctAnswer: newCorrectAnswers.length > 0 ? newCorrectAnswers : "" })
      }
    }

    const addOption = () => {
      const newOptions = [...(question.options || []), ""]
      updateQuestion(index, { options: newOptions })
    }

    const removeOption = (optionIndex: number) => {
      const newOptions = question.options?.filter((_, i) => i !== optionIndex) || []
      // Remove from correct answers if it was selected
      const optionToRemove = question.options?.[optionIndex]
      if (optionToRemove && correctAnswers.includes(optionToRemove)) {
        const newCorrectAnswers = correctAnswers.filter((a) => a !== optionToRemove)
        updateQuestion(index, {
          options: newOptions,
          correctAnswer: newCorrectAnswers.length > 0 ? newCorrectAnswers : "",
        })
      } else {
        updateQuestion(index, { options: newOptions })
      }
    }

    return (
      <Card key={question.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <Badge variant="outline" className="text-xs">
                Question {index + 1}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {question.points} pt{question.points !== 1 ? "s" : ""}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteQuestion(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Label>Question</Label>
              <Textarea
                value={question.question}
                onChange={(e) => updateQuestion(index, { question: e.target.value })}
                placeholder="Enter your question..."
                rows={2}
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) => updateQuestion(index, { type: value as AssessmentQuestion["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, { points: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>

          {/* Question Options */}
          {question.type === "multiple_choice" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <span className="text-xs text-muted-foreground">Select one or more correct answers</span>
              </div>
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])]
                      newOptions[optionIndex] = e.target.value
                      updateQuestion(index, { options: newOptions })
                    }}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <div className="flex items-center gap-2 px-3 border rounded-md">
                    <Checkbox
                      id={`correct-${question.id}-${optionIndex}`}
                      checked={correctAnswers.includes(option)}
                      onCheckedChange={() => toggleCorrectAnswer(option)}
                    />
                    <Label htmlFor={`correct-${question.id}-${optionIndex}`} className="text-sm cursor-pointer">
                      Correct
                    </Label>
                  </div>
                  {(question.options?.length || 0) > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption} className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          {question.type === "true_false" && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <div className="flex gap-2">
                <Button
                  variant={question.correctAnswer === "true" ? "default" : "outline"}
                  onClick={() => updateQuestion(index, { correctAnswer: "true" })}
                >
                  True
                </Button>
                <Button
                  variant={question.correctAnswer === "false" ? "default" : "outline"}
                  onClick={() => updateQuestion(index, { correctAnswer: "false" })}
                >
                  False
                </Button>
              </div>
            </div>
          )}

          {(question.type === "short_answer" || question.type === "essay") && (
            <div className="space-y-2">
              <Label>Sample Answer / Grading Notes</Label>
              <Textarea
                value={
                  Array.isArray(question.correctAnswer) ? question.correctAnswer.join(", ") : question.correctAnswer
                }
                onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                placeholder="Provide a sample answer or grading guidelines..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Assessment Title */}
            <div className="space-y-2">
              <Label>Assessment Title</Label>
              <Input
                value={assessment.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter assessment title"
                className="text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                value={assessment.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Enter assessment instructions..."
                rows={2}
              />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <Badge variant="outline">
                  {assessment.questions?.length} question{assessment.questions?.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {assessment.questions?.map((question, index) => renderQuestionEditor(question, index))}

              {/* Add Question */}
              <Card className="border-dashed border-2 border-gray-300 hover:border-primary-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Add Question</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Create a new question for this assessment
                  </p>
                  <Button onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Settings</CardTitle>
                <CardDescription>Configure assessment behavior and grading</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Assessment Type</Label>
                    <Select
                      value={assessment.type}
                      onValueChange={(value) => onUpdate({ type: value as Assessment["type"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Passing Score (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={assessment.passingScore || ""}
                      onChange={(e) => onUpdate({ passingScore: Number.parseInt(e.target.value) || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Limit (minutes)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={assessment.timeLimit || ""}
                      onChange={(e) => onUpdate({ timeLimit: Number.parseInt(e.target.value) || undefined })}
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grading Summary</CardTitle>
                <CardDescription>Overview of points and scoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{assessment.questions?.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {assessment.questions?.reduce((acc, q) => acc + q.points, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{assessment.passingScore}%</div>
                    <div className="text-sm text-gray-600">Passing Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {assessment.timeLimit ? `${assessment.timeLimit}m` : "∞"}
                    </div>
                    <div className="text-sm text-gray-600">Time Limit</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
