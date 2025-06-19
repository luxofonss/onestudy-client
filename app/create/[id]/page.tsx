"use client";

import { useParams, useRouter } from "next/navigation";
import CreateTestPageContent from "@/components/quiz/CreateTestPageContent";
import { withAuth } from "@/lib/hooks/with-auth";
import { useEffect } from "react";
import { event } from "@/lib/utils/analytics";

function CreateTestPage() {
  const params = useParams();
  const quizId = params.id as string;
  
  useEffect(() => {
    // Track page view with quiz ID for edit mode
    event({
      action: 'quiz_edit_page_view',
      category: 'Quiz Creation',
      label: `Quiz ID: ${quizId}`,
    });
  }, [quizId]);

  return <CreateTestPageContent quizId={quizId} />;
}

export default withAuth(CreateTestPage);
