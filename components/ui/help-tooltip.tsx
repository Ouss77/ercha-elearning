"use client"

import { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, Info, AlertCircle } from "lucide-react"

interface HelpTooltipProps {
  content: string | ReactNode
  children?: ReactNode
  side?: "top" | "right" | "bottom" | "left"
  variant?: "default" | "info" | "warning"
  asChild?: boolean
}

export function HelpTooltip({ 
  content, 
  children, 
  side = "top",
  variant = "default",
  asChild = false 
}: HelpTooltipProps) {
  const getIcon = () => {
    switch (variant) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild}>
        {children || (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted transition-colors"
          >
            {getIcon()}
            <span className="sr-only">Aide</span>
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {typeof content === "string" ? <p>{content}</p> : content}
      </TooltipContent>
    </Tooltip>
  )
}

// Quick tooltip for form fields
export function FieldTooltip({ 
  content, 
  side = "right" 
}: { 
  content: string | ReactNode
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <HelpTooltip content={content} side={side} variant="info" />
  )
}

// Warning tooltip for destructive actions
export function WarningTooltip({ 
  content, 
  children,
  side = "top"
}: { 
  content: string | ReactNode
  children: ReactNode
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <HelpTooltip 
      content={content} 
      side={side} 
      variant="warning" 
      asChild
    >
      {children}
    </HelpTooltip>
  )
}
