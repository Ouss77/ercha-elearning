"use client";

import { useState, useCallback, useEffect } from "react";
import { ChapterList } from "./chapter-list";
import { ChapterEditor } from "./chapter-editor";
import { ChapterPreview } from "./chapter-preview";
import { ChapterErrorBoundary } from "./chapter-error-boundary";
import { Button } from "@/components/ui/button";
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
import { Plus, AlertCircle, Loader2, Home } from "lucide-react";
import type { ChapterWithContent, ContentItem } from "@/types/chapter";
import type { Role } from "@/lib/schemas/user";
import {
  fetchWithErrorHandling,
  handleApiError,
  showSuccessToast,
  showErrorToast,
  ChapterError,
  ChapterErrorType,
} from "@/lib/utils/chapter-error-handler";

interface ChapterManagementPageProps {
  courseId: number;
  courseTitle: string;
  initialChapters: ChapterWithContent[];
  userRole: Role;
  userId: number;
}

type ViewMode = "list" | "create" | "edit" | "preview";

export function ChapterManagementPage({
  courseId,
  courseTitle,
  initialChapters,
  userRole,
  userId,
}: ChapterManagementPageProps) {
  const [chapters, setChapters] =
    useState<ChapterWithContent[]>(initialChapters);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedChapter, setSelectedChapter] =
    useState<ChapterWithContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading states for specific operations
  const [isReorderingChapters, setIsReorderingChapters] = useState(false);
  const [isReorderingContent, setIsReorderingContent] = useState<number | null>(
    null
  );

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "chapter" | "content";
    id: number;
    title: string;
  } | null>(null);

  // Sync chapters when initialChapters changes (but not after client-side updates)
  // This ensures server-rendered data is used on initial load
  const [hasClientUpdate, setHasClientUpdate] = useState(false);

  useEffect(() => {
    // Only sync from server if we haven't made client-side updates
    if (!hasClientUpdate) {
      setChapters(initialChapters);
    }
  }, [initialChapters, hasClientUpdate]);

  // ============================================================================
  // Chapter Operations
  // ============================================================================

  const handleCreateChapter = useCallback(
    async (data: { title: string; description: string | null }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchWithErrorHandling(
          `/api/courses/${courseId}/chapters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          },
          "Create chapter"
        );

        const { chapter } = await response.json();

        // Mark that we've made a client-side update
        setHasClientUpdate(true);

        // Fetch updated chapters list from the server to ensure we have the latest data
        const chaptersResponse = await fetchWithErrorHandling(
          `/api/courses/${courseId}/chapters`,
          {
            method: "GET",
          },
          "Fetch chapters"
        );

        const { chapters: updatedChapters } = await chaptersResponse.json();
        console.log(
          "Fetched updated chapters after create:",
          updatedChapters.length
        );
        setChapters(updatedChapters);
        setViewMode("list");
        showSuccessToast("Chapitre créé avec succès");
      } catch (error: any) {
        const chapterError = handleApiError(error, "Création du chapitre");
        setError(chapterError.message);
        throw chapterError;
      } finally {
        setIsLoading(false);
      }
    },
    [courseId]
  );

  const handleUpdateChapter = useCallback(
    async (data: { title: string; description: string | null }) => {
      if (!selectedChapter) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchWithErrorHandling(
          `/api/chapters/${selectedChapter.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          },
          "Update chapter"
        );

        const { chapter } = await response.json();

        // Update chapter in the list
        setChapters((prev) =>
          prev.map((ch) => (ch.id === chapter.id ? { ...ch, ...chapter } : ch))
        );

        setSelectedChapter((prev) => (prev ? { ...prev, ...chapter } : null));
        showSuccessToast("Chapitre modifié avec succès");
      } catch (error: any) {
        const chapterError = handleApiError(error, "Modification du chapitre");
        setError(chapterError.message);
        throw chapterError;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedChapter]
  );

  const handleDeleteChapter = useCallback(
    async (chapterId: number) => {
      const chapter = chapters.find((ch) => ch.id === chapterId);
      if (!chapter) return;

      setDeleteTarget({
        type: "chapter",
        id: chapterId,
        title: chapter.title,
      });
    },
    [chapters]
  );

  const confirmDeleteChapter = useCallback(async () => {
    if (!deleteTarget || deleteTarget.type !== "chapter") return;

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithErrorHandling(
        `/api/chapters/${deleteTarget.id}`,
        { method: "DELETE" },
        "Delete chapter"
      );

      // Mark that we've made a client-side update
      setHasClientUpdate(true);

      // Fetch updated chapters list from the server
      const chaptersResponse = await fetchWithErrorHandling(
        `/api/courses/${courseId}/chapters`,
        {
          method: "GET",
        },
        "Fetch chapters"
      );

      const { chapters: updatedChapters } = await chaptersResponse.json();
      setChapters(updatedChapters);

      // If we're editing/previewing the deleted chapter, go back to list
      if (selectedChapter?.id === deleteTarget.id) {
        setSelectedChapter(null);
        setViewMode("list");
      }

      showSuccessToast("Chapitre supprimé avec succès");
    } catch (error: any) {
      const chapterError = handleApiError(error, "Suppression du chapitre");
      setError(chapterError.message);
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, selectedChapter, courseId]);

  const handleReorderChapters = useCallback(
    async (chapterIds: number[]) => {
      // Store original order for rollback
      const originalChapters = [...chapters];

      // Optimistic update - immediately update UI
      const reorderedChapters = chapterIds
        .map((id) => chapters.find((ch) => ch.id === id))
        .filter((ch): ch is ChapterWithContent => ch !== undefined);

      setChapters(reorderedChapters);
      setIsReorderingChapters(true);

      try {
        await fetchWithErrorHandling(
          `/api/chapters/reorder`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId, chapterIds }),
          },
          "Reorder chapters"
        );

        showSuccessToast("Ordre des chapitres mis à jour");
      } catch (error: any) {
        // Rollback mechanism - revert to original order
        setChapters(originalChapters);
        const chapterError = handleApiError(
          error,
          "Réorganisation des chapitres"
        );
        setError(chapterError.message);
        showErrorToast("Échec de la réorganisation des chapitres");
      } finally {
        setIsReorderingChapters(false);
      }
    },
    [chapters, courseId]
  );

  // ============================================================================
  // Content Item Operations
  // ============================================================================

  const handleReorderContent = useCallback(
    async (chapterId: number, contentItemIds: number[]) => {
      // Store original state for rollback
      const originalChapters = [...chapters];

      // Optimistic update - immediately update UI
      setChapters((prev) =>
        prev.map((ch) => {
          if (ch.id !== chapterId) return ch;

          const reorderedItems = contentItemIds
            .map((id) => ch.contentItems.find((item) => item.id === id))
            .filter((item): item is ContentItem => item !== undefined);

          return { ...ch, contentItems: reorderedItems };
        })
      );

      setIsReorderingContent(chapterId);

      try {
        await fetchWithErrorHandling(
          `/api/content/reorder`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chapterId, contentItemIds }),
          },
          "Reorder content items"
        );

        showSuccessToast("Ordre du contenu mis à jour");
      } catch (error: any) {
        // Rollback mechanism - revert to original state
        setChapters(originalChapters);
        const chapterError = handleApiError(error, "Réorganisation du contenu");
        setError(chapterError.message);
        showErrorToast("Échec de la réorganisation du contenu");
      } finally {
        setIsReorderingContent(null);
      }
    },
    [chapters]
  );

  const handleEditContent = useCallback(
    (contentItemId: number) => {
      // Find the chapter containing this content item
      const chapter = chapters.find((ch) =>
        ch.contentItems.some((item) => item.id === contentItemId)
      );

      if (chapter) {
        setSelectedChapter(chapter);
        setViewMode("edit");
        // Scroll to content editor section
        setTimeout(() => {
          const contentSection = document.getElementById(
            "content-editor-section"
          );
          contentSection?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    },
    [chapters]
  );

  const handleDeleteContent = useCallback(
    async (contentItemId: number) => {
      // Find the content item to get its title
      const chapter = chapters.find((ch) =>
        ch.contentItems.some((item) => item.id === contentItemId)
      );
      const contentItem = chapter?.contentItems.find(
        (item) => item.id === contentItemId
      );

      if (!contentItem) return;

      setDeleteTarget({
        type: "content",
        id: contentItemId,
        title: contentItem.title,
      });
    },
    [chapters]
  );

  const confirmDeleteContent = useCallback(async () => {
    if (!deleteTarget || deleteTarget.type !== "content") return;

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithErrorHandling(
        `/api/content/${deleteTarget.id}`,
        { method: "DELETE" },
        "Delete content item"
      );

      // Remove content item from the chapter
      setChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          contentItems: ch.contentItems.filter(
            (item) => item.id !== deleteTarget.id
          ),
        }))
      );

      showSuccessToast("Contenu supprimé avec succès");
    } catch (error: any) {
      const chapterError = handleApiError(error, "Suppression du contenu");
      setError(chapterError.message);
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  // ============================================================================
  // View Mode Handlers
  // ============================================================================

  const handleChapterEdit = useCallback((chapter: ChapterWithContent) => {
    setSelectedChapter(chapter);
    setViewMode("edit");
  }, []);

  const handleChapterPreview = useCallback((chapter: ChapterWithContent) => {
    setSelectedChapter(chapter);
    setViewMode("preview");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setSelectedChapter(null);
    setViewMode("list");
  }, []);

  const handleClosePreview = useCallback(() => {
    setSelectedChapter(null);
    setViewMode("list");
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  // Preview mode takes over the entire screen
  if (viewMode === "preview" && selectedChapter) {
    return (
      <ChapterErrorBoundary>
        <ChapterPreview
          chapter={selectedChapter}
          onClose={handleClosePreview}
        />
      </ChapterErrorBoundary>
    );
  }

  return (
    <ChapterErrorBoundary>
      <div className="container mx-auto py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/cours">Cours</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{courseTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Chapitres</h1>
            <p className="text-muted-foreground mt-1">
              Organisez et gérez le contenu de votre cours
            </p>
          </div>
          {viewMode === "list" && (
            <Button onClick={() => setViewMode("create")} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Chapitre
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chapter List - Always visible */}
          <div
            className={viewMode === "list" ? "lg:col-span-3" : "lg:col-span-1"}
          >
            <Card>
              <CardHeader>
                <CardTitle>Chapitres du Cours</CardTitle>
                <CardDescription>
                  {chapters.length} chapitre{chapters.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && viewMode === "list" ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ChapterList
                    chapters={chapters}
                    onReorder={handleReorderChapters}
                    onChapterEdit={handleChapterEdit}
                    onChapterDelete={handleDeleteChapter}
                    onChapterPreview={handleChapterPreview}
                    onContentReorder={handleReorderContent}
                    onContentEdit={handleEditContent}
                    onContentDelete={handleDeleteContent}
                    isReordering={isReorderingChapters}
                    reorderingContentChapterId={isReorderingContent}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Editor Panel - Shown when creating or editing */}
          {(viewMode === "create" || viewMode === "edit") && (
            <div className="lg:col-span-2">
              <ChapterEditor
                chapter={
                  viewMode === "edit" ? selectedChapter || undefined : undefined
                }
                courseId={courseId}
                mode={viewMode}
                onSave={
                  viewMode === "create"
                    ? handleCreateChapter
                    : handleUpdateChapter
                }
                onCancel={handleCancelEdit}
                autoSave={viewMode === "edit"}
                autoSaveDelay={2000}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          onConfirm={
            deleteTarget?.type === "chapter"
              ? confirmDeleteChapter
              : confirmDeleteContent
          }
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
