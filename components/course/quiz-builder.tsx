"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Edit } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QuizData {
  title: string
  passingScore: number
  questions: QuizQuestion[]
}

interface QuizBuilderProps {
  initialData?: QuizData | null
  onChange: (quizData: QuizData) => void
}

export function QuizBuilder({ initialData, onChange }: QuizBuilderProps) {
  const [quizData, setQuizData] = useState<QuizData>({
    title: initialData?.title || "",
    passingScore: initialData?.passingScore || 70,
    questions: initialData?.questions || [],
  })

  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)

  const updateQuizData = (newData: Partial<QuizData>) => {
    const updated = { ...quizData, ...newData }
    setQuizData(updated)
    onChange(updated)
  }

  const addQuestion = (questionData: Omit<QuizQuestion, "id">) => {
    const newQuestion: QuizQuestion = {
      ...questionData,
      id: Date.now().toString(),
    }
    const newQuestions = [...quizData.questions, newQuestion]
    updateQuizData({ questions: newQuestions })
    setShowQuestionForm(false)
  }

  const updateQuestion = (updatedQuestion: QuizQuestion) => {
    const newQuestions = quizData.questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    updateQuizData({ questions: newQuestions })
    setEditingQuestion(null)
    setShowQuestionForm(false)
  }

  const deleteQuestion = (questionId: string) => {
    const newQuestions = quizData.questions.filter((q) => q.id !== questionId)
    updateQuizData({ questions: newQuestions })
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Configuration du Quiz</CardTitle>
        <CardDescription>Créez un quiz pour évaluer la compréhension</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quiz Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quizTitle">Titre du quiz</Label>
            <Input
              id="quizTitle"
              value={quizData.title}
              onChange={(e) => updateQuizData({ title: e.target.value })}
              placeholder="Quiz - Chapitre 1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passingScore">Score minimum (%)</Label>
            <Input
              id="passingScore"
              type="number"
              min="0"
              max="100"
              value={quizData.passingScore}
              onChange={(e) => updateQuizData({ passingScore: Number.parseInt(e.target.value) })}
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Questions ({quizData.questions.length})</h4>
            <Button
              size="sm"
              onClick={() => {
                setEditingQuestion(null)
                setShowQuestionForm(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </div>

          {quizData.questions.map((question, index) => (
            <Card key={question.id} className="border-border bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium mb-2">
                      {index + 1}. {question.question}
                    </h5>
                    <div className="space-y-1">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`text-sm p-2 rounded ${
                            optionIndex === question.correctAnswer
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-muted"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                          {optionIndex === question.correctAnswer && " ✓"}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Explication:</strong> {question.explanation}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingQuestion(question)
                        setShowQuestionForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteQuestion(question.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {quizData.questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune question créée</p>
              <p className="text-sm">Ajoutez des questions pour créer votre quiz</p>
            </div>
          )}
        </div>

        {/* Question Form */}
        {showQuestionForm && (
          <QuestionForm
            initialData={editingQuestion}
            onSubmit={editingQuestion ? updateQuestion : addQuestion}
            onCancel={() => {
              setShowQuestionForm(false)
              setEditingQuestion(null)
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

interface QuestionFormProps {
  initialData?: QuizQuestion | null
  onSubmit: (question: QuizQuestion) => void
  onCancel: () => void
}

function QuestionForm({ initialData, onSubmit, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    question: initialData?.question || "",
    options: initialData?.options || ["", "", "", ""],
    correctAnswer: initialData?.correctAnswer || 0,
    explanation: initialData?.explanation || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const questionData: QuizQuestion = {
      id: initialData?.id || "",
      ...formData,
      options: formData.options.filter((option) => option.trim() !== ""),
    }
    onSubmit(questionData)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">{initialData ? "Modifier" : "Ajouter"} une question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Posez votre question..."
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Options de réponse</Label>
            <RadioGroup
              value={formData.correctAnswer.toString()}
              onValueChange={(value) => setFormData({ ...formData, correctAnswer: Number.parseInt(value) })}
            >
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="sr-only">
                    Option {index + 1}
                  </Label>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">{String.fromCharCode(65 + index)}</span>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-muted-foreground">Sélectionnez la bonne réponse</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explication (optionnel)</Label>
            <Textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Expliquez pourquoi cette réponse est correcte..."
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">{initialData ? "Modifier" : "Ajouter"} la question</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
