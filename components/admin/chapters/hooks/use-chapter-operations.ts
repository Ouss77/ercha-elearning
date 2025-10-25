"use client";

import { useState, useCallback, useRef } from "react";
import type { ChapterWithContent, ContentItem } from "@/types/chapter";
import type { ChapterEditorData, DeleteTarget } from "../types";
import {
  fetchWithErrorHandling,
  handleApiError,
  showSuccessToast,
  showErrorToast,
} from "@/lib/utils/chapter-error-handler";

export function useChapterOperations(courseId: number, moduleId?: number) {
  const [chapters, setChapters] = useState<ChapterWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReorderingChapters, setIsReorderingChapters] = useState(false);
  const [isReorderingContent, setIsReorderingContent] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  
  const isSavingRef = useRef(false);

  const fetchChapters = useCallback(async () => {
    try {
      const endpoint = moduleId 
        ? `/api/modules/${moduleId}/chapters`
        : `/api/courses/${courseId}/chapters`;
      
      const response = await fetchWithErrorHandling(
        endpoint,
        { method: "GET" },
        "Fetch chapters"
      );
      
      // Handle different response formats
      const data = await response.json();
      const updatedChapters = Array.isArray(data) ? data : data.chapters;
      setChapters(updatedChapters);
      return updatedChapters;
    } catch (error: any) {
      const chapterError = handleApiError(error, "Chargement des chapitres");
      setError(chapterError.message);
      throw chapterError;
    }
  }, [courseId, moduleId]);

  const createChapter = useCallback(
    async (data: ChapterEditorData) => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = moduleId 
          ? `/api/modules/${moduleId}/chapters`
          : `/api/courses/${courseId}/chapters`;
        
        const response = await fetchWithErrorHandling(
          endpoint,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.title,
              description: data.description,
            }),
          },
          "Create chapter"
        );

        const responseData = await response.json();
        const chapter = responseData.chapter || responseData;

        if (data.contentType && data.contentData) {
          await fetchWithErrorHandling(
            `/api/chapters/${chapter.id}/content`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: data.title,
                contentType: data.contentType,
                contentData: data.contentData,
              }),
            },
            "Create content item"
          );
        }

        await fetchChapters();
        showSuccessToast("Chapitre créé avec succès");
      } catch (error: any) {
        const chapterError = handleApiError(error, "Création du chapitre");
        setError(chapterError.message);
        throw chapterError;
      } finally {
        setIsLoading(false);
      }
    },
    [courseId, moduleId, fetchChapters]
  );

  const updateChapter = useCallback(
    async (chapterId: number, data: ChapterEditorData) => {
      if (isSavingRef.current) {
        console.log("[updateChapter] Save already in progress, skipping");
        return;
      }

      isSavingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        await fetchWithErrorHandling(
          `/api/chapters/${chapterId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.title,
              description: data.description,
            }),
          },
          "Update chapter"
        );

        if (data.contentType && data.contentData) {
          const freshChapters = await fetchChapters();
          const freshChapter = freshChapters.find(
            (ch: ChapterWithContent) => ch.id === chapterId
          );

          const existingContent = freshChapter?.contentItems?.find(
            (item: ContentItem) => item.contentType === data.contentType
          );

          if (existingContent) {
            await fetchWithErrorHandling(
              `/api/content/${existingContent.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: data.title,
                  contentData: data.contentData,
                }),
              },
              "Update content item"
            );
          } else {
            await fetchWithErrorHandling(
              `/api/chapters/${chapterId}/content`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: data.title,
                  contentType: data.contentType,
                  contentData: data.contentData,
                }),
              },
              "Create content item"
            );
          }
        }

        await fetchChapters();
        showSuccessToast("Chapitre modifié avec succès");
      } catch (error: any) {
        const chapterError = handleApiError(error, "Modification du chapitre");
        setError(chapterError.message);
        throw chapterError;
      } finally {
        setIsLoading(false);
        isSavingRef.current = false;
      }
    },
    [fetchChapters]
  );

  const deleteChapter = useCallback(
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

      await fetchChapters();
      showSuccessToast("Chapitre supprimé avec succès");
      return true;
    } catch (error: any) {
      const chapterError = handleApiError(error, "Suppression du chapitre");
      setError(chapterError.message);
      return false;
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, fetchChapters]);

  const reorderChapters = useCallback(
    async (chapterIds: number[]) => {
      const originalChapters = [...chapters];
      const reorderedChapters = chapterIds
        .map((id) => chapters.find((ch) => ch.id === id))
        .filter((ch): ch is ChapterWithContent => ch !== undefined);

      setChapters(reorderedChapters);
      setIsReorderingChapters(true);

      try {
        const endpoint = moduleId 
          ? `/api/modules/${moduleId}/chapters/reorder`
          : `/api/chapters/reorder`;
        
        const body = moduleId
          ? { chapterIds }
          : { courseId, chapterIds };
        
        await fetchWithErrorHandling(
          endpoint,
          {
            method: moduleId ? "POST" : "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
          "Reorder chapters"
        );

        showSuccessToast("Ordre des chapitres mis à jour");
      } catch (error: any) {
        setChapters(originalChapters);
        const chapterError = handleApiError(error, "Réorganisation des chapitres");
        setError(chapterError.message);
        showErrorToast("Échec de la réorganisation des chapitres");
      } finally {
        setIsReorderingChapters(false);
      }
    },
    [chapters, courseId, moduleId]
  );

  return {
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
  };
}
