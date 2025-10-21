"use client";

import { useState, useCallback } from "react";
import type { ChapterWithContent } from "@/types/chapter";
import type { ViewMode } from "../types";
import { fetchWithErrorHandling } from "@/lib/utils/chapter-error-handler";

export function useViewMode(
  courseId: number,
  setChapters: (chapters: ChapterWithContent[]) => void
) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedChapter, setSelectedChapter] = useState<ChapterWithContent | null>(null);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);

  const handleChapterEdit = useCallback(
    async (chapter: ChapterWithContent, contentId?: number) => {
      try {
        // Fetch fresh chapter data
        const response = await fetchWithErrorHandling(
          `/api/courses/${courseId}/chapters`,
          { method: "GET" },
          "Fetch chapter data"
        );
        const { chapters: freshChapters } = await response.json();
        const freshChapter = freshChapters.find(
          (ch: ChapterWithContent) => ch.id === chapter.id
        );

        if (freshChapter) {
          setChapters(freshChapters);
          setSelectedChapter(freshChapter);
          setEditingContentId(contentId || null);
          setViewMode("edit");
        }
      } catch (error) {
        console.error("Failed to fetch chapter data:", error);
        setSelectedChapter(chapter);
        setEditingContentId(contentId || null);
        setViewMode("edit");
      }
    },
    [courseId, setChapters]
  );

  const handleChapterPreview = useCallback((chapter: ChapterWithContent) => {
    setSelectedChapter(chapter);
    setViewMode("preview");
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedChapter(null);
    setEditingContentId(null);
    setViewMode("create");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setSelectedChapter(null);
    setEditingContentId(null);
    setViewMode("list");
  }, []);

  const handleEditContent = useCallback(
    async (contentItemId: number, chapters: ChapterWithContent[]) => {
      const chapter = chapters.find((ch) =>
        ch.contentItems.some((item) => item.id === contentItemId)
      );

      if (chapter) {
        await handleChapterEdit(chapter, contentItemId);
        
        // Scroll to content editor section
        setTimeout(() => {
          const contentSection = document.getElementById("content-editor-section");
          contentSection?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    },
    [handleChapterEdit]
  );

  const handleAddContent = useCallback(
    async (chapterId: number, chapters: ChapterWithContent[]) => {
      const chapter = chapters.find((ch) => ch.id === chapterId);
      if (!chapter) return;

      try {
        const response = await fetchWithErrorHandling(
          `/api/courses/${courseId}/chapters`,
          { method: "GET" },
          "Fetch chapter data"
        );
        const { chapters: freshChapters } = await response.json();
        const freshChapter = freshChapters.find(
          (ch: ChapterWithContent) => ch.id === chapterId
        );

        if (freshChapter) {
          setChapters(freshChapters);
          setSelectedChapter(freshChapter);
          setEditingContentId(-1); // Special value to indicate "add new"
          setViewMode("edit");
          
          setTimeout(() => {
            const contentSection = document.getElementById("content-editor-section");
            contentSection?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } catch (error) {
        console.error("Failed to fetch chapter data:", error);
        setSelectedChapter(chapter);
        setEditingContentId(-1);
        setViewMode("edit");
      }
    },
    [courseId, setChapters]
  );

  return {
    viewMode,
    setViewMode,
    selectedChapter,
    setSelectedChapter,
    editingContentId,
    setEditingContentId,
    handleChapterEdit,
    handleChapterPreview,
    handleCreateNew,
    handleCancelEdit,
    handleEditContent,
    handleAddContent,
  };
}
