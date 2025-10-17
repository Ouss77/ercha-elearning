import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { updateUserStatus, deleteUser, getUserById } from "@/lib/db/db"
import { updateUser } from "@/lib/db/queries"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const result = await getUserById(userId)

    if (!result.success || !result.data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: result.data,
    })
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    const { isActive } = body as { isActive?: unknown }

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 })
    }

    const result = await updateUserStatus(userId, isActive)

    if (!result.success) {
      const status = result.error === "User not found" ? 404 : 500
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({
      message: "User status updated successfully",
      user: result.data,
    })
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    const { 
      name, 
      email, 
      role, 
      password,
      phone,
      dateOfBirth,
      address,
      city,
      postalCode,
      country,
      bio,
      avatarUrl,
      isActive
    } = body as {
      name?: string
      email?: string
      role?: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN"
      password?: string
      phone?: string
      dateOfBirth?: string
      address?: string
      city?: string
      postalCode?: string
      country?: string
      bio?: string
      avatarUrl?: string
      isActive?: boolean
    }

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 })
    }

    // Prepare update data
    const updateData: Parameters<typeof updateUser>[1] = {
      name,
      email,
      role,
    }

    // Hash password if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }

    // Add optional fields
    if (phone !== undefined) updateData.phone = phone || null
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)
    if (address !== undefined) updateData.address = address || null
    if (city !== undefined) updateData.city = city || null
    if (postalCode !== undefined) updateData.postalCode = postalCode || null
    if (country !== undefined) updateData.country = country || null
    if (bio !== undefined) updateData.bio = bio || null
    if (avatarUrl !== undefined) updateData.photoUrl = avatarUrl || null
    if (isActive !== undefined) updateData.isActive = isActive

    const result = await updateUser(userId, updateData)

    if (!result.success) {
      const errorMessage = 'error' in result ? result.error : "Failed to update user"
      const status = errorMessage === "User not found" ? 404 : 500
      return NextResponse.json({ error: errorMessage }, { status })
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: result.data,
    })
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userId = Number.parseInt(params.id)
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }
    
    // Prevent self-deletion
    if (userId === Number(user.id)) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 })
    }
    
    // Check if user exists before attempting deletion
    const existingUserRes = await getUserById(userId)
    if (!existingUserRes.success || !existingUserRes.data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const result = await deleteUser(userId)
    if (!result.success) {
      const status = result.error === "Cannot delete the last admin user" ? 409 : 500
      console.error(`Failed to delete user ${userId}:`, result.error)
      return NextResponse.json({ error: result.error || "Failed to delete user" }, { status })
    }
    
    // Log the deletion for audit purposes
    console.info(`Admin ${user.id} permanently deleted user ${userId}`)
    
    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("[DELETE /api/users/[id]] Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
