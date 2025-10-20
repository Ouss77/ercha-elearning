"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import type { ExamContent, ExamQuestion, Difficulty } from "@/types/chapter"

interface ExamEditorProps {
  value: ExamContent | null
  onChange: (value: ExamContent) => void
  disabled?: boolean
}

export function ExamEditor({ value, onChange, disabled = false }: ExamEditorProps) {
  const [questions, setQuestions] = useState<ExamQuestion[]>(
    value?.questions || []
  )
  const [passingScore, setPassingScore] = useState(
    value?.passingScore?.toString() || ""
  )
  const [timeLimit, setTimeLimit] = useState(value?.timeLimit?.toString() || "")
  const [attemptsAllowed, setAttemptsAllowed] = useState(
    value?.attemptsAllowed?.toString() || ""
  )
  const [proctored, setProctored] = useState(value?.proctored || false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    setQuestions(value?.questions || [])
    setPassingScore(value?.passingScore?.toString() || "")
    setTimeLimit(value?.timeLimit?.toString() || "")
    setAttemptsAllowed(value?.attemptsAllowed?.toString() || "")
    setProctored(value?.proctored || false)
  }, [value])

  const validateExam = (): boolean => {
    const newErrors: string[] = []

    if (questions.length === 0) {
      newErrors.push("Au moins une question est requise pour un examen")
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
      if (!q.category || !q.category.trim()) {
        newErrors.push(`Question ${index + 1}: La catégorie est requise`)
      }
      if (q.options.length < 2) {
        newErrors.push(`Question ${index + 1}: Au moins 2 options sont requises`)
      }
      if (q.options.length > 6) {
        newErrors.push(`Question ${index + 1}: Maximum 6 options autorisées`)
      }
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        newErrors.push(`Question ${index + 1}: Réponse correcte invalide`)
      }
      if (!q.points || q.points <= 0) {
        newErrors.push(`Question ${index + 1}: Les points sont requis (> 0)`)
      }
      q.options.forEach((opt, optIndex) => {
        if (!opt.trim()) {
          newErrors.push(
            `Question ${index + 1}, Option ${optIndex + 1}: Le texte est requis`
          )
        }
      })
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const updateExamContent = (
    newQuestions: ExamQuestion[],
    newPassingScore: string,
    newTimeLimit: string,
    newAttemptsAllowed: string,
    newProctored: boolean
  ) => {
    const passingScoreNum = parseInt(newPassingScore, 10)
    const timeLimitNum = parseInt(newTimeLimit, 10)
    const attemptsAllowedNum = parseInt(newAttemptsAllowed, 10)

    onChange({
      type: "exam",
      questions: newQuestions,
      passingScore: passingScoreNum,
      timeLimit: timeLimitNum,
      attemptsAllowed: attemptsAllowedNum,
      proctored: newProctored,
    })
  }

  const addQuestion = () => {
    const newQuestion: ExamQuestion = {
      id: `q-${Date.now()}`,
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
      points: 1,
      difficulty: "medium",
      category: "",
    }
    const newQuestions = [...questions, newQuestion]
    setQuestions(newQuestions)
    updateExamContent(
      newQuestions,
      passingScore,
      timeLimit,
      attemptsAllowed,
      proctored
    )
  }

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    updateExamContent(
      newQuestions,
      passingScore,
      timeLimit,
      attemptsAllowed,
      proctored
    )
  }

  const updateQuestion = (index: number, updates: Partial<ExamQuestion>) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    setQuestions(newQuestions)
    updateExamContent(
      newQuestions,
      passingScore,
      timeLimit,
      attemptsAllowed,
      proctored
    )
  }

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex]
    if (question.options.length >= 6) return

    const newQuestions = [...questions]
    newQuestions[questionIndex] = {
      ...question,
      options: [...question.options, ""],
    }
    setQuestions(newQuestions)
    updateExamContent(
      newQuestions,
      passingScore,
      timeLimit,
      attemptsAllowed,
      proctored
    )
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex]
    if (question.options.length <= 2) return

    const newOptions = question.options.filter((_, i) => i !== optionIndex)
    const newCorrectAnswer =
      question.correctAnswer === optionIndex
        ? 0
        : question.correctAnswer > optionIndex
        ? question.correctAnswer - 1
        : question.correctAnswer

    const newQuestions = [...questions]
    newQuestions[questionIndex] = {
      ...question,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    }
    setQuestions(newQuestions)
    updateExamContent(
      newQuestions,
      passingScore,
      timeLimit,
      attemptsAllowed,
      proctored
    )
  }

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
    updateExamContent(
      newQuestions,
      passingScore,
      timeLimit,
      attemptsAllowed,
      proctored
    )
  }

  useEffect(() => {
    if (questions.length > 0 || passingScore || timeLimit || attemptsAllowed) {
      validateExam()
    }
  }, [questions, passingScore, timeLimit, attemptsAllowed, proctored])

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration de l'examen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  updateExamContent(
                    questions,
                    e.target.value,
                    timeLimit,
                    attemptsAllowed,
                    proctored
                  )
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
                  updateExamContent(
                    questions,
                    passingScore,
                    e.target.value,
                    attemptsAllowed,
                    proctored
                  )
                }}
                disabled={disabled}
                placeholder="120"
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
                  updateExamContent(
                    questions,
                    passingScore,
                    timeLimit,
                    e.target.value,
                    proctored
                  )
                }}
                disabled={disabled}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="proctored"
              checked={proctored}
              onCheckedChange={(checked) => {
                setProctored(checked)
                updateExamContent(
                  questions,
                  passingScore,
                  timeLimit,
                  attemptsAllowed,
                  checked
                )
              }}
              disabled={disabled}
            />
            <Label htmlFor="proctored" className="cursor-pointer">
              Examen surveillé (proctoring)
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Activez cette option pour un examen avec surveillance et restrictions supplémentaires
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Questions de l'examen</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez des questions avec catégories, points et difficulté
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`category-${qIndex}`}>Catégorie *</Label>
                <Input
                  id={`category-${qIndex}`}
                  value={question.category}
                  onChange={(e) =>
                    updateQuestion(qIndex, { category: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Ex: Mathématiques"
                />
              </div>

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

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Options de réponse *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(qIndex)}
                  disabled={disabled || question.options.length >= 6}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter une option
                </Button>
              </div>

              <RadioGroup
                value={question.correctAnswer.toString()}
                onValueChange={(value) =>
                  updateQuestion(qIndex, { correctAnswer: parseInt(value, 10) })
                }
                disabled={disabled}
              >
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={oIndex.toString()}
                      id={`q${qIndex}-opt${oIndex}`}
                    />
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      disabled={disabled}
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(qIndex, oIndex)}
                      disabled={disabled || question.options.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Sélectionnez la bonne réponse en cliquant sur le bouton radio
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
