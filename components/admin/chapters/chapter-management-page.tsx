"use client";

import { useEffect } from "react";
import { ChapterList } from "./chapter-list";
import { ChapterEditorImproved } from "./chapter-editor-improved";
import { ChapterPreview } from "./chapter-preview";
import { ChapterErrorBoundary } from "./chapter-error-boundary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Plus, AlertCircle, Loader2, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ChapterManagementPageProps } from "./types";
import { useChapterOperations } from "./hooks/use-chapter-operations";
import { useViewMode } from "./hooks/use-view-mode";
import { useContentOperations } from "./hooks/use-content-operations";

export function ChapterManagementPage({
  courseId,
  courseTitle,
  courseSlug,
  initialChapters,
  userRole,
  userId,
}: ChapterManagementPageProps) {
  const {
    chapters,
    setChapters,
    isLoading,
    error,
    setError,
    isReorderingChapters,
    isReorderingContent,
    setIsReorderingContent,
    deleteTarget,
    setDeleteTarget,
    fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    confirmDeleteChapter,
    reorderChapters,
  } = useChapterOperations(courseId);

  const {
    viewMode,
    setViewMode,
    selectedChapter,
    setSelectedChapter,
    editingContentId,
    handleChapterEdit,
    handleChapterPreview,
    handleCreateNew,
    handleCancelEdit,
    handleEditContent,
    handleAddContent,
  } = useViewMode(courseId, setChapters);

  const { reorderContent, deleteContent, confirmDeleteContent } =
    useContentOperations(
      chapters,
      setChapters,
      setIsReorderingContent,
      setDeleteTarget,
      setError,
      (loading: boolean) => {}, // setIsLoading - handled by individual operations
      courseId
    );

  useEffect(() => {
    setChapters(initialChapters);
  }, [initialChapters, setChapters]);

  const handleSave = async (data: any) => {
    if (viewMode === "create") {
      await createChapter(data);
      setViewMode("list");
    } else if (viewMode === "edit" && selectedChapter) {
      await updateChapter(selectedChapter.id, data);
      const updatedChapters = await fetchChapters();
      const updatedChapter = updatedChapters.find(
        (ch: any) => ch.id === selectedChapter.id
      );
      if (updatedChapter) {
        setSelectedChapter(updatedChapter);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget?.type === "chapter") {
      const success = await confirmDeleteChapter();
      if (success && selectedChapter?.id === deleteTarget.id) {
        setSelectedChapter(null);
        setViewMode("list");
      }
    } else {
      await confirmDeleteContent(deleteTarget);
    }
  };

  if (viewMode === "preview" && selectedChapter) {
    return (
      <ChapterErrorBoundary>
        <ChapterPreview chapter={selectedChapter} onClose={handleCancelEdit} />
      </ChapterErrorBoundary>
    );
  }

  return (
    <ChapterErrorBoundary>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">
                  <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/cours" className="text-xs sm:text-sm">
                  Cours
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href={`/admin/cours/${courseId}`} className="text-xs sm:text-sm max-w-[150px] truncate">
                  {courseSlug || courseTitle}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs sm:text-sm">Chapitres</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button variant="outline" size="sm" asChild className="gap-2 w-full sm:w-auto">
            <Link href={`/admin/cours/${courseId}`}>
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Retour au cours</span>
              <span className="sm:hidden">Retour</span>
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 sm:p-6 rounded-lg border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 flex-shrink-0"
              >
                <Link href={`/admin/cours/${courseId}`}>
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
                  Gestion des Chapitres
                </h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm truncate">
                  {courseTitle}
                </p>
              </div>
            </div>
            {viewMode === "list" && (
              <Button
                onClick={handleCreateNew}
                disabled={isLoading}
                size="default"
                className="shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden xs:inline">Nouveau Chapitre</span>
                <span className="xs:hidden">Nouveau</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div
            className={viewMode === "list" ? "xl:col-span-3" : "xl:col-span-1"}
          >
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">
                      Chapitres du Cours
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">
                      {chapters.length} chapitre
                      {chapters.length !== 1 ? "s" : ""} • Glissez pour
                      réorganiser
                    </CardDescription>
                  </div>
                  {chapters.length > 0 && (
                    <Badge variant="outline" className="text-xs sm:text-sm w-fit">
                      {chapters.reduce(
                        (acc, ch) => acc + ch.contentItems.length,
                        0
                      )}{" "}
                      contenus au total
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading && viewMode === "list" ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ChapterList
                    chapters={chapters}
                    onReorder={reorderChapters}
                    onChapterEdit={(ch) => handleChapterEdit(ch)}
                    onChapterDelete={deleteChapter}
                    onChapterPreview={handleChapterPreview}
                    onContentReorder={reorderContent}
                    onContentEdit={(id) => handleEditContent(id, chapters)}
                    onContentDelete={deleteContent}
                    onContentAdd={(id) => handleAddContent(id, chapters)}
                    isReordering={isReorderingChapters}
                    reorderingContentChapterId={isReorderingContent}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {(viewMode === "create" || viewMode === "edit") && (
            <div className="xl:col-span-2">
              <ChapterEditorImproved
                chapter={
                  viewMode === "edit" ? selectedChapter || undefined : undefined
                }
                courseId={courseId}
                mode={viewMode}
                editingContentId={editingContentId}
                onSave={handleSave}
                onCancel={handleCancelEdit}
              />
            </div>
          )}
        </div>

        <DeleteConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title={
            deleteTarget?.type === "chapter"
              ? "Supprimer le chapitre"
              : "Supprimer le contenu"
          }
          description={
            deleteTarget?.type === "chapter"
              ? `Êtes-vous sûr de vouloir supprimer le chapitre "${deleteTarget?.title}" ? Tous les éléments de contenu associés seront également supprimés. Cette action est irréversible.`
              : `Êtes-vous sûr de vouloir supprimer "${deleteTarget?.title}" ? Cette action est irréversible.`
          }
        />
      </div>
    </ChapterErrorBoundary>
  );
}
