import { toast } from "sonner"
import { ZodError } from "zod"

/**
 * Error types for chapter management
 */
export enum ChapterErrorType {
  VALIDATION = "validation",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  NETWORK = "network",
  SERVER = "server",
  UNKNOWN = "unknown",
}

/**
 * Structured error class for chapter management
 */
export class ChapterError extends Error {
  type: ChapterErrorType
  details?: any
  statusCode?: number

  constructor(
    message: string,
    type: ChapterErrorType = ChapterErrorType.UNKNOWN,
    details?: any,
    statusCode?: number
  ) {
    super(message)
    this.name = "ChapterError"
    this.type = type
    this.details = details
    this.statusCode = statusCode
  }
}

/**
 * Parse API error response and return structured error
 */
export async function parseApiError(response: Response): Promise<ChapterError> {
  let errorData: any
  try {
    errorData = await response.json()
  } catch {
    errorData = { error: "Une erreur s'est produite" }
  }

  const message = errorData.error || "Une erreur s'est produite"
  const details = errorData.details

  // Determine error type based on status code
  let type: ChapterErrorType
  switch (response.status) {
    case 400:
      type = ChapterErrorType.VALIDATION
      break
    case 401:
    case 403:
      type = ChapterErrorType.AUTHORIZATION
      break
    case 404:
      type = ChapterErrorType.NOT_FOUND
      break
    case 500:
    case 502:
    case 503:
      type = ChapterErrorType.SERVER
      break
    default:
      type = ChapterErrorType.UNKNOWN
  }

  return new ChapterError(message, type, details, response.status)
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyErrorMessage(error: ChapterError | Error): string {
  if (error instanceof ChapterError) {
    switch (error.type) {
      case ChapterErrorType.VALIDATION:
        return "Veuillez vérifier les informations saisies et réessayer"
      case ChapterErrorType.AUTHORIZATION:
        return "Vous n'avez pas les permissions nécessaires pour effectuer cette action"
      case ChapterErrorType.NOT_FOUND:
        return "La ressource demandée n'a pas été trouvée"
      case ChapterErrorType.NETWORK:
        return "Erreur de connexion. Veuillez vérifier votre connexion internet"
      case ChapterErrorType.SERVER:
        return "Une erreur serveur s'est produite. Veuillez réessayer plus tard"
      default:
        return error.message || "Une erreur inattendue s'est produite"
    }
  }

  return error.message || "Une erreur inattendue s'est produite"
}

/**
 * Get detailed validation error messages from Zod errors
 */
export function getValidationErrorMessages(error: ZodError): string[] {
  return error.errors.map((err) => {
    const field = err.path.join(".")
    const message = err.message

    // Translate common validation messages to French
    const translatedMessage = translateValidationMessage(message)

    return field ? `${field}: ${translatedMessage}` : translatedMessage
  })
}

/**
 * Translate common validation messages to French
 */
function translateValidationMessage(message: string): string {
  const translations: Record<string, string> = {
    "Required": "Ce champ est requis",
    "Invalid": "Valeur invalide",
    "String must contain at least": "Doit contenir au moins",
    "String must contain at most": "Doit contenir au maximum",
    "Expected string": "Une chaîne de caractères est attendue",
    "Expected number": "Un nombre est attendu",
    "Expected array": "Un tableau est attendu",
    "Invalid url": "URL invalide",
    "Invalid email": "Email invalide",
  }

  for (const [key, value] of Object.entries(translations)) {
    if (message.includes(key)) {
      return message.replace(key, value)
    }
  }

  return message
}

/**
 * Handle API errors and show appropriate toast notifications
 */
export function handleApiError(error: unknown, context?: string): ChapterError {
  console.error(`[Chapter Management] ${context || "Error"}:`, error)

  // Handle ChapterError
  if (error instanceof ChapterError) {
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    
    // Show validation details if available
    if (error.type === ChapterErrorType.VALIDATION && error.details) {
      toast.error(friendlyMessage, {
        description: Array.isArray(error.details)
          ? error.details.join(", ")
          : undefined,
      })
    } else {
      toast.error(friendlyMessage)
    }
    
    return error
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const messages = getValidationErrorMessages(error)
    const chapterError = new ChapterError(
      "Erreur de validation",
      ChapterErrorType.VALIDATION,
      messages
    )
    
    toast.error("Erreur de validation", {
      description: messages[0], // Show first error
    })
    
    return chapterError
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    const chapterError = new ChapterError(
      "Erreur de connexion",
      ChapterErrorType.NETWORK
    )
    toast.error(getUserFriendlyErrorMessage(chapterError))
    return chapterError
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : "Une erreur inattendue s'est produite"
  const chapterError = new ChapterError(message, ChapterErrorType.UNKNOWN)
  toast.error(getUserFriendlyErrorMessage(chapterError))
  
  return chapterError
}

/**
 * Wrapper for fetch requests with error handling
 */
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit,
  context?: string
): Promise<Response> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await parseApiError(response)
      throw error
    }

    return response
  } catch (error) {
    if (error instanceof ChapterError) {
      throw error
    }
    throw handleApiError(error, context)
  }
}

/**
 * Show success toast notification
 */
export function showSuccessToast(message: string, description?: string) {
  toast.success(message, { description })
}

/**
 * Show error toast notification
 */
export function showErrorToast(message: string, description?: string) {
  toast.error(message, { description })
}

/**
 * Show info toast notification
 */
export function showInfoToast(message: string, description?: string) {
  toast.info(message, { description })
}

/**
 * Show warning toast notification
 */
export function showWarningToast(message: string, description?: string) {
  toast.warning(message, { description })
}
