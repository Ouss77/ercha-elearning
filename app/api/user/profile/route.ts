import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();

    // Validate and sanitize input
    const {
      name,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      postalCode,
      country,
      bio,
    } = body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Le nom est requis" },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Email invalide" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return NextResponse.json(
          { success: false, message: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Update user in database
    const updatedUser = await db
      .update(users)
      .set({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        postalCode: postalCode?.trim() || null,
        country: country?.trim() || null,
        bio: bio?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json(
        { success: false, message: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
