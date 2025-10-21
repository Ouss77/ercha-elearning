"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { ContentTypeSelector } from "./content-type-selector";
import { TextEditor } from "./editors/text-editor";
import { VideoEditor } from "./editors/video-editor";
import { QuizEditor } from "./editors/quiz-editor";
import { TestEditor } from "./editors/test-editor";
import { ExamEditor } from "./editors/exam-editor";
import type { ContentItem, ContentType, ContentData } from "@/types/chapter";
import { showWarningToast } from "@/lib/utils/chapter-error-handler";
import { Save, X } from "lucide-react";

interface ContentItemEditorProps {
  contentItem?: ContentItem;
  onSave: (contentType: ContentType, contentData: ContentData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function ContentItemEditor({
  contentItem,
  onSave,
  onCancel,
  isLoading,
}: ContentItemEditorProps) {
  const [contentType, setContentType] = useState<ContentType>(
    contentItem?.contentType || "text"
  );
  const [contentData, setContentData] = useState<ContentData | null>(
    contentItem?.contentData || null
  );
  const [showContentTypeChangeDialog, setShowContentTypeChangeDialog] = useState(false);
  const [pendingContentType, setPendingContentType] = useState<ContentType | null>(null);

  useEffect(() => {
    if (contentItem) {
      setContentType(contentItem.contentType);
      setContentData(contentItem.contentData);
    }
  }, [contentItem]);

  const handleContentTypeChange = (newType: ContentType) => {
    if (contentData && contentType !== newType) {
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
      showWarningToast("Type de contenu modifié", "Les données précédentes ont été effacées");
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

  const handleSave = async () => {
    if (!contentData) {
      showWarningToast("Contenu vide", "Veuillez ajouter du contenu avant de sauvegarder");
      return;
    }

    await onSave(contentType, contentData);
  };

  return (
    <>
      <div className="space-y-4">
        <ContentTypeSelector
          value={contentType}
          onChange={handleContentTypeChange}
          disabled={isLoading}
        />

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

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !contentData}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <AlertDialog open={showContentTypeChangeDialog} onOpenChange={setShowContentTypeChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le type de contenu ?</AlertDialogTitle>
            <AlertDialogDescription>
              Changer le type de contenu effacera les données actuelles que vous avez saisies.
              Cette action ne peut pas être annulée. Voulez-vous continuer ?
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