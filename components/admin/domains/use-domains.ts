"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { Domain, DomainFormData } from "./types"

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDomains = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/domains")

      if (!response.ok) {
        throw new Error("Échec du chargement des domaines")
      }

      const data = await response.json()
      setDomains(data.domains || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Échec du chargement des domaines. Veuillez réessayer."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDomains()
  }, [])

  const createDomain = async (formData: DomainFormData) => {
    try {
      setIsCreating(true)

      const response = await fetch("/api/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Échec de la création du domaine")
      }

      toast.success("Domaine créé avec succès")
      await fetchDomains()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Échec de la création du domaine. Veuillez réessayer."
      toast.error(errorMessage)
      throw err
    } finally {
      setIsCreating(false)
    }
  }

  const updateDomain = async (id: number, formData: Partial<DomainFormData>) => {
    try {
      setIsUpdating(true)

      const response = await fetch(`/api/domains/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Échec de la mise à jour du domaine")
      }

      toast.success("Domaine mis à jour avec succès")
      await fetchDomains()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Échec de la mise à jour du domaine. Veuillez réessayer."
      toast.error(errorMessage)
      throw err
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteDomain = async (id: number) => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/domains/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Impossible de supprimer un domaine avec des cours associés")
        }
        throw new Error(data.error || "Échec de la suppression du domaine")
      }

      toast.success("Domaine supprimé avec succès")
      await fetchDomains()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Échec de la suppression du domaine. Veuillez réessayer."
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    domains,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createDomain,
    updateDomain,
    deleteDomain,
  }
}

