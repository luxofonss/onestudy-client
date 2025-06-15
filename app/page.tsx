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
  Microchip,
  MicroscopeIcon,
  Mic,
  Sparkles,
  ArrowRight,
  Loader2,
  RocketIcon,
  Voicemail,
  MicrochipIcon,
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
    <div className="animate-fade-in grainy-gradient-bg">
      {/* Modern Hero Section with Gradient Background */}
      <section className="relative overflow-hidden isolate pt-12 md:pt-8">
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white space-y-8 md:pr-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium border border-white/15 shadow-lg hover:bg-white/20 transition-all cursor-pointer group">
                  <Sparkles className="h-4 w-4 mr-2 text-amber-300 group-hover:text-amber-200 transition-colors" />
                  <span className="text-white/90">Better with</span>
                  <span className="ml-2 gradient-text font-semibold">
                    OneStudy
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                  Master English with
                  <span className="block gradient-text-pink mt-2 pb-2">
                    Interactive Learning
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl">
                  Master English with interactive quizzes, pronunciation
                  practice, and personalized feedback. Join thousands of
                  learners worldwide on their language journey.
                </p>
              </div>

              <div className="flex gap-8">
                <Link href="/pronunciation-test">
                  <Button
                    size="sm"
                    className="px-5 py-5 shadow-md hover:shadow-lg transition-all"
                  >
                    <MicrochipIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Test Your Pronunciation</span>
                  </Button>
                </Link>
                <Link href="/pronunciation-test">
                  <Button
                    size="sm"
                    className="gradient-button px-5 py-5 shadow-md hover:shadow-lg transition-all"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span className="font-medium">Start Quiz</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 text-gray-200 mt-6 pt-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-full bg-green-500/20">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="text-sm">Create & Share Custom Quizzes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-full bg-purple-500/20">
                    <Globe className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-sm">Learn Anytime, Anywhere</span>
                </div>
              </div>
            </div>

            {/* Hero Image - Floating Cards */}
            <div className="relative">
              <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-6">
                {/* Example Card 1 */}
                <div className="card-glass-dark p-4 hover:translate-y-[-5px] hover:shadow-2xl hover:glow-border glow-purple animate-float shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Mic className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-white text-sm font-medium">
                      Pronunciation Test
                    </span>
                  </div>
                  <div className="h-24 rounded-md bg-purple-500/10 flex items-center justify-center p-3">
                    <span className="text-xs text-gray-400 text-center">
                      AI-powered pronunciation analysis to perfect your accent
                    </span>
                  </div>
                </div>

                {/* Example Card 2 */}
                <div
                  className="card-glass-dark p-4 hover:translate-y-[-5px] hover:shadow-2xl hover:glow-border glow-blue animate-float shadow-xl transition-all duration-300"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-white text-sm font-medium">
                      Vocabulary Builder
                    </span>
                  </div>
                  <div className="h-24 rounded-md bg-blue-500/10 flex items-center justify-center p-3">
                    <span className="text-xs text-gray-400 text-center">
                      Expand your vocabulary with personalized learning paths
                    </span>
                  </div>
                </div>

                {/* Example Card 3 */}
                <div
                  className="card-glass-dark p-4 hover:translate-y-[-5px] hover:shadow-2xl hover:glow-border glow-pink animate-float shadow-xl transition-all duration-300"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-pink-400" />
                    </div>
                    <span className="text-white text-sm font-medium">
                      Community Quizzes
                    </span>
                  </div>
                  <div className="h-24 rounded-md bg-pink-500/10 flex items-center justify-center p-3">
                    <span className="text-xs text-gray-400 text-center">
                      Learn from community-created resources and challenges
                    </span>
                  </div>
                </div>

                {/* Example Card 4 */}
                <div
                  className="card-glass-dark p-4 hover:translate-y-[-5px] hover:shadow-2xl hover:glow-border glow-blue animate-float shadow-xl transition-all duration-300"
                  style={{ animationDelay: "1.5s" }}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="text-white text-sm font-medium">
                      Progress Tracking
                    </span>
                  </div>
                  <div className="h-24 rounded-md bg-indigo-500/10 flex items-center justify-center p-3">
                    <span className="text-xs text-gray-400 text-center">
                      Track your learning journey with detailed analytics
                    </span>
                  </div>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/40 via-blue-500/30 to-pink-500/40 rounded-3xl blur-3xl opacity-40 -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-20 relative z-10">
        {/* Featured Lessons */}
        <section className="space-y-12 pt-8">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              <Star className="h-3.5 w-3.5 mr-2 text-amber-300" />
              <span className="text-gray-200">Popular Resources</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Quizzes Library
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Start your English learning journey with our most popular and
              effective quizzes curated by language experts
            </p>
          </div>

          <ContentGrid className="mt-10">
            {isLoading ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                <p>Loading featured lessons...</p>
              </div>
            ) : featuredQuizzes?.length > 0 ? (
              featuredQuizzes
                ?.slice(0, 6)
                ?.map((quiz) => (
                  <LessonCard
                    key={quiz.id}
                    id={quiz.id}
                    title={quiz.title}
                    description={quiz.description}
                    creator={quiz.author?.name || "Unknown"}
                    participants={quiz.participants || 0}
                    rating={quiz.rating || 0}
                    timeLimit={`${quiz.timeLimit || 0} min`}
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
              <div className="col-span-full text-center py-16 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-500" />
                </div>
                <p>No featured lessons available</p>
                <Button
                  variant="link"
                  className="text-purple-400 hover:text-purple-300 mt-2"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </div>
            )}
          </ContentGrid>

          <div className="text-center pt-6">
            <Link href="/library?tab=public">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 hover:border-purple-500 text-purple-300 hover:bg-purple-500/20 px-8 py-6 shadow-md hover:shadow-lg transition-all rounded-xl"
              >
                View All Quizzes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="card-glass-dark p-8 md:p-16 rounded-3xl shadow-2xl relative isolate">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(65,70,120,0.4),rgba(20,20,50,0.6))] -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:24px_24px] -z-10"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"></div>
          <div
            className="absolute -top-32 right-32 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"
            style={{ animationDelay: "2s" }}
          ></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-[1]">
            <div className="space-y-10">
              <div className="space-y-5">
                <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                  <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-300" />
                  <span className="text-gray-200">Unique Features</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Why Choose OneStudy?
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Experience the most effective way to learn English with our
                  innovative platform
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-5 group">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                    <BookOpen className="h-7 w-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Interactive Lessons
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Engage with dynamic content that adapts to your learning
                      style and pace
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-5 group">
                  <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                    <Users className="h-7 w-7 text-green-400 group-hover:text-green-300 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Global Community
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Connect with learners worldwide and practice with native
                      speakers
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-5 group">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                    <TrendingUp className="h-7 w-7 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Track Progress
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Monitor your improvement with detailed analytics and
                      personalized insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <img
                src="/images/students-learning.png"
                alt="Students collaborating and learning"
                className="rounded-2xl shadow-2xl w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/30 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-amber-300" />
                  <span>Expert-crafted lessons</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Stats */}
        <section className="card-glass-dark rounded-3xl p-8 md:p-16 shadow-2xl relative isolate">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(65,70,120,0.4),rgba(20,20,50,0.6))] -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:24px_24px] -z-10"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"></div>
          <div
            className="absolute -top-32 right-32 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"
            style={{ animationDelay: "2s" }}
          ></div>

          <div className="max-w-3xl mx-auto space-y-10 relative z-20">
            <div className="text-center mb-14 space-y-5">
              <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <TrendingUp className="h-3.5 w-3.5 mr-2 text-blue-300" />
                <span className="text-gray-200">Growing Community</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Join Our Learning Community
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Thousands of students are already improving their English skills
                with our interactive platform
              </p>
            </div>

            <StatsGrid className="gap-4 md:gap-6">
              {COMMUNITY_STATS.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-8 bg-white/8 border border-white/15 rounded-2xl hover:bg-white/12 hover:border-white/20 hover:shadow-xl transition-all duration-300 shadow-lg group"
                >
                  <div className="text-5xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 font-medium text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </StatsGrid>

            <div className="text-center mt-16 relative group">
              <div className="relative">
                <img
                  src="/images/online-learning.png"
                  alt="Online learning platform"
                  className="rounded-2xl shadow-2xl mx-auto max-w-2xl w-full h-auto group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-700"
                />

                {/* Animated dots overlay */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
                </div>

                {/* Pulse effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-purple-500/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full px-6 py-3 shadow-xl hover:scale-105 transition-transform cursor-pointer">
                <div className="flex items-center space-x-2 text-white font-medium">
                  <Users className="h-5 w-5" />
                  <span>Join 50,000+ learners today</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center grainy-gradient-bg rounded-3xl p-8 md:p-16 text-white relative overflow-hidden shadow-2xl isolate">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(65,70,120,0.4),rgba(20,20,50,0.6))] -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:24px_24px] -z-10"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"></div>
          <div
            className="absolute -top-32 right-32 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"
            style={{ animationDelay: "2s" }}
          ></div>

          <div className="max-w-3xl mx-auto space-y-10 relative z-20">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <RocketIcon className="h-3.5 w-3.5 mr-2 text-pink-300" />
                <span className="text-gray-200">Get Started Today</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Ready to Start Your English Journey?
              </h2>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                Join thousands of learners who have already improved their
                English skills with OneStudy
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/library?tab=public" className="group">
                <Button
                  size="lg"
                  className="gradient-button px-8 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl group-hover:scale-105 transition-all duration-300"
                >
                  <span>Get Started Free</span>
                  <div className="ml-2 bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Button>
              </Link>
              <Link href="/pronunciation-test" className="group">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/15 border-white/25 text-white hover:bg-white/25 px-8 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl group-hover:scale-105 transition-all duration-300"
                >
                  <Mic className="h-5 w-5 mr-2 text-purple-300" />
                  <span>Try Pronunciation Test</span>
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8 pt-4 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Free access to basic features</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
