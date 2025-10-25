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
            slug: "intro-web-dev",
            description: "Learn the basics of HTML, CSS, and JavaScript",
            teacherId: teacher.id,
            domainId: domain.id,
            isActive: true,
          },
          {
            title: "Advanced JavaScript Concepts",
            slug: "advanced-javascript",
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

      // Create sample modules for each course
      console.log("Creating sample modules...")
      const modulesData = await db
        .insert(schema.modules)
        .values([
          // Course 1: Introduction to Web Development
          {
            courseId: coursesData[0].id,
            title: "HTML Fundamentals",
            description: "Learn the basics of HTML structure and semantic elements",
            orderIndex: 0,
          },
          {
            courseId: coursesData[0].id,
            title: "CSS Styling",
            description: "Master CSS selectors, layouts, and responsive design",
            orderIndex: 1,
          },
          {
            courseId: coursesData[0].id,
            title: "JavaScript Basics",
            description: "Introduction to JavaScript syntax and DOM manipulation",
            orderIndex: 2,
          },
          // Course 2: Advanced JavaScript
          {
            courseId: coursesData[1].id,
            title: "Async JavaScript",
            description: "Promises, async/await, and handling asynchronous operations",
            orderIndex: 0,
          },
          {
            courseId: coursesData[1].id,
            title: "Advanced Patterns",
            description: "Closures, prototypes, and design patterns in JavaScript",
            orderIndex: 1,
          },
        ])
        .returning()

      console.log(`✅ Created ${modulesData.length} modules`)

      // Create sample chapters within modules
      console.log("Creating sample chapters...")
      const chaptersData = await db
        .insert(schema.chapters)
        .values([
          // Module 1: HTML Fundamentals
          {
            moduleId: modulesData[0].id,
            title: "Introduction to HTML",
            description: "What is HTML and why is it important?",
            orderIndex: 0,
          },
          {
            moduleId: modulesData[0].id,
            title: "HTML Document Structure",
            description: "Learn about DOCTYPE, head, and body elements",
            orderIndex: 1,
          },
          {
            moduleId: modulesData[0].id,
            title: "Semantic HTML",
            description: "Using semantic tags for better accessibility and SEO",
            orderIndex: 2,
          },
          // Module 2: CSS Styling
          {
            moduleId: modulesData[1].id,
            title: "CSS Selectors",
            description: "Understanding different types of CSS selectors",
            orderIndex: 0,
          },
          {
            moduleId: modulesData[1].id,
            title: "Flexbox Layout",
            description: "Creating flexible layouts with CSS Flexbox",
            orderIndex: 1,
          },
          // Module 3: JavaScript Basics
          {
            moduleId: modulesData[2].id,
            title: "Variables and Data Types",
            description: "Understanding JavaScript variables, let, const, and data types",
            orderIndex: 0,
          },
          {
            moduleId: modulesData[2].id,
            title: "Functions",
            description: "Creating and using functions in JavaScript",
            orderIndex: 1,
          },
          // Module 4: Async JavaScript
          {
            moduleId: modulesData[3].id,
            title: "Understanding Promises",
            description: "What are promises and how to use them",
            orderIndex: 0,
          },
          {
            moduleId: modulesData[3].id,
            title: "Async/Await Syntax",
            description: "Modern async syntax for cleaner asynchronous code",
            orderIndex: 1,
          },
          // Module 5: Advanced Patterns
          {
            moduleId: modulesData[4].id,
            title: "Closures Explained",
            description: "Understanding closures and their practical uses",
            orderIndex: 0,
          },
        ])
        .returning()

      console.log(`✅ Created ${chaptersData.length} chapters`)

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
