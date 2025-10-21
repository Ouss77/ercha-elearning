"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function ToastHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasShownToast = useRef(false)

  useEffect(() => {
    // Prevent duplicate toasts in React Strict Mode or on re-renders
    if (hasShownToast.current) return

    const successMessage = searchParams.get("success")
    const errorMessage = searchParams.get("error")
    
    if (successMessage) {
      toast.success(successMessage)
      hasShownToast.current = true
      // Clean up URL without triggering a navigation
      router.replace("/admin/utilisateurs", { scroll: false })
    }
    
    if (errorMessage) {
      toast.error(errorMessage)
      hasShownToast.current = true
      // Clean up URL without triggering a navigation
      router.replace("/admin/utilisateurs", { scroll: false })
    }
  }, [searchParams, router])

  return null
}
