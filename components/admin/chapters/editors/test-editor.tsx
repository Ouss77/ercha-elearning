"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import type { TestContent, TestQuestion, Difficulty } from "@/types/chapter"

interface TestEditorProps {
  value: TestContent | null
  onChange: (value: TestContent) => void
  disabled?: boolean
}

export function TestEditor({ value, onChange, disabled = false }: TestEditorProps) {
  const [questions, setQuestions] = useState<TestQuestion[]>(
    value?.questions || []
  )
  const [passingScore, setPassingScore] = useState(
    value?.passingScore?.toString() || ""
  )
  const [timeLimit, setTimeLimit] = useState(value?.timeLimit?.toString() || "")
  const [attemptsAllowed, setAttemptsAllowed] = useState(
    value?.attemptsAllowed?.toString() || ""
  )
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    setQuestions(value?.questions || [])
    setPassingScore(value?.passingScore?.toString() || "")
    setTimeLimit(value?.timeLimit?.toString() || "")
    setAttemptsAllowed(value?.attemptsAllowed?.toString() || "")
  }, [value])

  const validateTest = (): boolean => {
    const newErrors: string[] = []

    if (questions.length === 0) {
      newErrors.push("Au moins une question est requise")
    }

    if (!passingScore || parseInt(passingScore, 10) < 0 || parseInt(passingScore, 10) > 100) {
      newErrors.push("Le score de réussite est requis (0-100)")
    }

    if (!timeLimit || parseInt(timeLimit, 10) <= 0) {
      newErrors.push("La limite de temps est requise (> 0)")
    }

    if (!attemptsAllowed || parseInt(attemptsAllowed, 10) <= 0) {
      newErrors.push("Le nombre de tentatives est requis (> 0)")
    }

    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors.push(`Question ${index + 1}: Le texte de la question est requis`)
      }
      if (!q.points || q.points <= 0) {
        newErrors.push(`Question ${index + 1}: Les points sont requis (> 0)`)
      }
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const updateTestContent = (
    newQuestions: TestQuestion[],
    newPassingScore: string,
    newTimeLimit: string,
    newAttemptsAllowed: string
  ) => {
    const passingScoreNum = parseInt(newPassingScore, 10)
    const timeLimitNum = parseInt(newTimeLimit, 10)
    const attemptsAllowedNum = parseInt(newAttemptsAllowed, 10)

    onChange({
      type: "test",
      questions: newQuestions,
      passingScore: passingScoreNum,
      timeLimit: timeLimitNum,
      attemptsAllowed: attemptsAllowedNum,
    })
  }

  const addQuestion = () => {
    const newQuestion: TestQuestion = {
      id: `q-${Date.now()}`,
      question: "",
      points: 1,
      difficulty: "medium",
      explanation: "",
      expectedAnswer: "",
    }
    const newQuestions = [...questions, newQuestion]
    setQuestions(newQuestions)
    updateTestContent(newQuestions, passingScore, timeLimit, attemptsAllowed)
  }

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    updateTestContent(newQuestions, passingScore, timeLimit, attemptsAllowed)
  }

  const updateQuestion = (index: number, updates: Partial<TestQuestion>) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    setQuestions(newQuestions)
    updateTestContent(newQuestions, passingScore, timeLimit, attemptsAllowed)
  }



  useEffect(() => {
    if (questions.length > 0 || passingScore || timeLimit || attemptsAllowed) {
      validateTest()
    }
  }, [questions, passingScore, timeLimit, attemptsAllowed])

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="passing-score">Score de réussite (%) *</Label>
          <Input
            id="passing-score"
            type="number"
            min="0"
            max="100"
            value={passingScore}
            onChange={(e) => {
              setPassingScore(e.target.value)
              updateTestContent(questions, e.target.value, timeLimit, attemptsAllowed)
            }}
            disabled={disabled}
            placeholder="70"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-limit">Limite de temps (min) *</Label>
          <Input
            id="time-limit"
            type="number"
            min="1"
            value={timeLimit}
            onChange={(e) => {
              setTimeLimit(e.target.value)
              updateTestContent(questions, passingScore, e.target.value, attemptsAllowed)
            }}
            disabled={disabled}
            placeholder="60"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attempts-allowed">Tentatives autorisées *</Label>
          <Input
            id="attempts-allowed"
            type="number"
            min="1"
            value={attemptsAllowed}
            onChange={(e) => {
              setAttemptsAllowed(e.target.value)
              updateTestContent(questions, passingScore, timeLimit, e.target.value)
            }}
            disabled={disabled}
            placeholder="3"
            required
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Questions du test</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez des questions avec points et difficulté
          </p>
        </div>
        <Button
          type="button"
          onClick={addQuestion}
          disabled={disabled}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une question
        </Button>
      </div>

      {questions.map((question, qIndex) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(qIndex)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`question-${qIndex}`}>Texte de la question *</Label>
              <Textarea
                id={`question-${qIndex}`}
                value={question.question}
                onChange={(e) =>
                  updateQuestion(qIndex, { question: e.target.value })
                }
                disabled={disabled}
                placeholder="Entrez votre question..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`points-${qIndex}`}>Points *</Label>
                <Input
                  id={`points-${qIndex}`}
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={question.points}
                  onChange={(e) =>
                    updateQuestion(qIndex, {
                      points: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={disabled}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`difficulty-${qIndex}`}>Difficulté *</Label>
                <Select
                  value={question.difficulty}
                  onValueChange={(value: Difficulty) =>
                    updateQuestion(qIndex, { difficulty: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger id={`difficulty-${qIndex}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Facile</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="hard">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`expected-answer-${qIndex}`}>
                Réponse attendue (optionnel)
              </Label>
              <Textarea
                id={`expected-answer-${qIndex}`}
                value={question.expectedAnswer || ""}
                onChange={(e) =>
                  updateQuestion(qIndex, { expectedAnswer: e.target.value })
                }
                disabled={disabled}
                placeholder="Décrivez la réponse attendue ou les critères d'évaluation..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Cette information aide à la correction manuelle. L'étudiant répondra de manière ouverte.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`explanation-${qIndex}`}>
                Explication (optionnel)
              </Label>
              <Textarea
                id={`explanation-${qIndex}`}
                value={question.explanation || ""}
                onChange={(e) =>
                  updateQuestion(qIndex, { explanation: e.target.value })
                }
                disabled={disabled}
                placeholder="Expliquez pourquoi cette réponse est correcte..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {questions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.
          </p>
        </Card>
      )}
    </div>
  )
}
