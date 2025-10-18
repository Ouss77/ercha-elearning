import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { getDomainsWithCounts, createDomain, domainNameExists } from "@/lib/db/queries"
import { createDomainSchema } from "@/lib/schemas/domain"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await getDomainsWithCounts()

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ domains: result.data })
  } catch (error) {
    console.error("Error fetching domains:", error)
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createDomainSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Check if name already exists
    const nameCheck = await domainNameExists(validation.data.name)
    if (nameCheck.success && nameCheck.data) {
      return NextResponse.json(
        {
          error: "A domain with this name already exists",
        },
        { status: 409 }
      )
    }

    const result = await createDomain(validation.data)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Domain created successfully",
        domain: result.data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating domain:", error)
    return NextResponse.json({ error: "Failed to create domain" }, { status: 500 })
  }
}
