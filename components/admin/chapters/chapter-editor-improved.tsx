"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChapterForm } from "./chapter-form";
import { ContentItemEditor } from "./content-item-editor";
import { Separator } from "@/components/ui/separator";
import type { ChapterWithContent, ContentItem, ContentType } from "@/types/chapter";
import type { ChapterEditorData } from "./types";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChapterEditorImprovedProps {
  chapter?: ChapterWithContent;
  courseId: number;
  mode: "create" | "edit";
  editingContentId?: number | null;
  onSave: (data: ChapterEditorData) => Promise<void>;
  onCancel: () => void;
}

export function ChapterEditorImproved({
  chapter,
  courseId,
  mode,
  editingContentId,
  onSave,
  onCancel,
}: ChapterEditorImprovedProps) {
  const [chapterData, setChapterData] = useState<{
    title: string;
    description: string | null;
  }>({
    title: chapter?.title || "",
    description: chapter?.description || null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("info");

  // Update state when chapter prop changes
  useEffect(() => {
    if (chapter) {
      setChapterData({
        title: chapter.title || "",
        description: chapter.description || null,
      });
    }
  }, [chapter]);

  // Auto-switch to content tab when editing specific content
  useEffect(() => {
    if (editingContentId !== undefined && editingContentId !== null) {
      if (editingContentId === -1) {
        setActiveTab("new-content");
      } else {
        setActiveTab(`content-${editingContentId}`);
      }
    }
  }, [editingContentId]);

  const handleChapterSubmit = async (data: { title: string; description: string | null }) => {
    setIsLoading(true);
    try {
      await onSave({
        ...data,
      });
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSave = async (contentType: ContentType, contentData: any) => {
    setIsLoading(true);
    try {
      await onSave({
        title: chapterData.title,
        description: chapterData.description,
        contentType,
        contentData,
      });
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contentItems = chapter?.contentItems || [];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Créer un nouveau chapitre" : "Modifier le chapitre"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Ajoutez un nouveau chapitre à votre cours"
            : "Modifiez les informations du chapitre et gérez son contenu"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "create" ? (
          <ChapterForm
            initialData={chapter}
            onSubmit={handleChapterSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-2 px-2 pb-2">
              <TabsList className="inline-flex w-full min-w-max bg-muted/50 p-1">
                <TabsTrigger 
                  value="info"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm whitespace-nowrap"
                >
                  Informations
                </TabsTrigger>
                {contentItems.map((item, index) => (
                  <TabsTrigger 
                    key={item.id} 
                    value={`content-${item.id}`}
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm whitespace-nowrap"
                  >
                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden xs:inline">Contenu</span> {index + 1}
                  </TabsTrigger>
                ))}
                <TabsTrigger 
                  value="new-content"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary text-xs sm:text-sm whitespace-nowrap"
                >
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                  Nouveau
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="info" className="space-y-4 mt-6">
              <ChapterForm
                initialData={chapter}
                onSubmit={handleChapterSubmit}
                onCancel={onCancel}
                isLoading={isLoading}
              />
            </TabsContent>

            {contentItems.map((item, index) => (
              <TabsContent
                key={item.id}
                value={`content-${item.id}`}
                className="space-y-4 mt-6"
                id="content-editor-section"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div>
                      <h3 className="text-lg font-semibold">Modifier le contenu #{index + 1}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Type: <span className="font-medium capitalize">{item.contentType}</span>
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{item.title}</Badge>
                  </div>
                  <ContentItemEditor
                    contentItem={item}
                    onSave={handleContentSave}
                    onCancel={onCancel}
                    isLoading={isLoading}
                  />
                </div>
              </TabsContent>
            ))}

            <TabsContent
              value="new-content"
              className="space-y-4 mt-6"
              id="content-editor-section"
            >
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary">Ajouter du contenu</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Sélectionnez le type de contenu et configurez-le
                  </p>
                </div>
                <ContentItemEditor
                  onSave={handleContentSave}
                  onCancel={onCancel}
                  isLoading={isLoading}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
