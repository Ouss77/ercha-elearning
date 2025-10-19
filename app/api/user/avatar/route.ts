import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;
    const userId = formData.get("userId") as string;

    // Verify user is updating their own avatar
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La taille du fichier ne doit pas dépasser 5MB" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Write file to disk
    await writeFile(filePath, new Uint8Array(buffer));

    // Update user avatar URL in database
    const avatarUrl = `/uploads/avatars/${fileName}`;
    await db
      .update(users)
      .set({ avatarUrl })
      .where(eq(users.id, parseInt(userId)));

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: "Avatar mis à jour avec succès",
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement de l'avatar" },
      { status: 500 }
    );
  }
}
