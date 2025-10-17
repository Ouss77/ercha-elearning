import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"
import { users } from "@/drizzle/schema"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Define validation schema for each user row
const userRowSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["STUDENT", "TRAINER", "SUB_ADMIN", "ADMIN"]).optional().default("STUDENT"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional().default("Morocco"),
  bio: z.string().optional(),
  isActive: z.union([z.boolean(), z.string()]).optional().transform(val => {
    if (typeof val === 'boolean') return val
    if (typeof val === 'string') return val.toLowerCase() === 'true'
    return true
  }),
})

type UserRow = z.infer<typeof userRowSchema>

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé. Seuls les administrateurs peuvent importer des utilisateurs en masse." },
        { status: 403 }
      )
    }

    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    // Read file content
    const fileContent = await file.text()
    const isExcel = file.name.endsWith('.xlsx') || file.type.includes('spreadsheet')
    
    // Parse file
    let rows
    if (isExcel) {
      // For Excel files, we'll treat them as CSV for now
      // In a production environment, you'd want to use a library like 'xlsx'
      rows = parseCSV(fileContent)
    } else {
      rows = parseCSV(fileContent)
    }
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Le fichier est vide ou mal formaté" },
        { status: 400 }
      )
    }

    // Process each row
    const results = {
      total: rows.length,
      created: 0,
      failed: 0,
      errors: [] as Array<{ row: number; email: string; error: string }>
    }

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2 // +2 because first row is header and we count from 1
      const row = rows[i]
      
      try {
        // Validate row data
        const validatedData = userRowSchema.parse(row)
        
        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10)
        
        // Prepare user data for insertion
        const userData: any = {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          role: validatedData.role,
          isActive: validatedData.isActive,
          country: validatedData.country,
        }

        // Add optional fields if they exist
        if (validatedData.phone) userData.phone = validatedData.phone
        if (validatedData.dateOfBirth) {
          // Parse date string to Date object
          const date = new Date(validatedData.dateOfBirth)
          if (!isNaN(date.getTime())) {
            userData.dateOfBirth = date
          }
        }
        if (validatedData.address) userData.address = validatedData.address
        if (validatedData.city) userData.city = validatedData.city
        if (validatedData.postalCode) userData.postalCode = validatedData.postalCode
        if (validatedData.bio) userData.bio = validatedData.bio

        // Insert user into database
        await db.insert(users).values(userData)
        results.created++
        
      } catch (error: any) {
        results.failed++
        
        let errorMessage = "Erreur inconnue"
        
        if (error instanceof z.ZodError) {
          errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        } else if (error.message?.includes('duplicate key')) {
          errorMessage = "L'email existe déjà"
        } else if (error.message) {
          errorMessage = error.message
        }
        
        results.errors.push({
          row: rowNumber,
          email: row.email || 'N/A',
          error: errorMessage
        })
      }
    }

    return NextResponse.json({
      success: true,
      ...results
    })
    
  } catch (error: any) {
    console.error("[BULK_UPLOAD] Error:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'importation" },
      { status: 500 }
    )
  }
}

// Helper function to parse CSV
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim() !== '')
  
  if (lines.length < 2) {
    return []
  }

  // Parse header
  const headers = parseCSVLine(lines[0])
  
  // Map French headers to English field names
  const headerMap: Record<string, string> = {
    'email': 'email',
    'nom': 'name',
    'name': 'name',
    'mot_de_passe': 'password',
    'password': 'password',
    'role': 'role',
    'telephone': 'phone',
    'phone': 'phone',
    'date_naissance': 'dateOfBirth',
    'dateOfBirth': 'dateOfBirth',
    'adresse': 'address',
    'address': 'address',
    'ville': 'city',
    'city': 'city',
    'code_postal': 'postalCode',
    'postalCode': 'postalCode',
    'pays': 'country',
    'country': 'country',
    'biographie': 'bio',
    'bio': 'bio',
    'actif': 'isActive',
    'isActive': 'isActive',
  }
  
  // Parse data rows
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim()
      const normalizedHeader = header.trim().toLowerCase()
      const mappedField = headerMap[normalizedHeader] || normalizedHeader
      
      if (value !== undefined && value !== '') {
        row[mappedField] = value
      }
    })
    
    // Only add row if it has at least email
    if (row.email) {
      rows.push(row)
    }
  }
  
  return rows
}

// Helper function to parse a single CSV line (handles quoted fields)
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}
