"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, CheckCircle, XCircle, FileText, User, Calendar, Award } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface PendingSubmission {
  id: string
  assessmentId: string
  studentId: string
  studentName: string
  studentEmail: string
  courseName: string
  assessmentTitle: string
  submittedAt: string
  questions: {
    id: string
    question: string
    type: string
    answer: string
    answerId: string
    points: number
    isCorrect: boolean
    pointsEarned: number
  }[]
}

export default function InstructorAssessmentsPage() {
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null)
  const [gradingAnswers, setGradingAnswers] = useState<
    Record<string, { isCorrect: boolean; pointsEarned: number; feedback: string }>
  >({})
  const [submittingGrade, setSubmittingGrade] = useState(false)
  const { token, user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPendingSubmissions()
  }, [])
  console.log(selectedSubmission)

  const fetchPendingSubmissions = async () => {
    if (!token || !user) return

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers/${user.id}/submissions`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPendingSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error("Failed to fetch pending submissions:", error)
      toast({
        title: "Error",
        description: "Failed to load pending assessments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = (submission: PendingSubmission) => {
    setSelectedSubmission(submission)
    // Initialize grading state for each question
    const initialGrading: Record<string, { isCorrect: boolean; pointsEarned: number; feedback: string }> = {}
    submission.questions.forEach((q) => {
      initialGrading[q.id] = {
        isCorrect: false,
        pointsEarned: 0,
        feedback: "",
      }
    })
    setGradingAnswers(initialGrading)
  }

  const handleSubmitGrade = async () => {
  if (!selectedSubmission || !token) return

  setSubmittingGrade(true)
  try {
    // Calculate final score percentage
    const { earned, total } = calculateTotalPoints()
    const finalScore = total > 0 ? Math.round((earned / total) * 100) : 0
    console.log(gradingAnswers)

     // Only include gradable questions that were actually manually graded
    const gradedAnswers = Object.entries(gradingAnswers)
      .map(([questionId, grade]) => {
        const question = selectedSubmission.questions.find(q => q.id === questionId)
        // Only include if it's a gradable question type AND points were assigned
        if (question && ["essay", "short_answer"].includes(question.type) && 
            (grade.pointsEarned !== undefined && grade.pointsEarned !== null)) {
          return {
            answerId: question.answerId, 
            pointsEarned: grade.pointsEarned
          }
        }
        return null
      })
      .filter(item => item !== null) // Remove null entries


    const payload = {
      assessmentId: selectedSubmission.assessmentId,
      studentId: selectedSubmission.studentId,
      gradedAnswers,
      finalScore
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers/grade-manually`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      toast({
        title: "Success",
        description: "Assessment graded successfully",
      })
      setSelectedSubmission(null)
      fetchPendingSubmissions()
    } else {
      throw new Error("Failed to submit grade")
    }
  } catch (error) {
    console.error("Failed to submit grade:", error)
    toast({
      title: "Error",
      description: "Failed to submit grade",
      variant: "destructive",
    })
  } finally {
    setSubmittingGrade(false)
  }
}

  const updateQuestionGrade = (
    questionId: string,
    updates: Partial<{ isCorrect: boolean; pointsEarned: number; feedback: string }>,
  ) => {
    setGradingAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...updates,
      },
    }))
  }

  const calculateTotalPoints = () => {
  if (!selectedSubmission) return { earned: 0, total: 0 }

  const total = selectedSubmission.questions.reduce((acc, q) => acc + q.points, 0)
  
  const earned = selectedSubmission.questions.reduce((acc, q) => {
    const isGradable = ["essay", "short_answer"].includes(q.type);
    const gradedAnswer = gradingAnswers[q.id];
    
    if (isGradable && gradedAnswer) {
      // For gradable questions, use the manually assigned points from gradingAnswers
      return acc + (gradedAnswer.pointsEarned || 0);
    } else {
      // For auto-graded questions OR gradable questions not yet manually graded,
      // use the original pointsEarned from the submission
      return acc + q.pointsEarned;
    }
  }, 0);

  return { earned, total }
}

  const hasGradableQuestions =
  selectedSubmission?.questions.some((q) =>
    ["essay", "short_answer"].includes(q.type)
  ) ?? false;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pending assessments...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Assessment Grading</h1>
        <p className="text-muted-foreground">Review and grade student submissions requiring manual evaluation</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="graded" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Graded
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Pending Assessments</h3>
                <p className="text-muted-foreground">All assessments have been graded</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pending Submissions</CardTitle>
                <CardDescription>Assessments waiting for your review</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{submission.studentName}</p>
                              <p className="text-sm text-muted-foreground">{submission.studentEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{submission.courseName}</TableCell>
                        <TableCell>{submission.assessmentTitle}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{submission.questions.length} questions</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleGradeSubmission(submission)}>
                            Grade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="graded">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Graded Assessments</h3>
              <p className="text-muted-foreground">View previously graded assessments</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grading Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Grade Assessment
            </DialogTitle>
            <DialogDescription>
              Review and grade {selectedSubmission?.studentName}'s submission for {selectedSubmission?.assessmentTitle}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Student Info */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Student</p>
                      <p className="font-medium">{selectedSubmission.studentName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Course</p>
                      <p className="font-medium">{selectedSubmission.courseName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Assessment</p>
                      <p className="font-medium">{selectedSubmission.assessmentTitle}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <div className="space-y-4">
                {selectedSubmission.questions.map((question, index) => {
                  const isGradable = ["essay", "short_answer"].includes(question.type);

                  return (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">Question {index + 1}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{question.question}</p>
                          </div>
                          <Badge variant="outline">{question.points} pts</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Student Answer */}
                        <div>
                          <Label className="text-sm font-medium">Student's Answer</Label>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{question.answer || "No answer provided"}</p>
                          </div>
                        </div>

                        {/* Grading Controls */}
                        {isGradable ? (
                          <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label>Points Earned</Label>
                              <Input
                                type="number"
                                min="0"
                                max={question.points}
                                value={gradingAnswers[question.id]?.pointsEarned || 0}
                                onChange={(e) =>
                                  updateQuestionGrade(question.id, {
                                    pointsEarned: Math.min(Number(e.target.value), question.points),
                                    isCorrect: Number(e.target.value) === question.points,
                                  })
                                }
                              />
                            </div>
                            {/* <div className="space-y-2">
                              <Label>Status</Label>
                              <div className="flex gap-2">
                                <Button
                                  variant={gradingAnswers[question.id]?.isCorrect ? "default" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    updateQuestionGrade(question.id, {
                                      isCorrect: true,
                                      pointsEarned: question.points,
                                    })
                                  }
                                  className="flex-1"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Correct
                                </Button>
                                <Button
                                  variant={!gradingAnswers[question.id]?.isCorrect ? "default" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    updateQuestionGrade(question.id, {
                                      isCorrect: false,
                                      pointsEarned: 0,
                                    })
                                  }
                                  className="flex-1"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Incorrect
                                </Button>
                              </div>
                            </div> */}
                          </div>
                        ) : (
                          <div className="pt-4 border-t text-sm text-muted-foreground">
                            This question is auto-graded. Points: {question.points} | Correct: {question.isCorrect ? "Yes" : "No"}
                          </div>
                        )}

                        {/* Feedback */}
                        {isGradable && (
                          <div className="space-y-2">
                            <Label>Feedback (Optional)</Label>
                            <Textarea
                              placeholder="Provide feedback to the student..."
                              value={gradingAnswers[question.id]?.feedback || ""}
                              onChange={(e) =>
                                updateQuestionGrade(question.id, {
                                  feedback: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>


              {/* Score Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                      <p className="text-2xl font-bold">
                        {calculateTotalPoints().earned} / {calculateTotalPoints().total}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-2xl font-bold">
                        {calculateTotalPoints().total > 0
                          ? Math.round((calculateTotalPoints().earned / calculateTotalPoints().total) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSubmission(null)} disabled={submittingGrade}>
              Cancel
            </Button>
            <Button onClick={handleSubmitGrade} disabled={submittingGrade || !hasGradableQuestions}>
              {submittingGrade ? "Submitting..." : "Submit Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
