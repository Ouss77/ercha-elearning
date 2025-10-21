export interface Domain {
  id: number;
  name: string;
  color: string;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  domainId: number | null;
  teacherId: number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  domain?: Domain;
  teacher?: Teacher;
  _count?: {
    enrollments: number;
    chapters: number;
  };
}
