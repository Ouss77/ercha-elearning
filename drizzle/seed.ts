import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { hash } from "bcryptjs"
import * as schema from "./schema"

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool, { schema })

async function seed() {
  console.log("🌱 Starting database seed...")

  try {
    // Hash password for all test users
    const hashedPassword = await hash("password123", 10)

    // Create sample users for each role
    console.log("Creating users...")
    const usersToInsert: (typeof schema.users.$inferInsert)[] = [
      {
        email: "admin@example.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      },
      {
        email: "subadmin@example.com",
        password: hashedPassword,
        name: "Sub Admin User",
        role: "SUB_ADMIN",
      },
      {
        email: "teacher@example.com",
        password: hashedPassword,
        name: "Teacher User",
        role: "TRAINER",
      },
      {
        email: "student@example.com",
        password: hashedPassword,
        name: "Student User",
        role: "STUDENT",
      },
    ]

    const usersData = await db
      .insert(schema.users)
      .values(usersToInsert)
      .returning()

    console.log(`✅ Created ${usersData.length} users`)

    // Find teacher and student for sample data
    const teacher = usersData.find((u) => u.role === "TRAINER")
    const student = usersData.find((u) => u.role === "STUDENT")

    if (teacher && student) {
      // Create sample domain first
      console.log("Creating sample domain...")
      const [domain] = await db
        .insert(schema.domains)
        .values({
          name: "Web Development",
          description: "Learn web development technologies",
          color: "#3b82f6",
        })
        .returning()

      console.log(`✅ Created domain: ${domain.name}`)

      // Create sample courses
      console.log("Creating sample courses...")
      const coursesData = await db
        .insert(schema.courses)
        .values([
          {
            title: "Introduction to Web Development",
            description: "Learn the basics of HTML, CSS, and JavaScript",
            teacherId: teacher.id,
            domainId: domain.id,
            isActive: true,
          },
          {
            title: "Advanced JavaScript Concepts",
            description: "Master async programming, closures, and more",
            teacherId: teacher.id,
            domainId: domain.id,
            isActive: true,
          },
        ])
        .returning()

      console.log(`✅ Created ${coursesData.length} courses`)

      // Create sample enrollments
      console.log("Creating sample enrollments...")
      const enrollmentsData = await db
        .insert(schema.enrollments)
        .values([
          {
            studentId: student.id,
            courseId: coursesData[0].id,
          },
          {
            studentId: student.id,
            courseId: coursesData[1].id,
          },
        ])
        .returning()

      console.log(`✅ Created ${enrollmentsData.length} enrollments`)

      // Note: Additional sample data can be added here as needed
      console.log("✅ Sample enrollments created successfully")
    }

    console.log("✅ Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run seed function
seed()
  .then(() => {
    console.log("🎉 Seed script finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Seed script failed:", error)
    process.exit(1)
  })
