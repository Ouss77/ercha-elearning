"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Course, Domain, Teacher } from "./types";
import type { CreateCourseInput } from "@/lib/schemas/course";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        throw new Error("Échec du chargement des cours");
      }
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des cours";
      setError(message);
      toast.error(message);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/domains");
      if (!response.ok) {
        throw new Error("Échec du chargement des domaines");
      }
      const data = await response.json();
      setDomains(data.domains || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des domaines";
      toast.error(message);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/users?role=TRAINER");
      if (!response.ok) {
        throw new Error("Échec du chargement des formateurs");
      }
      const data = await response.json();
      setTeachers(data.users || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des formateurs";
      toast.error(message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchCourses(), fetchDomains(), fetchTeachers()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const createCourse = async (data: CreateCourseInput) => {
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Échec de la création du cours");
    }

    toast.success("Cours créé avec succès");
    await fetchCourses();
  };

  const updateCourse = async (id: number, data: CreateCourseInput) => {
    const response = await fetch(`/api/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Échec de la mise à jour du cours");
    }

    toast.success("Cours mis à jour avec succès");
    await fetchCourses();
  };

  const deleteCourse = async (id: number) => {
    const response = await fetch(`/api/courses/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Échec de la suppression du cours");
    }

    toast.success("Cours supprimé avec succès");
    await fetchCourses();
  };

  const toggleCourseStatus = async (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const newStatus = !course.isActive;

    setCourses(courses.map((c) => (c.id === courseId ? { ...c, isActive: newStatus } : c)));

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        setCourses(courses.map((c) => (c.id === courseId ? { ...c, isActive: !newStatus } : c)));
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la mise à jour du statut");
      }

      toast.success(newStatus ? "Cours activé avec succès" : "Cours désactivé avec succès");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du statut";
      toast.error(message);
      setCourses(courses.map((c) => (c.id === courseId ? { ...c, isActive: !newStatus } : c)));
    }
  };

  return {
    courses,
    domains,
    teachers,
    isLoading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
  };
}
