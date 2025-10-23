import { db } from "@/lib/db";
import { contentItems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Script to add sample content_data to existing content_items
 * Run with: bun run scripts/seed-sample-content.ts
 */

async function seedSampleContent() {
  console.log("🌱 Seeding sample content data...");

  try {
    // Get all content items
    const allContentItems = await db.select().from(contentItems);

    console.log(`Found ${allContentItems.length} content items`);

    for (const item of allContentItems) {
      let sampleData;

      switch (item.contentType) {
        case "video":
          sampleData = {
            type: "video",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Sample video
            duration: 212,
            thumbnail:
              "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          };
          break;

        case "text":
          sampleData = {
            type: "text",
            content: `
              <h2>Chapitre: ${item.title}</h2>
              <p>Bienvenue dans ce chapitre de cours.</p>
              <h3>Objectifs d'apprentissage</h3>
              <ul>
                <li>Comprendre les concepts clés</li>
                <li>Maîtriser les techniques présentées</li>
                <li>Appliquer vos connaissances</li>
              </ul>
              <h3>Contenu du cours</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <blockquote>
                <p><strong>Note importante:</strong> Prenez le temps de bien comprendre chaque concept avant de passer au suivant.</p>
              </blockquote>
            `,
            attachments: [],
          };
          break;

        case "quiz":
          sampleData = {
            type: "quiz",
            questions: [
              {
                question: "Quelle est la bonne réponse?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0,
                explanation: "L'option A est correcte car...",
              },
              {
                question: "Choisissez la meilleure réponse:",
                options: ["Réponse 1", "Réponse 2", "Réponse 3"],
                correctAnswer: 1,
                explanation: "La réponse 2 est la plus appropriée.",
              },
            ],
            passingScore: 70,
            timeLimit: 600,
          };
          break;

        case "test":
          sampleData = {
            type: "test",
            questions: [
              {
                question: "Question de test 1",
                options: ["A", "B", "C", "D"],
                correctAnswer: 2,
                explanation: "C est la bonne réponse.",
              },
            ],
            passingScore: 80,
            timeLimit: 1200,
            attemptsAllowed: 3,
          };
          break;

        case "exam":
          sampleData = {
            type: "exam",
            questions: [
              {
                question: "Question d'examen 1",
                options: ["A", "B", "C", "D"],
                correctAnswer: 0,
                explanation: "A est correct.",
              },
            ],
            passingScore: 85,
            timeLimit: 3600,
            attemptsAllowed: 1,
            proctored: true,
          };
          break;

        default:
          console.log(
            `⚠️  Unknown content type: ${item.contentType} for item ${item.id}`
          );
          continue;
      }

      // Update the content_data
      await db
        .update(contentItems)
        .set({ contentData: sampleData })
        .where(eq(contentItems.id, item.id));

      console.log(
        `✅ Updated content_data for item ${item.id} (${item.contentType}): ${item.title}`
      );
    }

    console.log("✨ Sample content data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding content:", error);
    throw error;
  }
}

// Run the seed
seedSampleContent()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
