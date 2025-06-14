"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Settings,
  Library,
  Plus,
  Clock,
  Star,
  Users,
  Timer,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import TestHeader from "./TestHeader";
import AutoSaveInfo from "./AutoSaveInfo";
import TestSettings from "./TestSettings";
import TestQuestions from "./TestQuestions";
import { ErrorState, LoadingState, NotFoundState } from "./LoadingStates";
import QuestionFormModal from "./QuestionFormModal";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { quizService } from "@/lib/services/quiz-service";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Types
import type { Question, TestData } from "@/lib/types/quiz-types";

// Utility functions
import {
  convertQuestionType,
  convertDifficulty,
  convertNavigationMode,
  mapApiQuestions,
  convertToApiQuestionType,
  convertToApiDifficulty,
  convertToApiNavigationMode,
  mapToApiQuestions,
  updateQuiz,
} from "@/lib/utils/quiz-mapping";

interface CreateTestPageContentProps {
  quizId: string;
}

const QuizPreviewModal = ({
  isOpen,
  onClose,
  testData,
}: {
  isOpen: boolean;
  onClose: () => void;
  testData: TestData;
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(0);
  const questionNavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (testData.questions.length > 0) {
      setProgress(((currentQuestion + 1) / testData.questions.length) * 100);
    }
  }, [currentQuestion, testData.questions.length]);

  const scrollQuestionNav = (direction: "left" | "right") => {
    if (questionNavRef.current) {
      const scrollAmount = 200;
      questionNavRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleQuestionNavigation = (questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < testData.questions.length) {
      setCurrentQuestion(questionIndex);
    }
  };

  const handleNext = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getQuestionTypeDisplay = (type: string) => {
    return type
      .replace(/-/g, " ")
      .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
  };

  if (!isOpen) return null;

  const currentQState = testData.questions[currentQuestion] || null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-white">
              Quiz Preview: {testData.name}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {testData.hasTimer && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-blue-900/50 text-blue-200">
                  <Timer className="h-4 w-4" />
                  <span className="font-mono font-semibold">
                    {testData.timeLimit}:00
                  </span>
                </div>
              )}
              <Badge
                variant="outline"
                className="border-purple-500 text-purple-300"
              >
                {testData.difficulty}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-gray-300">
            {testData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Quiz metadata and stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
            <div className="flex items-center text-gray-300 mb-1">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="text-white font-medium">
              {testData.timeLimit} minutes
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
            <div className="flex items-center text-gray-300 mb-1">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-xs">Questions</span>
            </div>
            <p className="text-white font-medium">
              {testData.questions.length}
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
            <div className="flex items-center text-gray-300 mb-1">
              <Star className="h-4 w-4 mr-2" />
              <span className="text-xs">Passing Score</span>
            </div>
            <p className="text-white font-medium">{testData.passingScore}%</p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
            <div className="flex items-center text-gray-300 mb-1">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-xs">Navigation</span>
            </div>
            <p className="text-white font-medium">
              {testData.navigationMode.replace(/-/g, " ")}
            </p>
          </div>
        </div>

        {/* Progress and question navigation */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              Question {currentQuestion + 1} of {testData.questions.length}
            </span>
            <Badge variant="outline" className="border-teal-500 text-teal-300">
              Preview Mode
            </Badge>
          </div>
          <Progress value={progress} className="h-2 bg-gray-700" />

          {/* Question navigation */}
          <div className="space-y-3">
            <div className="relative">
              <div
                ref={questionNavRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                style={{ scrollbarWidth: "thin" }}
              >
                {testData.questions.map((q, index) => {
                  const questionNumber = index + 1;
                  const isCurrent = currentQuestion === index;
                  return (
                    <button
                      key={q.id || index}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`
                        flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all
                        ${
                          isCurrent
                            ? "border-teal-600 bg-teal-600 text-white shadow-lg ring-2 ring-teal-300/30 ring-offset-1 ring-offset-gray-800"
                            : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600"
                        }
                      `}
                      title={`Question ${questionNumber}`}
                    >
                      {questionNumber}
                    </button>
                  );
                })}
              </div>
              {testData.questions.length > 8 && (
                <>
                  <button
                    onClick={() => scrollQuestionNav("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-8 h-8 rounded-full bg-gray-700/80 backdrop-blur-sm border border-gray-600 shadow-md flex items-center justify-center hover:bg-gray-600 z-10"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-300" />
                  </button>
                  <button
                    onClick={() => scrollQuestionNav("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 w-8 h-8 rounded-full bg-gray-700/80 backdrop-blur-sm border border-gray-600 shadow-md flex items-center justify-center hover:bg-gray-600 z-10"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Question display */}
        {currentQState && (
          <Card className="border-gray-600 mb-6 bg-gray-700/50 shadow-lg text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">
                  {currentQState.text}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="border-teal-500 text-teal-300"
                  >
                    {getQuestionTypeDisplay(currentQState.type)}
                  </Badge>
                  <Badge
                    className={getDifficultyBadgeClass(
                      currentQState.difficulty
                    )}
                  >
                    {currentQState.difficulty}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-gray-300">
                {currentQState.category} • {currentQState.points}{" "}
                {currentQState.points === 1 ? "point" : "points"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentQState.imageUrl && (
                <div className="mb-4 max-w-md mx-auto">
                  <img
                    src={currentQState.imageUrl}
                    alt="Question visual aid"
                    className="max-w-full h-auto rounded-lg border border-gray-600 shadow-sm"
                  />
                </div>
              )}

              {currentQState.type === "multiple-choice" &&
                currentQState.options && (
                  <div className="space-y-3">
                    {currentQState.options.map((option, idx) => (
                      <div
                        key={option.id || idx}
                        className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg bg-gray-800/50 hover:bg-gray-700/50"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-500">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              option.isCorrect ? "bg-teal-500" : ""
                            }`}
                          ></div>
                        </div>
                        <span>{option.text}</span>
                        {option.isCorrect && (
                          <Badge className="ml-auto bg-teal-500/20 text-teal-300 border-teal-500/30">
                            Correct Answer
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {currentQState.type === "fill-in-the-blank" && (
                <div className="space-y-4">
                  <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-600">
                    <p className="text-lg font-medium text-gray-200 leading-relaxed">
                      {currentQState.text
                        .split("_____")
                        .map((part, index, array) => (
                          <span key={index}>
                            {part}
                            {index < array.length - 1 && (
                              <span className="mx-2 px-3 py-1 border border-teal-500/50 bg-teal-500/10 rounded min-w-[120px] text-center text-teal-300 inline-block">
                                {currentQState.correctAnswers?.[index] ||
                                  "answer"}
                              </span>
                            )}
                          </span>
                        ))}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    Correct answers: {currentQState.correctAnswers?.join(", ")}
                  </div>
                </div>
              )}

              {currentQState.type === "pronunciation" && (
                <div className="space-y-6">
                  <div className="bg-indigo-900/30 p-6 rounded-lg border border-indigo-800/50">
                    <h3 className="font-medium text-indigo-300 mb-2">
                      Text to pronounce:
                    </h3>
                    <p className="text-xl font-semibold text-white mb-1 leading-relaxed">
                      {currentQState.pronunciationText}
                    </p>
                  </div>
                </div>
              )}

              {currentQState.audioUrl && (
                <div className="mt-4 p-4 bg-blue-900/30 border border-blue-800/50 rounded-lg">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-300 hover:bg-blue-950"
                    >
                      <Play className="h-4 w-4 mr-2" /> Play Audio
                    </Button>
                    <span className="ml-3 text-sm text-blue-300">
                      Audio available for this question
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            className="border-gray-500 text-gray-300 hover:bg-gray-700"
            disabled={currentQuestion === 0}
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-5 w-5 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Close Preview
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={currentQuestion === testData.questions.length - 1}
            onClick={handleNext}
          >
            Next <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function CreateTestPageContent({
  quizId,
}: CreateTestPageContentProps) {
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizNotFound, setQuizNotFound] = useState(false);

  const [testData, setTestData] = useState<TestData>({
    id: "",
    name: "",
    description: "",
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalPoints: 0,
    estimatedDuration: 0,
    tags: [],
    isPublic: false,
    version: 1,
    status: "draft",
    // Enhanced quiz settings with defaults
    navigationMode: "free-navigation",
    hasTimer: false,
    timeLimit: 30,
    warningTime: 5,
    allowQuestionPicker: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showProgress: true,
    allowPause: true,
    maxAttempts: 3,
    passingScore: 70,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: "multiple-choice",
    text: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    points: 1,
    difficulty: "beginner",
    category: "General",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // File upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const [activeTab, setActiveTab] = useState("settings");

  // Add debounced test data
  const debouncedTestData = useDebounce(testData, 60 * 1000);

  // Add questionLibrary state
  const [questionLibrary, setQuestionLibrary] = useState<Question[]>([
    {
      id: "lib-1",
      text: "What is the capital of France?",
      type: "multiple-choice",
      points: 5,
      difficulty: "beginner",
      category: "Geography",
      options: [
        { text: "Paris", isCorrect: true },
        { text: "London", isCorrect: false },
        { text: "Berlin", isCorrect: false },
        { text: "Madrid", isCorrect: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "lib-2",
      text: "Fill in the blank: The sun ____ in the east.",
      type: "fill-in-the-blank",
      points: 3,
      difficulty: "beginner",
      category: "Grammar",
      correctAnswers: ["rises"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "lib-3",
      text: "Pronounce the following word: 'Entrepreneur'",
      type: "pronunciation",
      points: 4,
      difficulty: "intermediate",
      category: "Pronunciation",
      pronunciationText: "Entrepreneur",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Update the useEffect that loads quiz data to handle the new API response format
  useEffect(() => {
    const loadQuizData = async () => {
      if (!quizId) {
        setLoadError("No quiz ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        console.log(`🔄 Loading quiz with ID: ${quizId}`);

        const response = await quizService.getQuizById(quizId);

        if (!response || !response.meta || response.meta.code !== 200000) {
          console.log(`❌ Quiz not found or API error: ${quizId}`);
          setQuizNotFound(true);
          setIsLoading(false);
          return;
        }

        const quizData = response.data;

        if (!quizData) {
          console.log(`❌ Quiz data is missing: ${quizId}`);
          setQuizNotFound(true);
          setIsLoading(false);
          return;
        }

        // Map API data to component state
        const mappedTestData: TestData = {
          id: quizData.id,
          name: quizData.title || "",
          description: quizData.description || "",
          questions: quizData.questions
            ? mapApiQuestions(quizData.questions)
            : [],
          createdAt: quizData.createdAt || new Date().toISOString(),
          updatedAt: quizData.updatedAt || new Date().toISOString(),
          totalPoints: quizData.questions
            ? quizData.questions.reduce(
                (sum: number, q: any) => sum + (q.points || 0),
                0
              )
            : 0,
          estimatedDuration:
            quizData.duration ||
            Math.max((quizData.questions?.length || 0) * 2, 5),
          tags: quizData.tags || [],
          isPublic: quizData.status === "PUBLISHED",
          authorId: quizData.authorId || null,
          version: 1,
          status: quizData.status?.toLowerCase() || "draft",
          // Enhanced quiz settings with defaults or API values
          navigationMode: convertNavigationMode(
            quizData.navigationMode || "FREE_NAVIGATION"
          ),
          hasTimer: quizData.hasTimer || false,
          timeLimit: quizData.timeLimit || 30,
          warningTime: quizData.warningTime || 5,
          allowQuestionPicker: quizData.allowQuestionPicker !== false,
          shuffleQuestions: quizData.shuffleQuestions || false,
          shuffleAnswers: quizData.shuffleAnswers || false,
          showProgress: quizData.showProgress !== false,
          allowPause: quizData.allowPause !== false,
          maxAttempts: quizData.maxAttempts || 3,
          passingScore: quizData.passingScore || 70,
        };

        console.log(
          `✅ Quiz loaded: ${mappedTestData.name} with ${mappedTestData.questions.length} questions`
        );

        setTestData(mappedTestData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading quiz:", error);
        setLoadError("Failed to load quiz data. Please try again.");
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [quizId]);

  const addFromLibrary = (question: Question) => {
    // Prevent adding duplicates from the library
    const newQuestion = {
      ...question,
      id: null,
    };

    setTestData({
      ...testData,
      questions: [...testData.questions, newQuestion],
    });

    // Optionally close the library modal after adding
    setIsLibraryOpen(false);
  };

  const handleSaveQuestion = () => {
    // Basic validation can be added here if needed
    const newErrors: Record<string, string> = {};
    if (!currentQuestion.text?.trim()) {
      newErrors.text = "Question text is required.";
    }
    // ... more validation

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingQuestion) {
      // Update existing question
      const updatedQuestions = testData.questions.map((q) =>
        q.id === editingQuestion.id
          ? ({ ...q, ...currentQuestion } as Question)
          : q
      );
      setTestData({ ...testData, questions: updatedQuestions });
    } else {
      // Add new question
      const newQuestion: Question = {
        id: null,
        type: currentQuestion.type || "multiple-choice",
        text: currentQuestion.text || "",
        options: currentQuestion.options || [],
        points: currentQuestion.points || 1,
        difficulty: currentQuestion.difficulty || "beginner",
        category: currentQuestion.category || "",
        ...currentQuestion,
      };
      setTestData({
        ...testData,
        questions: [...testData.questions, newQuestion],
      });
    }
    closeModal();
  };

  // Auto-save functionality
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout;

    const autoSave = async () => {
      if (!autoSaveEnabled || !testData.id || isSaving) return;

      try {
        console.log("🔄 Auto-saving quiz...");
        setIsSaving(true);

        await updateQuiz(testData);

        setLastSaved(new Date());
        setIsSaving(false);
        console.log("✅ Auto-save completed");
      } catch (error) {
        console.error("Auto-save failed:", error);
        setIsSaving(false);
      }
    };

    if (autoSaveEnabled && debouncedTestData.id) {
      autoSaveTimer = setTimeout(autoSave, 30 * 1000);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [debouncedTestData, autoSaveEnabled, isSaving]);

  const saveTest = async (publish = false, exit = false) => {
    if (!testData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test name before saving.",
        variant: "destructive",
      });
      return;
    }

    if (publish && testData.questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question before publishing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      console.log("testData:: ", testData);
      const updatedTestData = {
        ...testData,
        status: publish ? "published" : "draft",
        isPublic: publish,
      };

      const response = await updateQuiz(updatedTestData);

      // Check if the update was successful
      if (response && response.meta && response.meta.code === 200000) {
        setLastSaved(new Date());

        // If we have response data, update our local state to match the server
        if (response.data) {
          try {
            // Reload the quiz data to ensure consistency
            const refreshResponse = await quizService.getQuizById(quizId);

            if (
              refreshResponse?.meta?.code === 200000 &&
              refreshResponse.data
            ) {
              const quizData = refreshResponse.data;
              const mappedTestData: TestData = {
                id: quizData.id,
                name: quizData.title || "",
                description: quizData.description || "",
                questions: quizData.questions
                  ? mapApiQuestions(quizData.questions)
                  : [],
                createdAt: quizData.createdAt || new Date().toISOString(),
                updatedAt: quizData.updatedAt || new Date().toISOString(),
                totalPoints: quizData.questions
                  ? quizData.questions.reduce(
                      (sum: number, q: any) => sum + (q.points || 0),
                      0
                    )
                  : 0,
                estimatedDuration:
                  quizData.duration ||
                  Math.max((quizData.questions?.length || 0) * 2, 5),
                tags: quizData.tags || [],
                isPublic: quizData.status === "PUBLISHED",
                authorId: quizData.authorId || null,
                version: 1,
                status: quizData.status?.toLowerCase() || "draft",
                navigationMode: convertNavigationMode(
                  quizData.navigationMode || "FREE_NAVIGATION"
                ),
                hasTimer: quizData.hasTimer || false,
                timeLimit: quizData.timeLimit || 30,
                warningTime: quizData.warningTime || 5,
                allowQuestionPicker: quizData.allowQuestionPicker !== false,
                shuffleQuestions: quizData.shuffleQuestions || false,
                shuffleAnswers: quizData.shuffleAnswers || false,
                showProgress: quizData.showProgress !== false,
                allowPause: quizData.allowPause !== false,
                maxAttempts: quizData.maxAttempts || 3,
                passingScore: quizData.passingScore || 70,
              };

              setTestData(mappedTestData);
            }
          } catch (refreshError) {
            console.error("Error refreshing quiz data:", refreshError);
            // Continue with success flow even if refresh fails
          }
        }

        toast({
          title: publish ? "Quiz Published" : "Quiz Saved",
          description: `"${testData.name}" has been ${
            publish ? "published" : "saved"
          } successfully.`,
        });

        // If exit is true, navigate back to the quiz list
        if (exit) {
          window.location.href = "/create";
        }
      } else {
        throw new Error(
          response?.meta?.message || "Failed to save quiz. Please try again."
        );
      }
    } catch (error) {
      console.error("Error saving test:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetModal = () => {
    setCurrentQuestion({
      type: "multiple-choice",
      text: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      points: 1,
      difficulty: "beginner",
      category: "General",
    });
    setEditingQuestion(null);
    setErrors({});
    setUploadedFiles({});
  };

  const openAddModal = () => {
    resetModal();
    setIsModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setCurrentQuestion({ ...question });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetModal();
  };

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...testData.questions];
    if (direction === "up" && index > 0) {
      // Swap with the previous question
      [newQuestions[index - 1], newQuestions[index]] = [
        newQuestions[index],
        newQuestions[index - 1],
      ];
    } else if (direction === "down" && index < newQuestions.length - 1) {
      // Swap with the next question
      [newQuestions[index], newQuestions[index + 1]] = [
        newQuestions[index + 1],
        newQuestions[index],
      ];
    }
    setTestData({
      ...testData,
      questions: newQuestions,
    });
  };

  const deleteQuestion = (id: string) => {
    setTestData({
      ...testData,
      questions: testData.questions.filter((q) => q.id !== id),
    });
  };

  const handleTestInfoChange = (
    field: keyof TestData,
    value: string | boolean | number
  ) => {
    setTestData({
      ...testData,
      [field]: value,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return <div className="i-lucide-list-checks h-4 w-4" />;
      case "fill-in-the-blank":
        return <div className="i-lucide-text-cursor-input h-4 w-4" />;
      case "essay":
        return <div className="i-lucide-file-text h-4 w-4" />;
      case "pronunciation":
        return <div className="i-lucide-mic h-4 w-4" />;
      case "listening":
        return <div className="i-lucide-headphones h-4 w-4" />;
      default:
        return <div className="i-lucide-help-circle h-4 w-4" />;
    }
  };

  if (quizNotFound) {
    return <NotFoundState />;
  }

  if (loadError) {
    return <ErrorState message={loadError} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen grainy-gradient-bg animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(65,70,120,0.4),rgba(20,20,50,0.6))] -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:24px_24px] -z-10"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"></div>
      <div
        className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <TestHeader
            testName={testData.name}
            testDescription={testData.description}
            questionsCount={testData.questions.length}
            isSaving={isSaving}
            onPreview={openPreview}
            onSave={() => saveTest()}
            onPublish={() => saveTest(true)}
          />

          <AutoSaveInfo
            lastSaved={lastSaved}
            autoSaveEnabled={autoSaveEnabled}
            onToggleAutoSave={setAutoSaveEnabled}
          />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-gray-800/50 border border-gray-700">
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Questions ({testData.questions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-0">
              <TestSettings
                testData={testData}
                onTestInfoChange={handleTestInfoChange}
              />
            </TabsContent>

            <TabsContent value="questions" className="space-y-0">
              <TestQuestions
                questions={testData.questions}
                onAddQuestion={openAddModal}
                onOpenLibrary={() => setIsLibraryOpen(true)}
                onEditQuestion={openEditModal}
                onDeleteQuestion={deleteQuestion}
                onMoveQuestion={moveQuestion}
                getDifficultyColor={getDifficultyColor}
                getQuestionTypeIcon={getQuestionTypeIcon}
              />

              {/* Add Question Library Dialog */}
              <div className="flex gap-2">
                <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-teal-500 text-teal-600 hover:bg-teal-50"
                    >
                      <Library className="h-4 w-4 mr-2" />
                      Question Library
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Question Library</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {questionLibrary.map((question) => (
                        <Card
                          key={question.id + (question.createdAt || "")}
                          className="border-gray-200"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge
                                    className={getDifficultyColor(
                                      question.difficulty
                                    )}
                                  >
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="outline">
                                    {question.category}
                                  </Badge>
                                  <Badge variant="outline">
                                    {question.points} pts
                                  </Badge>
                                </div>
                                <p className="text-gray-700 mb-2">
                                  {question.text}
                                </p>
                                <div className="text-sm text-gray-500">
                                  Type: {question.type.replace("-", " ")}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addFromLibrary(question)}
                                className="bg-teal-600 hover:bg-teal-700 text-white"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Question Form Modal */}
      {isModalOpen && (
        <QuestionFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          editingQuestion={editingQuestion}
          errors={errors}
          setErrors={setErrors}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          isUploadingImage={isUploadingImage}
          isUploadingAudio={isUploadingAudio}
          onSave={handleSaveQuestion}
        />
      )}

      <QuizPreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        testData={testData}
      />
    </div>
  );
}
