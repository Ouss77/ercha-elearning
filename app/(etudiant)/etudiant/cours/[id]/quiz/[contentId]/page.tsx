import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { contentItems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import QuizView from "@/components/student/quiz-view";

interface QuizPageProps {
  params: {
    id: string;
    contentId: string;
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const courseId = parseInt(params.id);
  const contentId = parseInt(params.contentId);

  // Fetch the content item with quiz data
  const [content] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, contentId))
    .limit(1);

  if (!content) {
    redirect(`/etudiant/cours/${courseId}`);
  }

  // Verify it's a quiz/test/exam
  const contentData = content.contentData as any;
  if (!["quiz", "test", "exam"].includes(contentData?.type)) {
    redirect(`/etudiant/cours/${courseId}`);
  }

  return (
    <QuizView
      courseId={courseId}
      contentId={contentId}
      title={content.title}
      contentData={contentData}
      userId={session.user.id}
    />
  );
}
