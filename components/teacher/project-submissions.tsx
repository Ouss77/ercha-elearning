"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Send,
} from "lucide-react";

interface ProjectSubmissionData {
  submissionId: number;
  submissionUrl: string | null;
  description: string | null;
  status: string | null;
  feedback: string | null;
  grade: number | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  projectId: number;
  projectTitle: string;
  projectDescription: string;
  courseId: number;
  courseTitle: string;
  courseThumbnail: string | null;
  domainId: number | null;
  domainName: string | null;
  domainColor: string | null;
}

interface ProjectSubmissionsProps {
  submissions: ProjectSubmissionData[];
}

export function ProjectSubmissions({ submissions }: ProjectSubmissionsProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<ProjectSubmissionData | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");

  // Get unique domains
  const domains = useMemo(() => {
    const uniqueDomains = new Map<number, { name: string; color: string }>();
    submissions.forEach((submission) => {
      if (submission.domainId && submission.domainName) {
        uniqueDomains.set(submission.domainId, {
          name: submission.domainName,
          color: submission.domainColor || "#3b82f6",
        });
      }
    });
    return Array.from(uniqueDomains.entries()).map(([id, data]) => ({
      id: id.toString(),
      ...data,
    }));
  }, [submissions]);

  // Get unique courses
  const courses = useMemo(() => {
    const uniqueCourses = new Map<number, string>();
    submissions.forEach((submission) => {
      uniqueCourses.set(submission.courseId, submission.courseTitle);
    });
    return Array.from(uniqueCourses.entries()).map(([id, title]) => ({
      id: id.toString(),
      title,
    }));
  }, [submissions]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesDomain =
        selectedDomain === "all" ||
        submission.domainId?.toString() === selectedDomain;
      const matchesCourse =
        selectedCourse === "all" ||
        submission.courseId.toString() === selectedCourse;
      const matchesStatus =
        selectedStatus === "all" || submission.status === selectedStatus;

      return matchesDomain && matchesCourse && matchesStatus;
    });
  }, [submissions, selectedDomain, selectedCourse, selectedStatus]);

  // Stats
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(
      (s) => s.status === "submitted" || s.status === null
    ).length;
    const reviewed = submissions.filter(
      (s) => s.status === "reviewed" || s.status === "graded"
    ).length;

    return { total, pending, reviewed };
  }, [submissions]);

  const handleReviewSubmission = (submission: ProjectSubmissionData) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || "");
    setGrade(submission.grade?.toString() || "");
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedSubmission(null);
    setFeedback("");
    setGrade("");
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch(
        `/api/projects/submissions/${selectedSubmission.submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback,
            grade: grade ? parseInt(grade) : null,
            status: "reviewed",
          }),
        }
      );

      if (response.ok) {
        handleCloseReviewModal();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "reviewed":
      case "graded":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Évalué
          </Badge>
        );
      case "submitted":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Non évalué
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Évalués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.reviewed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Projets Soumis</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Domain Filter */}
              {domains.length > 0 && (
                <Select
                  value={selectedDomain}
                  onValueChange={setSelectedDomain}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Tous les domaines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les domaines</SelectItem>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: domain.color }}
                          />
                          {domain.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Course Filter */}
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tous les cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cours</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="submitted">En attente</SelectItem>
                  <SelectItem value="reviewed">Évalués</SelectItem>
                  <SelectItem value="graded">Notés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Projet</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Aucun projet soumis pour le moment
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.submissionId}>
                      {/* Student */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <div
                              className="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  submission.domainColor || "#3b82f6"
                                } 0%, ${
                                  submission.domainColor
                                    ? `${submission.domainColor}dd`
                                    : "#2563eb"
                                } 100%)`,
                              }}
                            >
                              {submission.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {submission.studentName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {submission.studentEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Project */}
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium line-clamp-1">
                            {submission.projectTitle}
                          </div>
                          {submission.submissionUrl && (
                            <a
                              href={submission.submissionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Voir le projet
                            </a>
                          )}
                        </div>
                      </TableCell>

                      {/* Course */}
                      <TableCell>
                        <div className="max-w-[150px] line-clamp-1">
                          {submission.courseTitle}
                        </div>
                      </TableCell>

                      {/* Domain */}
                      <TableCell>
                        {submission.domainName && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: submission.domainColor || "#3b82f6",
                              color: submission.domainColor || "#3b82f6",
                              backgroundColor: submission.domainColor
                                ? `${submission.domainColor}10`
                                : "#3b82f610",
                            }}
                          >
                            {submission.domainName}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Submitted Date */}
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {submission.submittedAt
                            ? new Date(
                                submission.submittedAt
                              ).toLocaleDateString("fr-FR")
                            : "N/A"}
                        </div>
                      </TableCell>

                      {/* Grade */}
                      <TableCell>
                        {submission.grade !== null ? (
                          <div className="font-semibold text-emerald-600">
                            {submission.grade}/100
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          onClick={() => handleReviewSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle>Évaluer le projet</DialogTitle>
                <DialogDescription>
                  {selectedSubmission.projectTitle} -{" "}
                  {selectedSubmission.studentName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Project Details */}
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Détails du projet</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cours</span>
                      <span className="font-medium">
                        {selectedSubmission.courseTitle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Étudiant</span>
                      <span className="font-medium">
                        {selectedSubmission.studentName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Soumis le</span>
                      <span className="font-medium">
                        {selectedSubmission.submittedAt
                          ? new Date(
                              selectedSubmission.submittedAt
                            ).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Student Description */}
                {selectedSubmission.description && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <h3 className="font-semibold text-sm">
                      Description de l&apos;étudiant
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubmission.description}
                    </p>
                  </div>
                )}

                {/* Submission URL */}
                {selectedSubmission.submissionUrl && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <h3 className="font-semibold text-sm">Lien du projet</h3>
                    <a
                      href={selectedSubmission.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {selectedSubmission.submissionUrl}
                    </a>
                  </div>
                )}

                {/* Feedback Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Note (sur 100)</Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max="100"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Entrez une note"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Commentaires</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Ajoutez vos commentaires et suggestions..."
                      rows={6}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseReviewModal}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enregistrer l&apos;évaluation
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
