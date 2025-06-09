"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/ui/lesson-card";
import { SearchInput } from "@/components/ui/search-input";
import { ContentGrid } from "@/components/ui/content-grid";
import { StatsGrid } from "@/components/ui/stats-grid";
import { COMMUNITY_STATS, SUCCESS_CODE } from "@/lib/constants";
import {
  Play,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Globe,
  Star,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { quizService } from "@/lib/services/quiz-service";
import type { IQuiz } from "@/lib/types/api-types";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

export default function HomePage() {
  const [featuredQuizzes, setFeaturedQuizzes] = useState<IQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedQuizIds, setSavedQuizIds] = useLocalStorage<string[]>(
    "saved-quizzes",
    []
  );

  const handleSaveQuiz = useCallback(
    async (quizId: string) => {
      try {
        const isSaved = savedQuizIds.includes(quizId);

        if (isSaved) {
          const result = await quizService.unsaveQuiz(quizId);
          if (result.meta?.code === SUCCESS_CODE) {
            setSavedQuizIds((prev) => prev.filter((id) => id !== quizId));
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
    [savedQuizIds, setSavedQuizIds]
  );

  useEffect(() => {
    const fetchFeaturedQuizzes = async () => {
      try {
        const response = await quizService.getQuizzes({
          isPublic: true,
          limit: 6,
          sortBy: "popularity",
        });
        if (response.meta.code === SUCCESS_CODE && response.data) {
          setFeaturedQuizzes(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch featured quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedQuizzes();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-purple-700/90 to-indigo-800/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:30px_30px] opacity-20"></div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  Trusted by 50,000+ learners worldwide
                </div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Master English with
                  <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Interactive Learning
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-purple-100 leading-relaxed max-w-2xl">
                  Improve your English skills through engaging lessons,
                  pronunciation practice, and personalized feedback. Join
                  thousands of learners worldwide.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/library?tab=public">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Learning Free
                  </Button>
                </Link>
                <Link href="/library?tab=public">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Browse Lessons
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 text-purple-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm">No Credit Card Required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-300" />
                  <span className="text-sm">Available Worldwide</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/images/hero-learning.png"
                  alt="Students learning English online"
                  className="rounded-2xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-300"
                />
                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 bg-white rounded-lg p-3 shadow-lg animate-float">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Live Lessons
                    </span>
                  </div>
                </div>
                <div
                  className="absolute -bottom-4 -right-4 bg-white rounded-lg p-3 shadow-lg animate-float"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Certified
                    </span>
                  </div>
                </div>
              </div>
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl blur-3xl opacity-20 transform scale-110"></div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(248 250 252)"
            />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Search Section */}
        <section className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Find Your Perfect Lesson
          </h2>
          <p className="text-gray-600">
            Search through thousands of interactive English lessons
          </p>
          <SearchInput
            placeholder="Search lessons, grammar topics, vocabulary..."
            onChange={(value) => console.log("Search:", value)}
          />
        </section>

        {/* Featured Lessons */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Featured Lessons
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your English learning journey with our most popular and
              effective lessons
            </p>
          </div>

          <ContentGrid>
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                Loading featured lessons...
              </div>
            ) : featuredQuizzes?.length > 0 ? (
              featuredQuizzes?.map((quiz) => (
                <LessonCard
                  key={quiz.id}
                  id={quiz.id}
                  title={quiz.title}
                  description={quiz.description}
                  creator={quiz.author?.name || "Unknown"}
                  participants={quiz.participants || 0}
                  rating={quiz.rating || 0}
                  duration={`${quiz.duration || 0} min`}
                  level={quiz.difficulty || "All Levels"}
                  type="Quiz"
                  icon={BookOpen}
                  isPublic={quiz.isPublic}
                  isSaved={savedQuizIds.includes(quiz.id)}
                  onSave={handleSaveQuiz}
                  showSaveButton={true}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                No featured lessons available
              </div>
            )}
          </ContentGrid>

          <div className="text-center">
            <Link href="/library?tab=public">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3"
              >
                View All Quizzes
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-8 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  Why Choose OneStudy?
                </h2>
                <p className="text-xl text-gray-600">
                  Experience the most effective way to learn English with our
                  innovative platform
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Interactive Lessons
                    </h3>
                    <p className="text-gray-600">
                      Engage with dynamic content that adapts to your learning
                      style and pace
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Global Community
                    </h3>
                    <p className="text-gray-600">
                      Connect with learners worldwide and practice with native
                      speakers
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Track Progress
                    </h3>
                    <p className="text-gray-600">
                      Monitor your improvement with detailed analytics and
                      personalized insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="/images/students-learning.png"
                alt="Students collaborating and learning"
                className="rounded-2xl shadow-xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </section>

        {/* Learning Stats */}
        <section className="bg-white rounded-3xl p-8 md:p-16 shadow-lg border border-gray-100">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Join Our Learning Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thousands of students are already improving their English skills
              with our interactive platform
            </p>
          </div>

          <StatsGrid>
            {COMMUNITY_STATS.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl"
              >
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </StatsGrid>

          <div className="text-center mt-12">
            <img
              src="/images/online-learning.png"
              alt="Online learning platform"
              className="rounded-2xl shadow-xl mx-auto max-w-2xl w-full h-auto"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 md:p-16 text-white">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Start Your English Journey?
            </h2>
            <p className="text-xl text-purple-100">
              Join thousands of learners who have already improved their English
              skills with OneStudy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/library?tab=public">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/library?tab=public">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
                >
                  Try a Lesson
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
