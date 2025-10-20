"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChapterForm } from "./chapter-form";
import { ContentTypeSelector } from "./content-type-selector";
import { TextEditor } from "./editors/text-editor";
import { VideoEditor } from "./editors/video-editor";
import { QuizEditor } from "./editors/quiz-editor";
import { TestEditor } from "./editors/test-editor";
import { ExamEditor } from "./editors/exam-editor";
import { Separator } from "@/components/ui/separator";
import type {
  Chapter,
  ChapterWithContent,
  ContentType,
  ContentData,
} from "@/types/chapter";
import { showWarningToast } from "@/lib/utils/chapter-error-handler";

interface ChapterEditorProps {
  chapter?: Chapter | ChapterWithContent;
  courseId: number;
  mode: "create" | "edit";
  onSave: (data: ChapterEditorData) => Promise<void>;
  onCancel: () => void;
}

export interface ChapterEditorData {
  title: string;
  description: string | null;
  contentType?: ContentType;
  contentData?: ContentData;
}

export function ChapterEditor({
  chapter,
  courseId,
  mode,
  onSave,
  onCancel,
}: ChapterEditorProps) {
  const [chapterData, setChapterData] = useState<{
    title: string;
    description: string | null;
  }>({
    title: chapter?.title || "",
    description: chapter?.description || null,
  });

  const [contentType, setContentType] = useState<ContentType>(() => {
    // Initialize content type from chapter's first content item if available
    if (
      chapter &&
      "contentItems" in chapter &&
      Array.isArray(chapter.contentItems) &&
      chapter.contentItems.length > 0
    ) {
      return chapter.contentItems[0].contentType;
    }
    return "text";
  });
  const [contentData, setContentData] = useState<ContentData | null>(() => {
    // Initialize content data from chapter's first content item if available
    if (
      chapter &&
      "contentItems" in chapter &&
      Array.isArray(chapter.contentItems) &&
      chapter.contentItems.length > 0
    ) {
      return chapter.contentItems[0].contentData;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showContentTypeChangeDialog, setShowContentTypeChangeDialog] =
    useState(false);
  const [pendingContentType, setPendingContentType] =
    useState<ContentType | null>(null);

  // Update state when chapter prop changes (e.g., after refresh)
  useEffect(() => {
    if (chapter) {
      setChapterData({
        title: chapter.title || "",
        description: chapter.description || null,
      });

      // Load content from first content item if available
      if (
        "contentItems" in chapter &&
        Array.isArray(chapter.contentItems) &&
        chapter.contentItems.length > 0
      ) {
        const firstContent = chapter.contentItems[0];
        setContentType(firstContent.contentType);
        setContentData(firstContent.contentData);
      }
    }
  }, [chapter]);

  const handleChapterSubmit = async (data: {
    title: string;
    description: string | null;
  }) => {
    setIsLoading(true);
    try {
      await onSave({
        ...data,
        contentType,
        contentData: contentData || undefined,
      });
      // Success toast is handled by the parent component
    } catch (error: any) {
      // Error toast is handled by the parent component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentTypeChange = (newType: ContentType) => {
    if (contentData && contentType !== newType) {
      // Show dialog to confirm content type change
      setPendingContentType(newType);
      setShowContentTypeChangeDialog(true);
      return;
    }

    setContentType(newType);
    setContentData(null);
  };

  const confirmContentTypeChange = () => {
    if (pendingContentType) {
      setContentType(pendingContentType);
      setContentData(null);
      showWarningToast(
        "Type de contenu modifié",
        "Les données précédentes ont été effacées"
      );
      setPendingContentType(null);
    }
    setShowContentTypeChangeDialog(false);
  };

  const cancelContentTypeChange = () => {
    setPendingContentType(null);
    setShowContentTypeChangeDialog(false);
  };

  const handleContentDataChange = (data: ContentData) => {
    setContentData(data);
  };

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>
            {mode === "create"
              ? "Créer un nouveau chapitre"
              : "Modifier le chapitre"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Ajoutez un nouveau chapitre à votre cours"
              : "Modifiez les informations du chapitre"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ChapterForm
            initialData={chapter}
            onSubmit={handleChapterSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
          />

          {mode === "edit" && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Contenu du chapitre</h3>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez le type de contenu et configurez-le ci-dessous
                  </p>
                </div>

                <ContentTypeSelector
                  value={contentType}
                  onChange={handleContentTypeChange}
                  disabled={isLoading}
                />

                {/* Content editors based on selected type */}
                {contentType === "text" && (
                  <TextEditor
                    value={contentData?.type === "text" ? contentData : null}
                    onChange={handleContentDataChange}
                    disabled={isLoading}
                  />
                )}

                {contentType === "video" && (
                  <VideoEditor
                    value={contentData?.type === "video" ? contentData : null}
                    onChange={handleContentDataChange}
                    disabled={isLoading}
                  />
                )}

                {contentType === "quiz" && (
                  <QuizEditor
                    value={contentData?.type === "quiz" ? contentData : null}
                    onChange={handleContentDataChange}
                    disabled={isLoading}
                  />
                )}

                {contentType === "test" && (
                  <TestEditor
                    value={contentData?.type === "test" ? contentData : null}
                    onChange={handleContentDataChange}
                    disabled={isLoading}
                  />
                )}

                {contentType === "exam" && (
                  <ExamEditor
                    value={contentData?.type === "exam" ? contentData : null}
                    onChange={handleContentDataChange}
                    disabled={isLoading}
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Content Type Change Confirmation Dialog */}
      <AlertDialog
        open={showContentTypeChangeDialog}
        onOpenChange={setShowContentTypeChangeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le type de contenu ?</AlertDialogTitle>
            <AlertDialogDescription>
              Changer le type de contenu effacera les données actuelles que vous
              avez saisies. Cette action ne peut pas être annulée. Voulez-vous
              continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelContentTypeChange}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmContentTypeChange}>
              Continuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
