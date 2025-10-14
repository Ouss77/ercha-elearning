"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QuizComponentProps {
  chapterId: number
  onComplete: (chapterId: number, score: number) => void
}

export function QuizComponent({ chapterId, onComplete }: QuizComponentProps) {
  // Mock quiz data
  const [questions] = useState<QuizQuestion[]>([
    {
      id: 1,
      question: "Qu'est-ce que React ?",
      options: [
        "Un framework CSS",
        "Une bibliothèque JavaScript pour créer des interfaces utilisateur",
        "Un serveur web",
        "Un langage de programmation",
      ],
      correctAnswer: 1,
      explanation:
        "React est une bibliothèque JavaScript développée par Facebook pour créer des interfaces utilisateur.",
    },
    {
      id: 2,
      question: "Que signifie JSX ?",
      options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
      correctAnswer: 0,
      explanation: "JSX signifie JavaScript XML et permet d'écrire du HTML dans JavaScript.",
    },
    {
      id: 3,
      question: "Comment passe-t-on des données à un composant React ?",
      options: ["Via les props", "Via les variables globales", "Via localStorage", "Via les cookies"],
      correctAnswer: 0,
      explanation: "Les props (propriétés) sont le moyen standard de passer des données aux composants React.",
    },
  ])

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / questions.length) * 100)
  }

  const handleFinishQuiz = () => {
    const score = calculateScore()
    setQuizCompleted(true)
    onComplete(chapterId, score)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (showResults) {
    const score = calculateScore()
    const passed = score >= 70

    return (
      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">{passed ? "Félicitations !" : "Quiz échoué"}</CardTitle>
            <CardDescription>
              Votre score : {score}% (
              {selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length}/
              {questions.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={score} className="h-3" />
              <p className="text-center text-muted-foreground">
                {passed
                  ? "Vous avez réussi le quiz ! Vous pouvez passer au chapitre suivant."
                  : "Score minimum requis : 70%. Vous pouvez reprendre le quiz."}
              </p>
              <div className="flex justify-center space-x-4">
                {!quizCompleted && <Button onClick={handleFinishQuiz}>Terminer le quiz</Button>}
                {!passed && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentQuestion(0)
                      setSelectedAnswers([])
                      setShowResults(false)
                    }}
                  >
                    Reprendre le quiz
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Answers */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Révision des réponses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index]
                const isCorrect = userAnswer === question.correctAnswer

                return (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start space-x-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {index + 1}. {question.question}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Votre réponse : {question.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Bonne réponse : {question.options[question.correctAnswer]}
                          </p>
                        )}
                        {question.explanation && (
                          <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Question {currentQuestion + 1} sur {questions.length}
        </h3>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}% complété</span>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
          >
            {question.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
          Précédent
        </Button>
        <Button onClick={handleNext} disabled={selectedAnswers[currentQuestion] === undefined}>
          {currentQuestion === questions.length - 1 ? "Terminer" : "Suivant"}
        </Button>
      </div>
    </div>
  )
}
