import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import {
  getDomainById,
  updateDomain,
  deleteDomain,
  domainHasCourses,
  domainNameExists,
} from "@/lib/db/queries"
import { updateDomainSchema, domainIdSchema } from "@/lib/schemas/domain"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paramValidation = domainIdSchema.safeParse({ id: params.id })
    if (!paramValidation.success) {
      return NextResponse.json({ error: "Invalid domain ID" }, { status: 400 })
    }

    const domainId = paramValidation.data.id

    // Check if domain exists
    const existingDomain = await getDomainById(domainId)
    if (!existingDomain.success || !existingDomain.data) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    const body = await request.json()
    const validation = updateDomainSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Check if new name conflicts with existing domain
    if (validation.data.name) {
      const nameCheck = await domainNameExists(validation.data.name, domainId)
      if (nameCheck.success && nameCheck.data) {
        return NextResponse.json(
          {
            error: "A domain with this name already exists",
          },
          { status: 409 }
        )
      }
    }

    const result = await updateDomain(domainId, validation.data)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      message: "Domain updated successfully",
      domain: result.data,
    })
  } catch (error) {
    console.error("Error updating domain:", error)
    return NextResponse.json({ error: "Failed to update domain" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paramValidation = domainIdSchema.safeParse({ id: params.id })
    if (!paramValidation.success) {
      return NextResponse.json({ error: "Invalid domain ID" }, { status: 400 })
    }

    const domainId = paramValidation.data.id

    // Check if domain exists
    const existingDomain = await getDomainById(domainId)
    if (!existingDomain.success || !existingDomain.data) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    // Check if domain has associated courses
    const hasCoursesResult = await domainHasCourses(domainId)
    if (hasCoursesResult.success && hasCoursesResult.data) {
      return NextResponse.json(
        {
          error: "Cannot delete domain with associated courses",
        },
        { status: 409 }
      )
    }

    const result = await deleteDomain(domainId)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      message: "Domain deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting domain:", error)
    return NextResponse.json({ error: "Failed to delete domain" }, { status: 500 })
  }
}
