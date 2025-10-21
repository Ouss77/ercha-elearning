import type { ChapterWithContent, ContentType, ContentData } from "@/types/chapter";
import type { Role } from "@/lib/schemas/user";

export type ViewMode = "list" | "create" | "edit" | "preview";

export interface ChapterManagementPageProps {
  courseId: number;
  courseTitle: string;
  courseSlug?: string;
  initialChapters: ChapterWithContent[];
  userRole: Role;
  userId: number;
}

export interface ChapterEditorData {
  title: string;
  description: string | null;
  contentType?: ContentType;
  contentData?: ContentData;
}

export interface DeleteTarget {
  type: "chapter" | "content";
  id: number;
  title: string;
}
