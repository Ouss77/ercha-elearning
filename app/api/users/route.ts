import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { createUser, getAllUsers } from "@/lib/db/db"
import { roleSchema } from "@/lib/schemas/user"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await getAllUsers()

    if (result.success === false) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ users: result.data })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      email, 
      password, 
      name, 
      role,
      phone,
      dateOfBirth,
      address,
      city,
      postalCode,
      country,
      bio,
      avatarUrl,
      isActive
    } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const parsedRole = roleSchema.safeParse(role || "STUDENT")
    if (!parsedRole.success) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const userData: any = {
      email,
      password,
      name,
      role: parsedRole.data,
    }

    // Add optional fields
    if (phone) userData.phone = phone
    if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth)
    if (address) userData.address = address
    if (city) userData.city = city
    if (postalCode) userData.postalCode = postalCode
    if (country) userData.country = country
    if (bio) userData.bio = bio
    if (avatarUrl) userData.photoUrl = avatarUrl
    if (isActive !== undefined) userData.isActive = isActive

    const result = await createUser(userData)

    if (result.success === false) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      message: "User created successfully",
      user: result.data,
    })
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
