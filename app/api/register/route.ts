import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { registerSchema } from "@/lib/schemas/auth"
import { db } from "@/lib/db"
import { users } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10)

    // Create user with default STUDENT role
    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: "STUDENT",
        consentTimestamp: new Date()
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}
