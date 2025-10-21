"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Trophy,
  RotateCcw,
} from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizData {
  type: "quiz" | "test" | "exam";
  questions: Question[];
  passingScore?: number;
  timeLimit?: number;
  attemptsAllowed?: number;
  proctored?: boolean;
}

interface QuizViewProps {
  courseId: number;
  contentId: number;
  title: string;
  contentData: QuizData;
  userId: string;
}

export default function QuizView({
  courseId,
  contentId,
  title,
  contentData,
  userId,
}: QuizViewProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(contentData.questions.length).fill(null)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const maxAttempts = 3;

  const currentQuestion = contentData.questions[currentQuestionIndex];
  const totalQuestions = contentData.questions.length;
  const progressPercentage =
    ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Fetch previous attempts on mount
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await fetch(
          `/api/quiz-attempts?contentId=${contentId}`
        );
        const data = await response.json();
        if (data.attempts) {
          setPreviousAttempts(data.attempts);
          setAttemptCount(data.attempts.length);

          // Check if already passed
          const passedAttempt = data.attempts.find((a: any) => a.passed);
          if (passedAttempt) {
            setIsSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [contentId]);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let correctCount = 0;
    contentData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = contentData.passingScore
      ? score >= contentData.passingScore
      : true;

    // Save quiz attempt to database
    try {
      await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          answers,
          score,
          passed,
        }),
      });

      setAttemptCount(attemptCount + 1);
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
    }

    setIsSubmitted(true);
  };

  const calculateScore = () => {
    let correctCount = 0;
    contentData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / totalQuestions) * 100);
  };

  const getTypeColor = () => {
    switch (contentData.type) {
      case "quiz":
        return "from-teal-600 to-emerald-600";
      case "test":
        return "from-orange-600 to-amber-600";
      case "exam":
        return "from-red-600 to-rose-600";
      default:
        return "from-teal-600 to-emerald-600";
    }
  };

  const getTypeLabel = () => {
    switch (contentData.type) {
      case "quiz":
        return "Quiz";
      case "test":
        return "Test";
      case "exam":
        return "Examen";
      default:
        return "Quiz";
    }
  };

  if (isSubmitted) {
    const score = calculateScore();
    const passed = contentData.passingScore
      ? score >= contentData.passingScore
      : true;
    const attemptsRemaining = maxAttempts - attemptCount;
    const canRetry = !passed && attemptCount < maxAttempts;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center space-y-4">
              {passed ? (
                <div className="space-y-4">
                  <Trophy className="h-20 w-20 mx-auto text-yellow-600" />
                  <h1 className="text-3xl font-bold text-green-600">
                    Félicitations! 🎉
                  </h1>
                  <p className="text-muted-foreground">
                    Vous avez réussi ce {getTypeLabel().toLowerCase()}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <XCircle className="h-20 w-20 mx-auto text-red-600" />
                  <h1 className="text-3xl font-bold">Pas encore...</h1>
                  {canRetry && (
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-600"
                      >
                        {attemptsRemaining} tentative
                        {attemptsRemaining > 1 ? "s" : ""} restante
                        {attemptsRemaining > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{score}%</div>
                <p className="text-muted-foreground">
                  {
                    contentData.questions.filter(
                      (q, i) => answers[i] === q.correctAnswer
                    ).length
                  }{" "}
                  / {totalQuestions} questions correctes
                </p>
                {contentData.passingScore && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Score minimum requis: {contentData.passingScore}%
                  </p>
                )}
              </div>

              {/* Show answers only if passed OR if no attempts remaining */}
              {(passed || attemptCount >= maxAttempts) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Révision des réponses
                  </h3>
                  {contentData.questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          isCorrect
                            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium mb-2">
                              Question {index + 1}: {question.question}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">
                                  Votre réponse:
                                </span>{" "}
                                {userAnswer !== null
                                  ? question.options[userAnswer]
                                  : "Non répondu"}
                              </p>
                              {!isCorrect && (
                                <p className="text-green-700 dark:text-green-400">
                                  <span className="font-medium">
                                    Bonne réponse:
                                  </span>{" "}
                                  {question.options[question.correctAnswer]}
                                </p>
                              )}
                              {question.explanation && (
                                <p className="text-muted-foreground italic mt-2">
                                  💡 {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* If failed but still has attempts, show encouragement instead of answers */}
              {!passed && canRetry && (
                <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                        Continuez vos efforts!
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        Vous n&apos;avez pas atteint le score minimum cette
                        fois-ci. Révisez le contenu du cours et réessayez!
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        💡 Les bonnes réponses seront révélées après votre
                        dernière tentative ou lorsque vous réussirez.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* If failed and no attempts remaining */}
              {!passed && !canRetry && (
                <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Tentatives épuisées
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Vous avez utilisé toutes vos tentatives. Révisez les
                        bonnes réponses ci-dessus et consultez votre enseignant
                        si vous avez besoin d&apos;aide.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/etudiant/cours/${courseId}`)}
                  className="flex-1"
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au cours
                </Button>
                {canRetry && (
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setCurrentQuestionIndex(0);
                      setAnswers(new Array(totalQuestions).fill(null));
                    }}
                    className={`flex-1 bg-gradient-to-r ${getTypeColor()} hover:opacity-90 text-white`}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Réessayer ({attemptsRemaining} restante
                    {attemptsRemaining > 1 ? "s" : ""})
                  </Button>
                )}
                {passed && (
                  <Button
                    onClick={() => router.push("/etudiant/jalons")}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Voir mes jalons
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 animate-spin text-teal-600" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card
          className={`border-2 bg-gradient-to-r ${getTypeColor()} text-white`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">
                    {getTypeLabel()}
                  </span>
                  {attemptCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30"
                    >
                      Tentative {attemptCount + 1} / {maxAttempts}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-4">{title}</h1>
                <div className="flex items-center gap-6 text-sm opacity-90">
                  <span>
                    Question {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                  {contentData.timeLimit && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor((contentData.timeLimit || 0) / 60)} min
                    </span>
                  )}
                  {contentData.passingScore && (
                    <span>Score minimum: {contentData.passingScore}%</span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/etudiant/cours/${courseId}`)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quitter
              </Button>
            </div>
            <Progress
              value={progressPercentage}
              className="mt-4 h-2 bg-white/30"
            />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="border-2">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-6">
              {currentQuestion.question}
            </h2>

            <RadioGroup
              value={answers[currentQuestionIndex]?.toString() ?? ""}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    answers[currentQuestionIndex] === index
                      ? "border-teal-600 bg-teal-50 dark:bg-teal-950"
                      : "border-border hover:border-teal-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    className="flex-shrink-0"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Warning for unanswered questions */}
        {currentQuestionIndex === totalQuestions - 1 &&
          answers.some((a) => a === null) && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Questions non répondues
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Vous avez {answers.filter((a) => a === null).length}{" "}
                    question(s) sans réponse. Vous pouvez naviguer entre les
                    questions avec les boutons ci-dessous.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-2">
            {contentData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? "bg-teal-600 text-white ring-2 ring-teal-600 ring-offset-2"
                    : answers[index] !== null
                    ? "bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answers.every((a) => a === null)}
              size="lg"
              className={`bg-gradient-to-r ${getTypeColor()} hover:opacity-90 text-white`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Soumettre
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
              size="lg"
              className={`bg-gradient-to-r ${getTypeColor()} hover:opacity-90 text-white`}
            >
              Suivant
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
