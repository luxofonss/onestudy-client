"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { QuizCard } from "@/components/ui/quiz-card";
import { SearchAndFilter } from "@/components/ui/search-and-filter";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { quizService } from "@/lib/services/quiz-service";
import type { IQuiz, IQuizFilters } from "@/lib/types/api-types";
import { withAuth } from "@/lib/hooks/with-auth";
import { useSearchParams, useRouter } from "next/navigation";
import { SUCCESS_CODE } from "@/lib/constants";

// Dynamic imports for better performance
const LoadingSkeleton = dynamic(
  () =>
    import("@/components/ui/loading-skeleton").then((mod) => ({
      default: mod.LoadingSkeleton,
    })),
  { ssr: false }
);

type TabValue = "public" | "saved" | "my";

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>(
    (searchParams.get("tab") as TabValue) || "my"
  );
  const [savedQuizIds, setSavedQuizIds] = useLocalStorage<string[]>(
    "saved-quizzes",
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [filters, setFilters] = useState<IQuizFilters>({
    search: "",
    category: "",
    difficulty: "",
    tags: [],
    sortBy: "newest",
    page: 1,
    limit: 12,
  });

  // Fetch quizzes based on active tab and filters
  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      let result;

      switch (activeTab) {
        case "saved":
          result = await quizService.getMySavedQuizzes();
          break;
        case "my":
          result = await quizService.getMyQuizzes();
          break;
        default:
          result = await quizService.getQuizzes();
          break;
      }

      if (result?.meta?.code === SUCCESS_CODE && result.data) {
        setQuizzes(result.data);
      } else {
        console.error("Failed to fetch quizzes:", result.error);
        setQuizzes([]);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters]);

  // Fetch quizzes when tab or filters change
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Filter quizzes for saved tab (client-side filtering for saved quizzes)
  const filteredQuizzes = useMemo(() => {
    // Remove the saved tab filtering since API returns the correct data
    return quizzes;
  }, [quizzes]);

  // Quiz action handlers
  const handleSaveQuiz = useCallback(
    async (quizId: string) => {
      try {
        const isSaved = savedQuizIds.includes(quizId);

        if (isSaved) {
          const result = await quizService.unsaveQuiz(quizId);
          if (result.meta?.code === SUCCESS_CODE) {
            setSavedQuizIds((prev) => prev.filter((id) => id !== quizId));
            // Refresh saved quizzes if on saved tab
            if (activeTab === "saved") {
              fetchQuizzes();
            }
          }
        } else {
          const result = await quizService.saveQuiz(quizId);
          if (result.meta?.code === SUCCESS_CODE) {
            setSavedQuizIds((prev) => [...prev, quizId]);
          }
        }
      } catch (error) {
        console.error("Error saving/unsaving quiz:", error);
      }
    },
    [savedQuizIds, setSavedQuizIds, activeTab, fetchQuizzes]
  );

  const handleEditQuiz = useCallback((quizId: string) => {
    window.location.href = `/create/${quizId}`;
  }, []);

  const handleDeleteQuiz = useCallback(
    async (quizId: string) => {
      if (window.confirm("Are you sure you want to delete this quiz?")) {
        try {
          const result = await quizService.deleteQuiz(quizId);
          if (result.success) {
            // Refresh the quiz list
            fetchQuizzes();
          } else {
            console.error("Failed to delete quiz:", result.error);
          }
        } catch (error) {
          console.error("Error deleting quiz:", error);
        }
      }
    },
    [fetchQuizzes]
  );

  const handleShareQuiz = useCallback((quizId: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/content/${quizId}`
    );
    // You could add a toast notification here
  }, []);

  const handleAnalyticsQuiz = useCallback(
    (quizId: string) => {
      router.push(`/quiz/${quizId}/analytics`);
    },
    [router]
  );

  const handleTabChange = useCallback(
    (value: string) => {
      const newTab = value as TabValue;
      setActiveTab(newTab);
      setFilters((prev) => ({ ...prev, page: 1 })); // Reset to first page

      // Update URL with new tab
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", newTab);
      router.push(`/library?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleFiltersChange = useCallback(
    (newFilters: Partial<IQuizFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    },
    []
  );

  // Render functions
  const renderEmptyState = useCallback(
    (title: string, description: string) => (
      <div className="text-center py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
    ),
    []
  );

  const renderQuizGrid = useCallback(
    (
      quizzes: IQuiz[],
      showSaveButton: boolean,
      showManageButtons: boolean,
      showAnalyticsButton = false
    ) => {
      if (isLoading) {
        return <LoadingSkeleton count={6} />;
      }

      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        const emptyStateConfig = {
          saved: {
            title: "No saved quizzes",
            description:
              "Save quizzes from the public library to access them quickly here.",
          },
          my: {
            title: "No quizzes created",
            description:
              "Start creating your own quizzes to share with the community.",
          },
          public: {
            title: "No public quizzes",
            description: "Check back later for new quizzes from the community.",
          },
        };

        const config = emptyStateConfig[activeTab];
        return renderEmptyState(config.title, config.description);
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            if (!quiz?.id) return null;

            return (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                showSaveButton={showSaveButton}
                showManageButtons={showManageButtons}
                showAnalyticsButton={showAnalyticsButton}
                onSave={handleSaveQuiz}
                onEdit={handleEditQuiz}
                onDelete={handleDeleteQuiz}
                onShare={handleShareQuiz}
                onAnalytics={handleAnalyticsQuiz}
                isSaved={savedQuizIds.includes(quiz.id)}
              />
            );
          })}
        </div>
      );
    },
    [
      isLoading,
      activeTab,
      savedQuizIds,
      handleSaveQuiz,
      handleEditQuiz,
      handleDeleteQuiz,
      handleShareQuiz,
      handleAnalyticsQuiz,
      renderEmptyState,
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Quiz Library"
          description="Discover, save, and manage English learning quizzes"
          className="mb-6"
        />

        <SearchAndFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          className="mb-6"
        />

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="bg-gray-100 border border-gray-200 mb-6">
            <TabsTrigger
              value="public"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-600 text-gray-600"
            >
              Public Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-600 text-gray-600"
            >
              Saved Quizzes (
              {activeTab === "saved" ? quizzes.length : savedQuizIds.length})
            </TabsTrigger>
            <TabsTrigger
              value="my"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-600 text-gray-600"
            >
              My Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="mt-0">
            {renderQuizGrid(filteredQuizzes, true, false)}
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            {renderQuizGrid(filteredQuizzes, true, false)}
          </TabsContent>

          <TabsContent value="my" className="mt-0">
            {renderQuizGrid(filteredQuizzes, false, true, true)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
