"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, AlertCircle, CheckCircle, Loader2, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface UploadResult {
  success: boolean
  total: number
  created: number
  failed: number
  errors?: Array<{ row: number; email: string; error: string }>
}

export function BulkUserUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile)
        setResult(null)
      } else {
        toast.error("Veuillez sélectionner un fichier CSV ou Excel (.csv, .xlsx)")
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/users/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        if (data.created > 0) {
          if (data.failed === 0) {
            toast.success(`${data.created} utilisateur${data.created > 1 ? 's' : ''} importé${data.created > 1 ? 's' : ''} avec succès`)
          } else {
            toast.warning(`${data.created} utilisateur${data.created > 1 ? 's' : ''} importé${data.created > 1 ? 's' : ''}, ${data.failed} échoué${data.failed > 1 ? 's' : ''}`)
          }
          if (onUploadComplete) {
            onUploadComplete()
          }
        } else if (data.failed > 0) {
          toast.error(`Importation échouée : ${data.failed} erreur${data.failed > 1 ? 's' : ''}`)
        }
      } else {
        toast.error(data.error || 'Erreur lors du téléchargement')
        setResult({
          success: false,
          total: 0,
          created: 0,
          failed: 0,
          errors: [{ row: 0, email: '', error: data.error || 'Erreur lors du téléchargement' }]
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error('Erreur de connexion au serveur')
      setResult({
        success: false,
        total: 0,
        created: 0,
        failed: 0,
        errors: [{ row: 0, email: '', error: 'Erreur de connexion au serveur' }]
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create CSV template with French headers
    const headers = [
      'email',
      'nom',
      'mot_de_passe',
      'role',
      'telephone',
      'date_naissance',
      'adresse',
      'ville',
      'code_postal',
      'pays',
      'biographie',
      'actif'
    ]
    
    const example = [
      'jean.dupont@example.com',
      'Jean Dupont',
      'MotDePasse123',
      'STUDENT',
      '+212 6XX XXX XXX',
      '1990-01-15',
      '123 Rue Example',
      'Casablanca',
      '20000',
      'Morocco',
      'Étudiant passionné',
      'true'
    ]

    const csvContent = `${headers.join(',')}\n${example.join(',')}\n`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_utilisateurs.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Modèle téléchargé avec succès')
  }

  const resetUpload = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importer en masse
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importation en masse d&apos;utilisateurs</DialogTitle>
          <DialogDescription>
            Importez plusieurs utilisateurs à la fois en utilisant un fichier CSV ou Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. Télécharger le modèle</CardTitle>
              <CardDescription>
                Téléchargez le modèle CSV pour voir le format requis
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Télécharger le modèle CSV
              </Button>
              <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">Champs requis :</p>
                <p className="text-muted-foreground mb-2">
                  <strong>email</strong>, <strong>nom</strong>, <strong>mot_de_passe</strong>, <strong>role</strong>
                </p>
                <p className="font-medium mb-1">Champs optionnels :</p>
                <p className="text-muted-foreground">
                  telephone, date_naissance, adresse, ville, code_postal, pays, biographie, actif
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. Sélectionner le fichier</CardTitle>
              <CardDescription>
                Formats acceptés : CSV, Excel (.xlsx)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bulk-upload-file"
                />
                <label
                  htmlFor="bulk-upload-file"
                  className="flex-1 cursor-pointer"
                >
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                    {file ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            resetUpload()
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Cliquez pour sélectionner un fichier
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importation en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer les utilisateurs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <Card className={result.success && result.failed === 0 ? "border-green-500" : "border-orange-500"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {result.success && result.failed === 0 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Importation réussie
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Importation terminée avec des erreurs
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{result.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{result.created}</p>
                    <p className="text-sm text-muted-foreground">Créés</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                    <p className="text-sm text-muted-foreground">Échoués</p>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Erreurs :</p>
                    <div className="max-h-32 overflow-y-auto space-y-1.5">
                      {result.errors.map((error, index) => (
                        <div key={index} className="p-2 bg-destructive/10 rounded text-xs">
                          {error.row > 0 && (
                            <p className="font-medium">Ligne {error.row}: {error.email}</p>
                          )}
                          <p className="text-muted-foreground">{error.error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => {
                    resetUpload()
                    if (result.created > 0) {
                      setIsOpen(false)
                    }
                  }}
                  className="w-full"
                >
                  {result.created > 0 ? 'Fermer' : 'Réessayer'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
