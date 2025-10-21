"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import type { QuizContent, QuizQuestion } from "@/types/chapter"

interface QuizEditorProps {
  value: QuizContent | null
  onChange: (value: QuizContent) => void
  disabled?: boolean
}

export function QuizEditor({ value, onChange, disabled = false }: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    value?.questions || []
  )
  const [passingScore, setPassingScore] = useState(
    value?.passingScore?.toString() || ""
  )
  const [timeLimit, setTimeLimit] = useState(value?.timeLimit?.toString() || "")
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    setQuestions(value?.questions || [])
    setPassingScore(value?.passingScore?.toString() || "")
    setTimeLimit(value?.timeLimit?.toString() || "")
  }, [value])

  const validateQuiz = (): boolean => {
    const newErrors: string[] = []

    if (questions.length === 0) {
      newErrors.push("Au moins une question est requise")
    }

    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors.push(`Question ${index + 1}: Le texte de la question est requis`)
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

  const updateQuizContent = (
    newQuestions: QuizQuestion[],
    newPassingScore: string,
    newTimeLimit: string
  ) => {
    const passingScoreNum = newPassingScore
      ? parseInt(newPassingScore, 10)
      : undefined
    const timeLimitNum = newTimeLimit ? parseInt(newTimeLimit, 10) : undefined

    onChange({
      type: "quiz",
      questions: newQuestions,
      passingScore:
        passingScoreNum && passingScoreNum >= 0 && passingScoreNum <= 100
          ? passingScoreNum
          : undefined,
      timeLimit: timeLimitNum && timeLimitNum > 0 ? timeLimitNum : undefined,
    })
  }

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
    }
    const newQuestions = [...questions, newQuestion]
    setQuestions(newQuestions)
    updateQuizContent(newQuestions, passingScore, timeLimit)
  }

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    updateQuizContent(newQuestions, passingScore, timeLimit)
  }

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    setQuestions(newQuestions)
    updateQuizContent(newQuestions, passingScore, timeLimit)
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
    updateQuizContent(newQuestions, passingScore, timeLimit)
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
    updateQuizContent(newQuestions, passingScore, timeLimit)
  }

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
    updateQuizContent(newQuestions, passingScore, timeLimit)
  }

  const handlePassingScoreChange = (value: string) => {
    setPassingScore(value)
    updateQuizContent(questions, value, timeLimit)
  }

  const handleTimeLimitChange = (value: string) => {
    setTimeLimit(value)
    updateQuizContent(questions, passingScore, value)
  }

  useEffect(() => {
    if (questions.length > 0) {
      validateQuiz()
    }
  }, [questions])

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

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Questions du quiz</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez des questions à choix multiples
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="passing-score">Score de réussite (%)</Label>
          <Input
            id="passing-score"
            type="number"
            min="0"
            max="100"
            value={passingScore}
            onChange={(e) => handlePassingScoreChange(e.target.value)}
            disabled={disabled}
            placeholder="70"
          />
          <p className="text-sm text-muted-foreground">Optionnel (0-100)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-limit">Limite de temps (minutes)</Label>
          <Input
            id="time-limit"
            type="number"
            min="1"
            value={timeLimit}
            onChange={(e) => handleTimeLimitChange(e.target.value)}
            disabled={disabled}
            placeholder="30"
          />
          <p className="text-sm text-muted-foreground">Optionnel</p>
        </div>
      </div>
    </div>
  )
}
