"use client";

import { useParams, useRouter } from "next/navigation";
import CreateTestPageContent from "@/components/quiz/CreateTestPageContent";
import { withAuth } from "@/lib/hooks/with-auth";

function CreateTestPage() {
  const params = useParams();
  const quizId = params.id as string;

  return <CreateTestPageContent quizId={quizId} />;
}

export default withAuth(CreateTestPage);
