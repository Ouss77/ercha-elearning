"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Video } from "lucide-react"
import type { VideoContent } from "@/types/chapter"

interface VideoEditorProps {
  value: VideoContent | null
  onChange: (value: VideoContent) => void
  disabled?: boolean
}

export function VideoEditor({ value, onChange, disabled = false }: VideoEditorProps) {
  const [url, setUrl] = useState(value?.url || "")
  const [duration, setDuration] = useState(value?.duration?.toString() || "")
  const [thumbnail, setThumbnail] = useState(value?.thumbnail || "")
  const [urlError, setUrlError] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)

  useEffect(() => {
    setUrl(value?.url || "")
    setDuration(value?.duration?.toString() || "")
    setThumbnail(value?.thumbnail || "")
  }, [value])

  const validateUrl = (urlString: string): boolean => {
    if (!urlString) {
      setUrlError("L'URL de la vidéo est requise")
      return false
    }

    try {
      const urlObj = new URL(urlString)
      const hostname = urlObj.hostname.toLowerCase()

      // Check for supported video platforms
      const supportedPlatforms = [
        "youtube.com",
        "www.youtube.com",
        "youtu.be",
        "vimeo.com",
        "www.vimeo.com",
      ]

      const isSupported =
        supportedPlatforms.some((platform) => hostname.includes(platform)) ||
        urlString.match(/\.(mp4|webm|ogg)$/i)

      if (!isSupported) {
        setUrlError(
          "URL non supportée. Utilisez YouTube, Vimeo ou un lien direct vers une vidéo (mp4, webm, ogg)"
        )
        return false
      }

      setUrlError(null)
      return true
    } catch {
      setUrlError("URL invalide")
      return false
    }
  }

  const validateThumbnailUrl = (urlString: string): boolean => {
    if (!urlString) {
      setThumbnailError(null)
      return true // Thumbnail is optional
    }

    try {
      new URL(urlString)
      setThumbnailError(null)
      return true
    } catch {
      setThumbnailError("URL de miniature invalide")
      return false
    }
  }

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    if (validateUrl(newUrl)) {
      updateVideoContent(newUrl, duration, thumbnail)
    }
  }

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration)
    if (url && validateUrl(url)) {
      updateVideoContent(url, newDuration, thumbnail)
    }
  }

  const handleThumbnailChange = (newThumbnail: string) => {
    setThumbnail(newThumbnail)
    if (validateThumbnailUrl(newThumbnail) && url && validateUrl(url)) {
      updateVideoContent(url, duration, newThumbnail)
    }
  }

  const updateVideoContent = (
    videoUrl: string,
    videoDuration: string,
    videoThumbnail: string
  ) => {
    const durationNum = videoDuration ? parseFloat(videoDuration) : undefined

    onChange({
      type: "video",
      url: videoUrl,
      duration: durationNum && durationNum > 0 ? durationNum : undefined,
      thumbnail: videoThumbnail || undefined,
    })
  }

  const getEmbedUrl = (videoUrl: string): string | null => {
    try {
      const urlObj = new URL(videoUrl)
      const hostname = urlObj.hostname.toLowerCase()

      // YouTube
      if (hostname.includes("youtube.com")) {
        const videoId = urlObj.searchParams.get("v")
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }

      // YouTube short URL
      if (hostname.includes("youtu.be")) {
        const videoId = urlObj.pathname.slice(1)
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }

      // Vimeo
      if (hostname.includes("vimeo.com")) {
        const videoId = urlObj.pathname.split("/").pop()
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null
      }

      // Direct video URL
      if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
        return videoUrl
      }

      return null
    } catch {
      return null
    }
  }

  const embedUrl = url && !urlError ? getEmbedUrl(url) : null
  const isDirectVideo = url && url.match(/\.(mp4|webm|ogg)$/i)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="video-url">URL de la vidéo *</Label>
        <Input
          id="video-url"
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          onBlur={() => validateUrl(url)}
          disabled={disabled}
          placeholder="https://www.youtube.com/watch?v=..."
          className={urlError ? "border-destructive" : ""}
        />
        {urlError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{urlError}</AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">
          Formats supportés: YouTube, Vimeo, ou lien direct (mp4, webm, ogg)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="video-duration">Durée (minutes)</Label>
          <Input
            id="video-duration"
            type="number"
            min="0"
            step="0.1"
            value={duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            disabled={disabled}
            placeholder="10.5"
          />
          <p className="text-sm text-muted-foreground">Optionnel</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="video-thumbnail">URL de la miniature</Label>
          <Input
            id="video-thumbnail"
            type="url"
            value={thumbnail}
            onChange={(e) => handleThumbnailChange(e.target.value)}
            onBlur={() => validateThumbnailUrl(thumbnail)}
            disabled={disabled}
            placeholder="https://..."
            className={thumbnailError ? "border-destructive" : ""}
          />
          {thumbnailError && (
            <p className="text-sm text-destructive">{thumbnailError}</p>
          )}
          <p className="text-sm text-muted-foreground">Optionnel</p>
        </div>
      </div>

      {/* Video Preview */}
      {embedUrl && (
        <div className="space-y-2">
          <Label>Aperçu de la vidéo</Label>
          <Card className="p-4">
            {isDirectVideo ? (
              <video
                src={embedUrl}
                controls
                className="w-full aspect-video rounded-lg"
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            ) : (
              <iframe
                src={embedUrl}
                className="w-full aspect-video rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Aperçu de la vidéo"
              />
            )}
          </Card>
        </div>
      )}

      {!embedUrl && url && !urlError && (
        <Card className="p-8 text-center">
          <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Aperçu de la vidéo non disponible
          </p>
        </Card>
      )}
    </div>
  )
}
