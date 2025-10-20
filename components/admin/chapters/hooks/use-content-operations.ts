"use client";

import { useCallback } from "react";
import type { ChapterWithContent, ContentItem } from "@/types/chapter";
import type { DeleteTarget } from "../types";
import {
  fetchWithErrorHandling,
  handleApiError,
  showSuccessToast,
  showErrorToast,
} from "@/lib/utils/chapter-error-handler";

export function useContentOperations(
  chapters: ChapterWithContent[],
  setChapters: (chapters: ChapterWithContent[]) => void,
  setIsReorderingContent: (chapterId: number | null) => void,
  setDeleteTarget: (target: DeleteTarget | null) => void,
  setError: (error: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  courseId: number
) {
  const reorderContent = useCallback(
    async (chapterId: number, contentItemIds: number[]) => {
      const originalChapters = [...chapters];

      setChapters(
        chapters.map((ch) => {
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
        setChapters(originalChapters);
        const chapterError = handleApiError(error, "Réorganisation du contenu");
        setError(chapterError.message);
        showErrorToast("Échec de la réorganisation du contenu");
      } finally {
        setIsReorderingContent(null);
      }
    },
    [chapters, setChapters, setIsReorderingContent, setError]
  );

  const deleteContent = useCallback(
    async (contentItemId: number) => {
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
    [chapters, setDeleteTarget]
  );

  const confirmDeleteContent = useCallback(
    async (deleteTarget: DeleteTarget | null) => {
      if (!deleteTarget || deleteTarget.type !== "content") return false;

      setIsLoading(true);
      setError(null);

      try {
        await fetchWithErrorHandling(
          `/api/content/${deleteTarget.id}`,
          { method: "DELETE" },
          "Delete content item"
        );

        setChapters(
          chapters.map((ch) => ({
            ...ch,
            contentItems: ch.contentItems.filter(
              (item) => item.id !== deleteTarget.id
            ),
          }))
        );

        showSuccessToast("Contenu supprimé avec succès");
        return true;
      } catch (error: any) {
        const chapterError = handleApiError(error, "Suppression du contenu");
        setError(chapterError.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [chapters, setChapters, setError, setIsLoading]
  );

  return {
    reorderContent,
    deleteContent,
    confirmDeleteContent,
  };
}
