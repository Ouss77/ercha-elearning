import { eq, and, desc, sql, ne } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { domains, courses } from "@/drizzle/schema";

// Domain query functions
export async function getAllDomains() {
  try {
    const result = await db.select().from(domains);
    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getDomainById(id: number) {
  try {
    const result = await db
      .select()
      .from(domains)
      .where(eq(domains.id, id))
      .limit(1);
    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createDomain(data: {
  name: string;
  description?: string | null;
  color?: string;
}) {
  try {
    const result = await db
      .insert(domains)
      .values({
        name: data.name,
        description: data.description,
        color: data.color || "#6366f1",
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateDomain(
  id: number,
  data: Partial<{
    name: string;
    description: string | null;
    color: string;
  }>
) {
  try {
    const result = await db
      .update(domains)
      .set(data)
      .where(eq(domains.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteDomain(id: number) {
  try {
    const result = await db
      .delete(domains)
      .where(eq(domains.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getDomainsWithCounts() {
  try {
    const result = await db
      .select({
        id: domains.id,
        name: domains.name,
        description: domains.description,
        color: domains.color,
        createdAt: domains.createdAt,
        coursesCount: sql<number>`cast(count(${courses.id}) as int)`,
      })
      .from(domains)
      .leftJoin(courses, eq(domains.id, courses.domainId))
      .groupBy(domains.id)
      .orderBy(desc(domains.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function domainNameExists(name: string, excludeId?: number) {
  try {
    let query = db
      .select({ id: domains.id })
      .from(domains)
      .where(eq(domains.name, name));

    if (excludeId !== undefined) {
      query = db
        .select({ id: domains.id })
        .from(domains)
        .where(and(eq(domains.name, name), ne(domains.id, excludeId)));
    }

    const result = await query.limit(1);
    return { success: true, data: result.length > 0 };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function domainHasCourses(domainId: number) {
  try {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(courses)
      .where(eq(courses.domainId, domainId));

    return { success: true, data: result[0].count > 0 };
  } catch (error) {
    return handleDbError(error);
  }
}

