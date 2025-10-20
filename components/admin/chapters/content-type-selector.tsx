"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ContentType } from "@/types/chapter"
import { FileText, Video, HelpCircle, ClipboardList, FileCheck } from "lucide-react"

interface ContentTypeSelectorProps {
  value: ContentType
  onChange: (type: ContentType) => void
  disabled?: boolean
}

const contentTypeOptions = [
  {
    value: "video" as const,
    label: "Vidéo",
    icon: Video,
    description: "Contenu vidéo (YouTube, Vimeo, etc.)",
  },
  {
    value: "text" as const,
    label: "Texte",
    icon: FileText,
    description: "Contenu texte enrichi",
  },
  {
    value: "quiz" as const,
    label: "Quiz",
    icon: HelpCircle,
    description: "Quiz avec questions à choix multiples",
  },
  {
    value: "test" as const,
    label: "Test",
    icon: ClipboardList,
    description: "Test noté avec score",
  },
  {
    value: "exam" as const,
    label: "Examen",
    icon: FileCheck,
    description: "Examen complet avec surveillance",
  },
]

export function ContentTypeSelector({ value, onChange, disabled = false }: ContentTypeSelectorProps) {
  const selectedOption = contentTypeOptions.find((opt) => opt.value === value)
  const Icon = selectedOption?.icon || FileText

  return (
    <div className="space-y-2">
      <Label htmlFor="content-type">
        Type de contenu <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="content-type" className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{selectedOption?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {contentTypeOptions.map((option) => {
            const OptionIcon = option.icon
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-start gap-2 py-1">
                  <OptionIcon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {selectedOption && (
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {selectedOption.description}
        </p>
      )}
    </div>
  )
}
