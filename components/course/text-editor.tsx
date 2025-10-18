"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link as LinkIcon,
} from "lucide-react"
import type { TextContent } from "@/types/chapter"
import DOMPurify from "isomorphic-dompurify"

interface TextEditorProps {
  value: TextContent | null
  onChange: (value: TextContent) => void
  disabled?: boolean
}

export function TextEditor({ value, onChange, disabled = false }: TextEditorProps) {
  const [content, setContent] = useState(value?.content || "")
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(value?.content || "")
    setCharCount(value?.content?.length || 0)
  }, [value])

  const handleContentChange = (newContent: string) => {
    // Sanitize content to prevent XSS
    const sanitized = DOMPurify.sanitize(newContent, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "b",
        "i",
        "u",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "a",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    })

    setContent(sanitized)
    setCharCount(sanitized.length)

    onChange({
      type: "text",
      content: sanitized,
      attachments: value?.attachments,
    })
  }

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end)

    handleContentChange(newContent)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      )
    }, 0)
  }

  const formatBold = () => insertFormatting("<strong>", "</strong>")
  const formatItalic = () => insertFormatting("<em>", "</em>")
  const formatH1 = () => insertFormatting("<h1>", "</h1>")
  const formatH2 = () => insertFormatting("<h2>", "</h2>")
  const formatList = () => insertFormatting("<ul>\n<li>", "</li>\n</ul>")
  const formatOrderedList = () => insertFormatting("<ol>\n<li>", "</li>\n</ol>")
  const formatLink = () => {
    const url = prompt("Entrez l'URL du lien:")
    if (url) {
      insertFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, "</a>")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text-content">Contenu texte</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Utilisez les boutons de formatage pour styliser votre texte
        </p>
      </div>

      <Card className="p-2">
        <div className="flex flex-wrap gap-1 mb-2 border-b pb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatBold}
            disabled={disabled}
            title="Gras"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatItalic}
            disabled={disabled}
            title="Italique"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatH1}
            disabled={disabled}
            title="Titre 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatH2}
            disabled={disabled}
            title="Titre 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatList}
            disabled={disabled}
            title="Liste à puces"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatOrderedList}
            disabled={disabled}
            title="Liste numérotée"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatLink}
            disabled={disabled}
            title="Insérer un lien"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          ref={textareaRef}
          id="text-content"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          disabled={disabled}
          placeholder="Entrez le contenu de votre texte ici..."
          className="min-h-[300px] font-mono text-sm"
        />
      </Card>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Nombre de caractères: {charCount}</span>
        <span className="text-xs">Le contenu est automatiquement nettoyé pour la sécurité</span>
      </div>

      {/* Preview section */}
      {content && (
        <div className="space-y-2">
          <Label>Aperçu</Label>
          <Card className="p-4">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          </Card>
        </div>
      )}
    </div>
  )
}
