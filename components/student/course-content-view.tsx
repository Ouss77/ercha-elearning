"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Clock,
  Target,
  Trophy,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FolderOpen,
  Flag,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { User } from "@/lib/auth/auth";
import type { ModuleWithChaptersAndContent } from "@/lib/db/module-queries";

interface ContentItem {
  id: number;
  chapterId: number;
  title: string;
  contentType: string;
  orderIndex: number;
  contentData: any;
  createdAt: Date;
  updatedAt: Date;
}

interface Chapter {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  contentItems: ContentItem[];
}

interface CourseContentViewProps {
  user: User;
  course: {
    id: number;
    title: string;
    description: string | null;
    domainId: number | null;
    teacherId: number | null;
    thumbnailUrl: string | null;
    isActive: boolean | null;
    createdAt: Date;
    updatedAt: Date;
    slug: string | null;
  };
  domain: {
    id: number;
    name: string;
    color: string | null;
  } | null;
  teacher: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  modules: ModuleWithChaptersAndContent[];
  completedChapters: number[];
  totalChapters: number;
  quizAttempts: Array<{
    quizId: number;
    totalAttempts: number;
    bestScore: number | null;
    passed: boolean;
    maxAttempts: number;
  }>;
}

export function CourseContentView({
  user,
  course,
  domain,
  teacher,
  modules,
  completedChapters,
  totalChapters,
  quizAttempts = [],
}: CourseContentViewProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(modules.length > 0 ? [modules[0].id] : [])
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );
  const [selectedContent, setSelectedContent] = useState<{
    chapterId: number;
    contentId: number;
  } | null>(null);

  // Flatten chapters from all modules for easier access
  const allChapters = useMemo(() => {
    return modules.flatMap(module => module.chapters.map(ch => ({
      ...ch,
      contentItems: ch.contentItems || []
    })));
  }, [modules]);

  const stats = useMemo(() => {
    const completed = completedChapters.length;
    const total = totalChapters;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalContentItems = allChapters.reduce(
      (acc, ch) => acc + (ch.contentItems?.length || 0),
      0
    );

    return {
      completed,
      total,
      percentage,
      totalContentItems,
    };
  }, [completedChapters, totalChapters, allChapters]);

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const isChapterCompleted = (chapterId: number) => {
    return completedChapters.includes(chapterId);
  };

  const getContentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video":
        return Video;
      case "text":
      case "document":
        return FileText;
      case "image":
        return ImageIcon;
      case "link":
      case "url":
        return LinkIcon;
      default:
        return BookOpen;
    }
  };

  const openContent = (chapterId: number, contentId: number) => {
    setSelectedContent({ chapterId, contentId });
    // Scroll to content viewer
    document
      .getElementById("content-viewer")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const currentContent = useMemo(() => {
    if (!selectedContent) return null;
    const chapter = allChapters.find((ch) => ch.id === selectedContent.chapterId);
    const content = chapter?.contentItems?.find(
      (item) => item.id === selectedContent.contentId
    );
    if (!content || !chapter) return null;

    // Find the module that contains this chapter
    const module = modules.find(m =>
      m.chapters.some(ch => ch.id === chapter.id)
    );

    return { module, chapter, content };
  }, [selectedContent, allChapters, modules]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link href="/etudiant">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9">
                  <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Retour</span>
                </Button>
              </Link>
              <Separator
                orientation="vertical"
                className="h-8 hidden sm:block"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold text-foreground truncate">
                  {course.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {teacher?.name || "Instructeur"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
              {domain && (
                <Badge
                  className="text-xs sm:text-sm"
                  style={{
                    backgroundColor: domain.color
                      ? `${domain.color}20`
                      : undefined,
                    color: domain.color || undefined,
                    borderColor: domain.color ? `${domain.color}40` : undefined,
                  }}
                >
                  {domain.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Sidebar - Course Chapters */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Progress Card */}
              <Card className="border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Progression du cours
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {stats.percentage}%
                      </span>
                    </div>
                    <Progress value={stats.percentage} className="h-3" />
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
                        <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
                          {stats.completed}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Complétés
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {stats.total}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modules and Chapters List */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="h-5 w-5 text-teal-600" />
                    <h2 className="font-bold text-lg">Contenu du cours</h2>
                  </div>
                  <div className="space-y-3">
                    {modules.map((module, moduleIndex) => {
                      const isModuleExpanded = expandedModules.has(module.id);
                      const moduleCompletedChapters = module.chapters.filter(ch =>
                        isChapterCompleted(ch.id)
                      ).length;
                      const moduleProgress = module.chapters.length > 0
                        ? Math.round((moduleCompletedChapters / module.chapters.length) * 100)
                        : 0;

                      return (
                        <div
                          key={module.id}
                          className="border-2 border-border rounded-lg overflow-hidden"
                        >
                          {/* Module Header */}
                          <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20"
                          >
                            <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  Module {moduleIndex + 1}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {module.chapters.length}{" "}
                                  {module.chapters.length > 1 ? "chapitres" : "chapitre"}
                                </Badge>
                                {moduleProgress > 0 && (
                                  <Badge
                                    variant={moduleProgress === 100 ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {moduleProgress}%
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-base line-clamp-2">
                                {module.title}
                              </h3>
                              {module.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                  {module.description}
                                </p>
                              )}
                            </div>
                            {isModuleExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                            )}
                          </button>

                          {/* Chapters in Module */}
                          {isModuleExpanded && (
                            <div className="border-t border-border bg-muted/20">
                              {module.chapters.length > 0 ? (
                                <div className="p-2 space-y-1">
                                  {module.chapters.map((chapter, chapterIndex) => {
                                    const isExpanded = expandedChapters.has(chapter.id);
                                    const isCompleted = isChapterCompleted(chapter.id);
                                    const contentItems = chapter.contentItems || [];

                                    return (
                                      <div
                                        key={chapter.id}
                                        className="border border-border rounded-lg overflow-hidden hover:border-teal-500/50 transition-colors"
                                      >
                                        {/* Chapter Header */}
                                        <button
                                          onClick={() => toggleChapter(chapter.id)}
                                          className="w-full p-3 flex items-start gap-3 hover:bg-accent/50 transition-colors"
                                        >
                                          <div
                                            className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                                              isCompleted ? "bg-emerald-500" : "bg-muted"
                                            }`}
                                          >
                                            {isCompleted ? (
                                              <CheckCircle2 className="h-4 w-4 text-white" />
                                            ) : (
                                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                                            )}
                                          </div>
                                          <div className="flex-1 text-left min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-xs font-semibold text-muted-foreground">
                                                Chapitre {chapterIndex + 1}
                                              </span>
                                              {contentItems.length > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                  {contentItems.length}{" "}
                                                  {contentItems.length > 1 ? "éléments" : "élément"}
                                                </Badge>
                                              )}
                                            </div>
                                            <h3 className="font-semibold text-sm line-clamp-2">
                                              {chapter.title}
                                            </h3>
                                            {chapter.description && (
                                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                {chapter.description}
                                              </p>
                                            )}
                                          </div>
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                                          )}
                                        </button>

                                        {/* Content Items */}
                                        {isExpanded && contentItems.length > 0 && (
                                          <div className="border-t border-border bg-muted/30">
                                            {contentItems.map((item) => {
                                              const Icon = getContentIcon(item.contentType);
                                              const isActive = selectedContent?.contentId === item.id;

                                              return (
                                                <button
                                                  key={item.id}
                                                  onClick={() => openContent(chapter.id, item.id)}
                                                  className={`w-full p-3 pl-12 flex items-center gap-3 hover:bg-accent transition-colors ${
                                                    isActive ? "bg-teal-50 dark:bg-teal-950/30" : ""
                                                  }`}
                                                >
                                                  <Icon
                                                    className={`h-4 w-4 flex-shrink-0 ${
                                                      isActive ? "text-teal-600" : "text-muted-foreground"
                                                    }`}
                                                  />
                                                  <span
                                                    className={`text-sm flex-1 text-left line-clamp-1 ${
                                                      isActive
                                                        ? "font-semibold text-teal-600 dark:text-teal-400"
                                                        : "text-foreground"
                                                    }`}
                                                  >
                                                    {item.title}
                                                  </span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}

                                        {isExpanded && contentItems.length === 0 && (
                                          <div className="p-4 pl-12 text-sm text-muted-foreground text-center border-t border-border bg-muted/30">
                                            Aucun contenu disponible
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                  Ce module ne contient pas encore de chapitres
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {modules.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun module disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Viewer */}
          <div className="lg:col-span-2" id="content-viewer">
            {!currentContent ? (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full opacity-20 animate-pulse" />
                      <div className="absolute inset-4 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Bienvenue dans votre cours
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {course.description ||
                          "Sélectionnez un chapitre pour commencer votre apprentissage"}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                        <Trophy className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                        <div className="text-sm font-semibold text-teal-600">
                          {stats.total}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Chapitres
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <Target className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                        <div className="text-sm font-semibold text-emerald-600">
                          {stats.totalContentItems}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Contenus
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
                        <Clock className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                        <div className="text-sm font-semibold text-cyan-600">
                          {stats.percentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Complété
                        </div>
                      </div>
                    </div>
                    {allChapters.length > 0 && (
                      <Button
                        onClick={() => {
                          const firstChapter = allChapters[0];
                          if (firstChapter.contentItems.length > 0) {
                            openContent(
                              firstChapter.id,
                              firstChapter.contentItems[0].id
                            );
                          }
                        }}
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Commencer le cours
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Breadcrumb Navigation */}
                {currentContent.module && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                      href="/etudiant"
                      className="hover:text-foreground transition-colors"
                    >
                      Mes cours
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <button
                      onClick={() => setSelectedContent(null)}
                      className="hover:text-foreground transition-colors"
                    >
                      {course.title}
                    </button>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-teal-600 font-medium">
                      {currentContent.module.title}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">
                      {currentContent.chapter?.title}
                    </span>
                  </div>
                )}

                {/* Content Header */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex-shrink-0">
                        {(() => {
                          const Icon = getContentIcon(
                            currentContent.content.contentType
                          );
                          return <Icon className="h-6 w-6 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {currentContent.chapter?.title}
                          </Badge>
                          <Badge className="text-xs bg-teal-500 text-white">
                            {currentContent.content.contentType}
                          </Badge>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          {currentContent.content.title}
                        </h2>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Display */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    {(() => {
                      const contentData = currentContent.content.contentData;
                      const contentType =
                        contentData?.type ||
                        currentContent.content.contentType.toLowerCase();

                      // VIDEO CONTENT
                      if (contentType === "video") {
                        return (
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            {contentData?.url ? (
                              <iframe
                                src={contentData.url}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={currentContent.content.title}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/60">
                                <div className="text-center">
                                  <Video className="h-16 w-16 mx-auto mb-4" />
                                  <p>Vidéo non disponible</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // TEXT CONTENT
                      if (contentType === "text") {
                        return (
                          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-blockquote:border-teal-500">
                            {contentData?.content ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: contentData.content,
                                }}
                              />
                            ) : (
                              <p className="text-muted-foreground">
                                Contenu textuel non disponible
                              </p>
                            )}
                            {contentData?.attachments &&
                              contentData.attachments.length > 0 && (
                                <div className="mt-6 p-4 bg-muted rounded-lg">
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Pièces jointes
                                  </h4>
                                  <ul className="space-y-2">
                                    {contentData.attachments.map(
                                      (attachment: { name: string; url: string; type: string; size: number }, idx: number) => (
                                        <li key={idx}>
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-teal-600 hover:text-teal-700 underline"
                                          >
                                            {attachment.name ||
                                              `Fichier ${idx + 1}`}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        );
                      }

                      // QUIZ CONTENT
                      if (contentType === "quiz") {
                        const quizId = currentContent.content.id;
                        const attemptData = quizAttempts.find(
                          (a) => a.quizId === quizId
                        );
                        const maxAttempts = contentData?.attemptsAllowed || 3;
                        const totalAttempts = attemptData?.totalAttempts || 0;
                        const bestScore = attemptData?.bestScore || null;
                        const passed = attemptData?.passed || false;

                        return (
                          <div className="space-y-6">
                            <div className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 rounded-lg border border-teal-200 dark:border-teal-800">
                              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-teal-600" />
                                Quiz d&apos;entraînement
                              </h3>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                {contentData?.questions && (
                                  <span>
                                    {contentData.questions.length} question(s)
                                  </span>
                                )}
                                {contentData?.timeLimit && (
                                  <span>
                                    ⏱️ {Math.floor(contentData.timeLimit / 60)}{" "}
                                    min
                                  </span>
                                )}
                                {contentData?.passingScore && (
                                  <span>
                                    ✅ Score minimum: {contentData.passingScore}
                                    %
                                  </span>
                                )}
                                {totalAttempts > 0 && (
                                  <span>
                                    🔄 {totalAttempts}/{maxAttempts} tentatives
                                  </span>
                                )}
                                {bestScore !== null && (
                                  <span
                                    className={
                                      passed
                                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                        : "text-amber-600 dark:text-amber-400 font-semibold"
                                    }
                                  >
                                    🏆 Meilleur: {bestScore}%
                                  </span>
                                )}
                              </div>
                            </div>
                            {passed ? (
                              <Link href="/etudiant/jalons">
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                                  <Flag className="h-4 w-4 mr-2" />
                                  Voir mes jalons
                                </Button>
                              </Link>
                            ) : totalAttempts >= maxAttempts ? (
                              <Button
                                disabled
                                className="w-full bg-red-600 text-white opacity-75 cursor-not-allowed"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Échec ({bestScore}%)
                              </Button>
                            ) : totalAttempts > 0 ? (
                              <Link
                                href={`/etudiant/cours/${course.id}/quiz/${quizId}`}
                              >
                                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Réessayer ({bestScore}%)
                                </Button>
                              </Link>
                            ) : (
                              <Link
                                href={`/etudiant/cours/${course.id}/quiz/${quizId}`}
                              >
                                <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Commencer le quiz
                                </Button>
                              </Link>
                            )}
                          </div>
                        );
                      }

                      // TEST CONTENT
                      if (contentType === "test") {
                        const quizId = currentContent.content.id;
                        const attemptData = quizAttempts.find(
                          (a) => a.quizId === quizId
                        );
                        const maxAttempts = contentData?.attemptsAllowed || 3;
                        const totalAttempts = attemptData?.totalAttempts || 0;
                        const bestScore = attemptData?.bestScore || null;
                        const passed = attemptData?.passed || false;

                        return (
                          <div className="space-y-6">
                            <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg border border-orange-200 dark:border-orange-800">
                              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-orange-600" />
                                Test d&apos;évaluation
                              </h3>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {contentData?.questions && (
                                  <span>
                                    {contentData.questions.length} question(s)
                                  </span>
                                )}
                                {contentData?.timeLimit && (
                                  <span>
                                    ⏱️ {Math.floor(contentData.timeLimit / 60)}{" "}
                                    min
                                  </span>
                                )}
                                {contentData?.passingScore && (
                                  <span>
                                    ✅ Score minimum: {contentData.passingScore}
                                    %
                                  </span>
                                )}
                                {totalAttempts > 0 && (
                                  <span>
                                    🔄 {totalAttempts}/{maxAttempts} tentatives
                                  </span>
                                )}
                                {bestScore !== null && (
                                  <span
                                    className={
                                      passed
                                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                        : "text-amber-600 dark:text-amber-400 font-semibold"
                                    }
                                  >
                                    🏆 Meilleur: {bestScore}%
                                  </span>
                                )}
                              </div>
                            </div>
                            {passed ? (
                              <Link href="/etudiant/jalons">
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                                  <Flag className="h-4 w-4 mr-2" />
                                  Voir mes jalons
                                </Button>
                              </Link>
                            ) : totalAttempts >= maxAttempts ? (
                              <Button
                                disabled
                                className="w-full bg-red-600 text-white opacity-75 cursor-not-allowed"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Échec ({bestScore}%)
                              </Button>
                            ) : totalAttempts > 0 ? (
                              <Link
                                href={`/etudiant/cours/${course.id}/quiz/${quizId}`}
                              >
                                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Réessayer ({bestScore}%)
                                </Button>
                              </Link>
                            ) : (
                              <Link
                                href={`/etudiant/cours/${course.id}/quiz/${quizId}`}
                              >
                                <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white">
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Commencer le test
                                </Button>
                              </Link>
                            )}
                          </div>
                        );
                      }

                      // EXAM CONTENT
                      if (contentType === "exam") {
                        const quizId = currentContent.content.id;
                        const attemptData = quizAttempts.find(
                          (a) => a.quizId === quizId
                        );
                        const maxAttempts = contentData?.attemptsAllowed || 3;
                        const totalAttempts = attemptData?.totalAttempts || 0;
                        const bestScore = attemptData?.bestScore || null;
                        const passed = attemptData?.passed || false;

                        return (
                          <div className="space-y-6">
                            <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 rounded-lg border-2 border-red-300 dark:border-red-800">
                              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                Examen final
                              </h3>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                {contentData?.questions && (
                                  <span>
                                    {contentData.questions.length} question(s)
                                  </span>
                                )}
                                {contentData?.timeLimit && (
                                  <span>
                                    ⏱️ {Math.floor(contentData.timeLimit / 60)}{" "}
                                    min
                                  </span>
                                )}
                                {contentData?.passingScore && (
                                  <span>
                                    ✅ Score minimum: {contentData.passingScore}
                                    %
                                  </span>
                                )}
                                {totalAttempts > 0 && (
                                  <span>
                                    🔄 {totalAttempts}/{maxAttempts} tentatives
                                  </span>
                                )}
                                {bestScore !== null && (
                                  <span
                                    className={
                                      passed
                                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                        : "text-amber-600 dark:text-amber-400 font-semibold"
                                    }
                                  >
                                    🏆 Meilleur: {bestScore}%
                                  </span>
                                )}
                              </div>
                              {contentData?.proctored && (
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                    ⚠️ Cet examen est surveillé. Assurez-vous
                                    d&apos;être dans un environnement calme.
                                  </p>
                                </div>
                              )}
                            </div>
                            {passed ? (
                              <Link href="/etudiant/jalons">
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                                  <Flag className="h-4 w-4 mr-2" />
                                  Voir mes jalons
                                </Button>
                              </Link>
                            ) : totalAttempts >= maxAttempts ? (
                              <Button
                                disabled
                                className="w-full bg-red-600 text-white opacity-75 cursor-not-allowed"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Échec ({bestScore}%)
                              </Button>
                            ) : totalAttempts > 0 ? (
                              <Link
                                href={`/etudiant/cours/${course.id}/quiz/${quizId}`}
                              >
                                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Réessayer ({bestScore}%)
                                </Button>
                              </Link>
                            ) : (
                              <Link
                                href={`/etudiant/cours/${course.id}/quiz/${quizId}`}
                              >
                                <Button className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white">
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Commencer l&apos;examen
                                </Button>
                              </Link>
                            )}
                          </div>
                        );
                      }

                      // FALLBACK - Unknown or missing content
                      return (
                        <div className="p-8 text-center">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-xl font-bold mb-2">
                            Contenu non disponible
                          </h3>
                          <p className="text-muted-foreground">
                            Type: {contentType}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Find previous content
                      const currentChapter = currentContent.chapter;
                      const currentIndex =
                        currentChapter?.contentItems.findIndex(
                          (item) => item.id === currentContent.content.id
                        ) ?? -1;

                      if (currentIndex > 0 && currentChapter) {
                        const prevContent =
                          currentChapter.contentItems[currentIndex - 1];
                        openContent(currentChapter.id, prevContent.id);
                      } else {
                        // Go to previous chapter
                        const chapterIndex = allChapters.findIndex(
                          (ch) => ch.id === currentChapter?.id
                        );
                        if (chapterIndex > 0) {
                          const prevChapter = allChapters[chapterIndex - 1];
                          if (prevChapter.contentItems.length > 0) {
                            const lastContent =
                              prevChapter.contentItems[
                                prevChapter.contentItems.length - 1
                              ];
                            openContent(prevChapter.id, lastContent.id);
                          }
                        }
                      }
                    }}
                    disabled={
                      !currentContent.chapter ||
                      (allChapters.findIndex(
                        (ch) => ch.id === currentContent.chapter?.id
                      ) === 0 &&
                        currentContent.chapter.contentItems.findIndex(
                          (item) => item.id === currentContent.content.id
                        ) === 0)
                    }
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                    onClick={() => {
                      // Find next content
                      const currentChapter = currentContent.chapter;
                      const currentIndex =
                        currentChapter?.contentItems.findIndex(
                          (item) => item.id === currentContent.content.id
                        ) ?? -1;

                      if (
                        currentIndex <
                          (currentChapter?.contentItems.length ?? 0) - 1 &&
                        currentChapter
                      ) {
                        const nextContent =
                          currentChapter.contentItems[currentIndex + 1];
                        openContent(currentChapter.id, nextContent.id);
                      } else {
                        // Go to next chapter
                        const chapterIndex = allChapters.findIndex(
                          (ch) => ch.id === currentChapter?.id
                        );
                        if (chapterIndex < allChapters.length - 1) {
                          const nextChapter = allChapters[chapterIndex + 1];
                          if (nextChapter.contentItems.length > 0) {
                            const firstContent = nextChapter.contentItems[0];
                            openContent(nextChapter.id, firstContent.id);
                          }
                        }
                      }
                    }}
                    disabled={
                      !currentContent.chapter ||
                      (allChapters.findIndex(
                        (ch) => ch.id === currentContent.chapter?.id
                      ) ===
                        allChapters.length - 1 &&
                        currentContent.chapter.contentItems.findIndex(
                          (item) => item.id === currentContent.content.id
                        ) ===
                          (currentContent.chapter.contentItems.length ?? 0) - 1)
                    }
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
