"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Image as ImageIcon, Link2 } from "lucide-react"
import { PREDEFINED_AVATARS } from "@/lib/constants/avatars"
import { cn } from "@/lib/utils/utils"

interface AvatarPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

export function AvatarPicker({ value, onChange, label = "Avatar", className }: AvatarPickerProps) {
  const [activeTab, setActiveTab] = useState<string>("predefined")
  const [customUrl, setCustomUrl] = useState(value || "")
  const [uploadError, setUploadError] = useState<string>("")

  const handlePredefinedSelect = (path: string) => {
    onChange(path)
    setCustomUrl(path)
  }

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url)
    onChange(url)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError("Veuillez sélectionner un fichier image")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("L'image doit faire moins de 5MB")
      return
    }

    setUploadError("")

    try {
      // Create FormData and upload
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
      setCustomUrl(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError("Erreur lors du téléchargement de l'image")
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        {value && (
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-border">
            <Image
              src={value}
              alt="Avatar preview"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder-user.jpg"
              }}
            />
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="predefined" className="text-xs px-2">
            <ImageIcon className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Prédéfinis</span>
            <span className="sm:hidden">Pré.</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs px-2">
            <Upload className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Upload</span>
            <span className="sm:hidden">Up.</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs px-2">
            <Link2 className="h-3 w-3 mr-1" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="mt-2">
          <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
            {PREDEFINED_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handlePredefinedSelect(avatar.path)}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                  value === avatar.path
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                )}
                title={avatar.name}
              >
                <Image
                  src={avatar.path}
                  alt={avatar.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-user.jpg"
                  }}
                />
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-2">
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="avatar-file-input"
            />
            <label htmlFor="avatar-file-input" className="cursor-pointer">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium">Cliquez pour télécharger</p>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG (max 5MB)</p>
                </div>
              </div>
            </label>
          </div>
          {uploadError && (
            <p className="text-xs text-destructive mt-1">{uploadError}</p>
          )}
        </TabsContent>

        <TabsContent value="url" className="mt-2">
          <Input
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={customUrl}
            onChange={(e) => handleCustomUrlChange(e.target.value)}
            className="h-9 text-sm"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
