"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Award,
  Download,
  Share2,
  Search,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  Trophy,
} from "lucide-react";
import type { User } from "@/lib/auth/auth";

interface CertificatesViewProps {
  user: User;
  enrolledCourses: Array<{
    enrollmentId: number;
    courseId: number;
    courseTitle: string;
    courseDescription: string | null;
    courseThumbnailUrl: string | null;
    enrolledAt: Date;
    completedAt: Date | null;
    domainId: number | null;
    domainName: string | null;
    domainColor: string | null;
    teacherId: number | null;
    teacherName: string | null;
    totalChapters: number;
    completedChapters: number;
  }>;
}

interface Certificate {
  id: string;
  courseTitle: string;
  courseDomain: string;
  completedAt: string;
  instructor: string;
  grade: number;
  certificateNumber: string;
  status: "issued" | "pending";
  progress?: number;
}

export function CertificatesView({
  user,
  enrolledCourses: rawEnrolledCourses,
}: CertificatesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock certificates data (keep for testing)
  const [certificates] = useState<Certificate[]>([
    {
      id: "CERT-2025-001",
      courseTitle: "Marketing Digital Avancé",
      courseDomain: "Marketing",
      completedAt: "2025-01-10",
      instructor: "Jean Martin",
      grade: 92,
      certificateNumber: "EDU-2025-MKT-001",
      status: "issued",
    },
  ]);

  // Transform incomplete enrolled courses to pending certificates
  const pendingCertificates: Certificate[] = useMemo(() => {
    return rawEnrolledCourses
      .filter((enrollment) => enrollment.completedAt === null) // Only incomplete courses
      .map((enrollment) => {
        const progress =
          enrollment.totalChapters > 0
            ? Math.round(
                (enrollment.completedChapters / enrollment.totalChapters) * 100
              )
            : 0;

        return {
          id: `PENDING-${enrollment.courseId}`,
          courseTitle: enrollment.courseTitle,
          courseDomain: enrollment.domainName || "Non classé",
          completedAt: "",
          instructor: enrollment.teacherName || "Non assigné",
          grade: 0,
          certificateNumber: "",
          status: "pending" as const,
          progress,
        };
      });
  }, [rawEnrolledCourses]);

  // Create domain color mapping from database
  const domainColorMap = useMemo(() => {
    const colorMap: Record<string, string> = {};
    rawEnrolledCourses.forEach((enrollment) => {
      if (enrollment.domainName && enrollment.domainColor) {
        colorMap[enrollment.domainName] = enrollment.domainColor;
      }
    });
    return colorMap;
  }, [rawEnrolledCourses]);

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseDomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDomainColor = (domain: string) => {
    // Use database domain colors or fallback to default colors
    if (domainColorMap[domain]) {
      // Convert bg-color-500 to badge-friendly classes
      const baseColor = domainColorMap[domain].replace("bg-", "");
      return `bg-${baseColor.replace("500", "100")} text-${baseColor.replace(
        "500",
        "700"
      )} dark:bg-${baseColor.replace(
        "500",
        "950"
      )} dark:text-${baseColor.replace("500", "400")}`;
    }

    // Fallback colors
    const colors: Record<string, string> = {
      Informatique:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      "Développement Web":
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      Marketing:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      "Marketing Digital":
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      Design:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      "Design Graphique":
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    };
    return (
      colors[domain] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
    );
  };

  const handleDownload = (certId: string) => {
    // Implement download logic
    console.log("Downloading certificate:", certId);
  };

  const handleShare = (certId: string) => {
    // Implement share logic
    console.log("Sharing certificate:", certId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mes Certificats</h1>
        <p className="text-muted-foreground mt-2">
          Gérez et partagez vos certificats de formation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certificats Obtenus
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {certificates.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Formations complétées
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Progression
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              {pendingCertificates.length}
            </div>
            <p className="text-xs text-muted-foreground">Cours en cours</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {certificates.length > 0
                ? Math.round(
                    certificates.reduce((acc, cert) => acc + cert.grade, 0) /
                      certificates.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Performance globale</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un certificat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Issued Certificates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Certificats Délivrés</h2>
          <Badge variant="outline" className="ml-2">
            {certificates.length}
          </Badge>
        </div>

        {filteredCertificates.length === 0 && certificates.length > 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun certificat trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier votre recherche
              </p>
            </CardContent>
          </Card>
        ) : filteredCertificates.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun certificat pour le moment
              </h3>
              <p className="text-muted-foreground mb-4">
                Terminez vos cours pour obtenir vos premiers certificats
              </p>
              <Button>
                <Trophy className="h-4 w-4 mr-2" />
                Voir mes cours
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredCertificates.map((cert) => (
              <Card
                key={cert.id}
                className="border-border bg-gradient-to-br from-card to-muted/20 hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Certificate Visual */}
                    <div className="flex-shrink-0">
                      <div className="w-full md:w-48 h-48 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 flex flex-col items-center justify-center text-white shadow-lg">
                        <Award className="h-16 w-16 mb-3" />
                        <div className="text-center">
                          <p className="text-sm font-medium opacity-90">
                            Certificat de
                          </p>
                          <p className="text-xs font-semibold mt-1">
                            Complétion
                          </p>
                        </div>
                        <div className="mt-4 text-xs opacity-75">
                          {cert.certificateNumber}
                        </div>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDomainColor(cert.courseDomain)}>
                            {cert.courseDomain}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-emerald-600 border-emerald-600"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Certifié
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                          {cert.courseTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Formateur : {cert.instructor}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Date d'obtention
                          </p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              {new Date(cert.completedAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Score Final
                          </p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {cert.grade}%
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Numéro
                          </p>
                          <p className="text-sm font-mono">
                            {cert.certificateNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          onClick={() => handleDownload(cert.id)}
                          className="flex-1 md:flex-none"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare(cert.id)}
                          className="flex-1 md:flex-none"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 md:flex-none"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Vérifier
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pending Certificates */}
      {pendingCertificates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-cyan-600" />
            <h2 className="text-xl font-semibold">Certificats à Débloquer</h2>
            <Badge variant="outline" className="ml-2">
              {pendingCertificates.length}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {pendingCertificates.map((cert) => (
              <Card
                key={cert.id}
                className="border-border bg-card hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getDomainColor(cert.courseDomain)}>
                      {cert.courseDomain}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-cyan-600 border-cyan-600"
                    >
                      En cours
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{cert.courseTitle}</CardTitle>
                  <CardDescription>
                    Terminez ce cours pour obtenir votre certificat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 mb-4">
                    <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-950">
                      <Trophy className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Certificat en attente
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cert.progress !== undefined
                          ? `Progression: ${cert.progress}%`
                          : "Complétez tous les chapitres"}
                      </p>
                    </div>
                  </div>
                  {cert.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Progression
                        </span>
                        <span className="text-sm font-semibold">
                          {cert.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-cyan-600 h-2 rounded-full transition-all"
                          style={{ width: `${cert.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Button className="w-full" variant="outline">
                    Continuer le cours
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />À propos des certificats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ Tous les certificats sont vérifiables en ligne</p>
          <p>✓ Format PDF haute qualité pour l'impression</p>
          <p>✓ Partageables sur LinkedIn et autres réseaux professionnels</p>
          <p>✓ Numéro unique pour chaque certificat</p>
        </CardContent>
      </Card>
    </div>
  );
}
