"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Play,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Volume2,
  ImageIcon,
  ChevronUp,
  ChevronDown,
  Library,
  FileText,
  CheckCircle,
  Clock,
  Shuffle,
  Timer,
  Settings,
  Loader2,
  ChevronRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { withAuth } from "@/lib/hooks/with-auth";
import { quizService } from "@/lib/services/quiz-service";
import { SUCCESS_CODE } from "@/lib/constants";
import { resourceService } from "@/lib/services/resource-service";
import { AudioPreview } from "@/components/ui/audio-preview";

interface Question {
  id: string;
  type:
    | "multiple-choice"
    | "pronunciation"
    | "fill-in-the-blank"
    | "essay"
    | "listening";
  text: string;
  options?: { id?: string; text: string; isCorrect: boolean }[];
  pronunciationText?: string;
  correctBlanks?: string[];
  trueFalseAnswer?: boolean;
  audioUrl?: string;
  imageUrl?: string;
  maxListeningTime?: number;
  explanation?: string;
  points: number;
  timeLimit?: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface TestData {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  totalPoints: number;
  estimatedDuration: number;
  tags: string[];
  isPublic: boolean;
  authorId: string;
  version: number;
  status: "draft" | "published";
  // Enhanced quiz settings
  navigationMode: "sequential" | "back-only" | "free-navigation";
  hasTimer: boolean;
  timeLimit: number; // in minutes
  warningTime: number; // minutes before end to show warning
  allowQuestionPicker: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showProgress: boolean;
  allowPause: boolean;
  maxAttempts: number;
  passingScore: number;
}

interface SavedTestMetadata {
  testId: string;
  questionCount: number;
  totalPoints: number;
  categories: string[];
  difficulties: string[];
  questionTypes: string[];
  hasMultimedia: boolean;
  estimatedDuration: number;
  lastSaved: string;
}
// Helper function to convert API types to component types
const convertQuestionType = (apiType: string): Question["type"] => {
  switch (apiType) {
    case "MULTIPLE_CHOICE":
      return "multiple-choice";
    case "FILL_IN_THE_BLANK":
      return "fill-in-the-blank";
    case "PRONUNCIATION":
      return "pronunciation";
    case "LISTENING":
      return "listening";
    default:
      return "multiple-choice";
  }
};

const convertDifficulty = (apiDifficulty: string): Question["difficulty"] => {
  switch (apiDifficulty?.toLowerCase()) {
    case "beginner":
      return "beginner";
    case "intermediate":
      return "intermediate";
    case "advanced":
      return "advanced";
    default:
      return "beginner";
  }
};

const convertNavigationMode = (apiMode: string): TestData["navigationMode"] => {
  switch (apiMode) {
    case "SEQUENTIAL":
      return "sequential";
    case "BACK_ONLY":
      return "back-only";
    case "FREE_NAVIGATION":
      return "free-navigation";
    default:
      return "free-navigation";
  }
};

// Map API questions to component format
const mapApiQuestions = (apiQuestions: any[]): Question[] => {
  return apiQuestions.map((apiQuestion) => {
    const question: Question = {
      id: apiQuestion.id,
      type: convertQuestionType(apiQuestion.type),
      text: apiQuestion.text,
      points: apiQuestion.points || 1,
      difficulty: convertDifficulty(apiQuestion.difficulty),
      category: apiQuestion.category || "General",
      createdAt: apiQuestion.createdAt || new Date().toISOString(),
      updatedAt: apiQuestion.updatedAt || new Date().toISOString(),
      explanation: apiQuestion.explanation || null,
      timeLimit: apiQuestion.timeLimit || null,
    };

    // Handle different question types
    if (apiQuestion.type === "MULTIPLE_CHOICE" && apiQuestion.options) {
      question.options = apiQuestion.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));
    }

    if (apiQuestion.type === "FILL_IN_THE_BLANK" && apiQuestion.correctBlanks) {
      question.correctBlanks = apiQuestion.correctBlanks;
    }

    if (
      apiQuestion.type === "TRUE_FALSE" &&
      apiQuestion.trueFalseAnswer !== null
    ) {
      question.trueFalseAnswer = apiQuestion.trueFalseAnswer;
    }

    if (apiQuestion.pronunciationText) {
      question.pronunciationText = apiQuestion.pronunciationText;
    }

    if (apiQuestion.audioUrl) {
      question.audioUrl = apiQuestion.audioUrl;
    }

    if (apiQuestion.imageUrl) {
      question.imageUrl = apiQuestion.imageUrl;
    }

    if (apiQuestion.maxListeningTime) {
      question.maxListeningTime = apiQuestion.maxListeningTime;
    }

    return question;
  });
};

// Add these new functions after the existing helper functions (convertQuestionType, convertDifficulty, etc.)

// Convert component question type to API question type
const convertToApiQuestionType = (componentType: string): string => {
  switch (componentType) {
    case "multiple-choice":
      return "MULTIPLE_CHOICE";
    case "fill-in-the-blank":
      return "FILL_IN_THE_BLANK";
    case "essay":
      return "ESSAY";
    case "pronunciation":
      return "PRONUNCIATION";
    case "listening":
      return "LISTENING";
    default:
      return "MULTIPLE_CHOICE";
  }
};

// Convert component difficulty to API difficulty
const convertToApiDifficulty = (componentDifficulty: string): string => {
  switch (componentDifficulty.toLowerCase()) {
    case "beginner":
      return "BEGINNER";
    case "intermediate":
      return "INTERMEDIATE";
    case "advanced":
      return "ADVANCED";
    default:
      return "BEGINNER";
  }
};

// Convert component navigation mode to API navigation mode
const convertToApiNavigationMode = (componentMode: string): string => {
  switch (componentMode) {
    case "sequential":
      return "SEQUENTIAL";
    case "back-only":
      return "BACK_ONLY";
    case "free-navigation":
      return "FREE_NAVIGATION";
    default:
      return "FREE_NAVIGATION";
  }
};

// Convert component questions to API format
const mapToApiQuestions = (componentQuestions: Question[]): any[] => {
  return componentQuestions.map((question) => {
    const apiQuestion: any = {
      id: question.id,
      type: convertToApiQuestionType(question.type),
      text: question.text,
      points: question.points,
      difficulty: convertToApiDifficulty(question.difficulty),
      category: question.category,
      pronunciationText: null,
      correctBlanks: null,
      trueFalseAnswer: null,
      audioUrl: question.audioUrl || null,
      imageUrl: question.imageUrl || null,
      maxListeningTime: question.maxListeningTime || null,
      explanation: question.explanation || null,
      timeLimit: question.timeLimit || null,
      options: null,
    };

    // Handle question type specific fields
    if (question.type === "multiple-choice" && question.options) {
      apiQuestion.options = question.options.map((opt) => ({
        id: opt.id || null,
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));
    }

    if (question.type === "fill-in-the-blank" && question.correctBlanks) {
      apiQuestion.correctBlanks = question.correctBlanks;
    }

    if (question.type === "pronunciation") {
      apiQuestion.pronunciationText = question.pronunciationText;
    }

    if (question.type === "listening") {
      apiQuestion.maxListeningTime = question.maxListeningTime;
    }

    return apiQuestion;
  });
};

// Function to update quiz via API
const updateQuiz = async (quizData: TestData): Promise<any> => {
  try {
    console.log("🔄 Updating quiz:", quizData.id);

    // Convert component data to API format
    const apiRequestBody = {
      id: quizData.id,
      title: quizData.name,
      description: quizData.description,
      category: null,
      difficulty: null,
      duration: quizData.estimatedDuration,
      questionCount: quizData.questions.length,
      tags: quizData.tags,
      isPublic: quizData.isPublic,
      author: null,
      rating: 0.0,
      attempts: 0,
      passingScore: quizData.passingScore,
      navigationMode: convertToApiNavigationMode(quizData.navigationMode) as
        | "SEQUENTIAL"
        | "BACK_ONLY"
        | "FREE_NAVIGATION",
      hasTimer: quizData.hasTimer,
      timeLimit: quizData.timeLimit,
      warningTime: quizData.warningTime,
      allowQuestionPicker: quizData.allowQuestionPicker,
      shuffleQuestions: quizData.shuffleQuestions,
      shuffleAnswers: quizData.shuffleAnswers,
      showProgress: quizData.showProgress,
      allowPause: quizData.allowPause,
      maxAttempts: quizData.maxAttempts,
      questions: mapToApiQuestions(quizData.questions),
      quizAttempts: null,
      savedByUsers: null,
      leaderboardEntries: null,
    };

    console.log("📤 API Request Body:", apiRequestBody);

    const response = await quizService.updateQuiz(apiRequestBody);

    if (response.meta.code === SUCCESS_CODE) {
      return {
        success: true,
        message: "Quiz updated successfully",
        quizId: quizData.id,
      };
    } else {
      throw new Error(response.meta.message || "Failed to update quiz");
    }
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

function CreateTestPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizNotFound, setQuizNotFound] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated]);

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

  // Preview state
  const [previewStarted, setPreviewStarted] = useState(false);
  const [previewCurrentQuestion, setPreviewCurrentQuestion] = useState(0);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewSelectedAnswer, setPreviewSelectedAnswer] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, string>>(
    {}
  );
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(0);

  // Question Library
  const [questionLibrary] = useState<Question[]>([
    {
      id: null,
      type: "multiple-choice",
      text: "What is the past tense of 'go'?",
      options: [
        { text: "went", isCorrect: true },
        { text: "goed", isCorrect: false },
        { text: "gone", isCorrect: false },
        { text: "going", isCorrect: false },
      ],
      points: 1,
      difficulty: "beginner",
      category: "Grammar",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: null,
      type: "fill-in-the-blank",
      text: "I _____ to the store yesterday.",
      correctAnswers: ["went"],
      points: 2,
      difficulty: "intermediate",
      category: "Grammar",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("settings");

  // Add debounced test data
  const debouncedTestData = useDebounce(testData, 60 * 1000);

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

        setTestData(mappedTestData);

        toast({
          title: "Quiz Loaded",
          description: `Successfully loaded "${
            quizData.title || "Untitled Quiz"
          }"`,
        });
      } catch (error) {
        console.error("❌ Error loading quiz:", error);
        setLoadError(
          error instanceof Error ? error.message : "Failed to load quiz"
        );

        toast({
          title: "Error",
          description: "Failed to load quiz. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [quizId]);

  // Update test metadata when questions change
  useEffect(() => {
    if (!isLoading) {
      const totalPoints = testData.questions.reduce(
        (sum, q) => sum + q.points,
        0
      );
      const estimatedDuration = Math.max(testData.questions.length * 2, 5); // 2 minutes per question, minimum 5 minutes

      setTestData((prev) => ({
        ...prev,
        totalPoints,
        estimatedDuration,
        updatedAt: new Date().toISOString(),
      }));
    }
  }, [testData.questions, isLoading]);

  // Preview timer effect
  useEffect(() => {
    if (previewStarted && testData.hasTimer && previewTimeRemaining > 0) {
      const timer = setInterval(() => {
        setPreviewTimeRemaining((prev) => {
          if (prev <= 1) {
            alert("Time's up! Quiz would be auto-submitted.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [previewStarted, testData.hasTimer, previewTimeRemaining]);

  // Auto-save effect
  useEffect(() => {
    const autoSave = async () => {
      if (!isSaving && debouncedTestData) {
        try {
          setIsSaving(true);
          await updateQuiz(debouncedTestData);
          const response = await quizService.getQuizById(quizId);

          if (response?.meta?.code === SUCCESS_CODE && response.data) {
            const quizData = response.data;
            const mappedTestData: TestData = {
              id: quizData.id || "",
              name: quizData.title || "",
              description: quizData.description || "",
              questions: quizData.questions
                ? mapApiQuestions(quizData.questions)
                : [],
              createdAt: quizData.createdAt || new Date().toISOString(),
              updatedAt: quizData.updatedAt || new Date().toISOString(),
              totalPoints:
                quizData.questions?.reduce(
                  (sum: number, q: any) => sum + (q.points || 0),
                  0
                ) || 0,
              estimatedDuration:
                quizData.duration ||
                Math.max((quizData.questions?.length || 0) * 2, 5),
              tags: quizData.tags || [],
              isPublic: quizData.isPublic || false,
              version: 1,
              status: "draft",
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
            setLastSaved(new Date());
            console.log("🔄 Auto-saved test successfully");
          }
        } catch (error) {
          console.error("Auto-save failed:", error);
          toast({
            title: "Auto-save failed",
            description:
              "Failed to save changes automatically. Please try saving manually.",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      }
    };

    autoSave();
  }, [debouncedTestData, quizId]);

  // Now update the saveTest function to use the new API flow
  const saveTest = async (publish = false, exit = false) => {
    if (!testData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test name before saving.",
        variant: "destructive",
      });
      return;
    }

    if (
      testData.questions.length === 0 &&
      (publish === true || exit === true)
    ) {
      toast({
        title: "Error",
        description: "Please add at least one question before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (publish) {
        testData.isPublic = true;
      }
      await updateQuiz(testData);
      setLastSaved(new Date());

      toast({
        title: "Success",
        description: `Test "${testData.name}" saved successfully!`,
      });

      console.log("✅ Test saved successfully");
      if (publish || exit) {
        router.push("/library?tab=my");
      }
    } catch (error) {
      console.error("❌ Save failed:", error);
      toast({
        title: "Error",
        description: "Failed to save test. Please try again.",
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

  const resetPreview = () => {
    setPreviewStarted(false);
    setPreviewCurrentQuestion(0);
    setPreviewProgress(0);
    setPreviewSelectedAnswer("");
    setPreviewAnswers({});
    setPreviewTimeRemaining(testData.hasTimer ? testData.timeLimit * 60 : 0);
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
    resetPreview();
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    resetPreview();
  };

  const startPreview = () => {
    setPreviewStarted(true);
    setPreviewProgress(0);
    if (testData.hasTimer) {
      setPreviewTimeRemaining(testData.timeLimit * 60);
    }
  };

  const handleFileUpload = (type: "image" | "audio") => {
    const input =
      type === "image" ? fileInputRef.current : audioInputRef.current;
    if (input) {
      input.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "audio"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (type === "image" && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (type === "audio" && !file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Set uploading state
    if (type === "image") {
      setIsUploadingImage(true);
    } else {
      setIsUploadingAudio(true);
    }

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload file using fetch with FormData (multipart/form-data)
      const result = await resourceService.uploadFile(file);

      if (result.meta?.code === SUCCESS_CODE && result.data) {
        const uploadedResource = result.data;

        // Update current question with the uploaded file URL
        if (type === "image") {
          setCurrentQuestion((prev) => ({
            ...prev,
            imageUrl: uploadedResource.url,
          }));
        } else {
          setCurrentQuestion((prev) => ({
            ...prev,
            audioUrl: uploadedResource.url,
          }));
        }

        // Store file info for reference
        setUploadedFiles((prev) => ({ ...prev, [type]: file }));

        toast({
          title: "Upload successful",
          description: `${
            type === "image" ? "Image" : "Audio"
          } uploaded successfully.`,
        });

        console.log(`📎 File uploaded successfully:`, {
          type,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          resourceId: uploadedResource.id,
          url: uploadedResource.url,
        });
      } else {
        throw new Error(result.meta?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset uploading state
      if (type === "image") {
        setIsUploadingImage(false);
      } else {
        setIsUploadingAudio(false);
      }
    }

    // Clear the input value to allow re-uploading the same file
    event.target.value = "";
  };

  const removeUploadedFile = (type: "image" | "audio") => {
    if (type === "image") {
      setCurrentQuestion((prev) => ({ ...prev, imageUrl: undefined }));
    } else {
      setCurrentQuestion((prev) => ({ ...prev, audioUrl: undefined }));
    }

    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[type];
      return newFiles;
    });

    toast({
      title: "File removed",
      description: `${
        type === "image" ? "Image" : "Audio"
      } removed successfully.`,
    });
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...testData.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newQuestions.length) {
      [newQuestions[index], newQuestions[targetIndex]] = [
        newQuestions[targetIndex],
        newQuestions[index],
      ];
      const updatedTestData = {
        ...testData,
        questions: newQuestions,
      };
      setTestData(updatedTestData);

      console.log(`🔄 Question moved ${direction}:`, {
        from: index + 1,
        to: targetIndex + 1,
        questionText: newQuestions[targetIndex].text.substring(0, 50) + "...",
      });
    }
  };

  const addFromLibrary = (libraryQuestion: Question) => {
    const newQuestion: Question = {
      ...libraryQuestion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedTestData = {
      ...testData,
      questions: [...testData.questions, newQuestion],
    };
    setTestData(updatedTestData);
    setIsLibraryOpen(false);

    console.log("📚 Question added from library:", {
      questionId: newQuestion.id,
      type: newQuestion.type,
      text: newQuestion.text,
      category: newQuestion.category,
      difficulty: newQuestion.difficulty,
      points: newQuestion.points,
    });
  };

  const addOption = () => {
    if (currentQuestion.options) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [
          ...currentQuestion.options,
          {
            id: null,
            text: "",
            isCorrect: false,
          },
        ],
      });
    }
  };

  const updateOption = (index: number, text: string) => {
    if (currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions[index].text = text;
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
      });
    }
  };

  const setCorrectAnswer = (index: number) => {
    if (currentQuestion.options) {
      const newOptions = currentQuestion.options.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      }));
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
      });
    }
  };

  const removeOption = (index: number) => {
    if (currentQuestion.options && currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
      });
    }
  };

  const validateQuestion = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentQuestion.text?.trim()) {
      newErrors.text = "Question text is required";
    }

    if (currentQuestion.type === "multiple-choice") {
      if (!currentQuestion.options || currentQuestion.options.length < 2) {
        newErrors.options = "At least 2 options are required";
      } else {
        const hasCorrectAnswer = currentQuestion.options.some(
          (option) => option.isCorrect
        );
        if (!hasCorrectAnswer) {
          newErrors.correct = "Please select a correct answer";
        }
        const emptyOptions = currentQuestion.options.some(
          (option) => !option.text.trim()
        );
        if (emptyOptions) {
          newErrors.optionText = "All options must have text";
        }
      }
    }

    if (currentQuestion.type === "pronunciation") {
      if (!currentQuestion.pronunciationText?.trim()) {
        newErrors.pronunciationText = "Text to pronounce is required";
      }
    }

    if (currentQuestion.type === "fill-in-the-blank") {
      if (!currentQuestion.text?.trim()) {
        newErrors.fillInBlanks = "Fill-in-the-blank text is required";
      } else if (!currentQuestion.text.includes("_____")) {
        newErrors.fillInBlanks =
          "Text must contain at least one blank marked with _____";
      } else {
        const blankCount = currentQuestion.text.split("_____").length - 1;
        const answeredBlanks =
          currentQuestion.correctBlanks?.filter((blank) => blank.trim())
            .length || 0;
        if (answeredBlanks < blankCount) {
          newErrors.fillInBlanksAnswers = `Please provide answers for all ${blankCount} blanks`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveQuestion = () => {
    if (!validateQuestion()) return;

    const now = new Date().toISOString();
    const questionToSave: Question = {
      id: editingQuestion?.id || null,
      type: currentQuestion.type!,
      text: currentQuestion.text!,
      points: currentQuestion.points || 1,
      difficulty: currentQuestion.difficulty || "beginner",
      category: currentQuestion.category || "General",
      createdAt: editingQuestion?.createdAt || now,
      updatedAt: now,
      ...(currentQuestion.type === "multiple-choice" && {
        options: currentQuestion.options,
      }),
      ...(currentQuestion.type === "pronunciation" && {
        pronunciationText: currentQuestion.pronunciationText,
      }),
      ...(currentQuestion.type === "fill-in-the-blank" && {
        correctBlanks: currentQuestion.correctBlanks,
      }),
      ...(currentQuestion.type === "listening" && {
        audioUrl: currentQuestion.audioUrl,
        maxListeningTime: currentQuestion.maxListeningTime,
      }),
      ...(currentQuestion.imageUrl && { imageUrl: currentQuestion.imageUrl }),
      ...(currentQuestion.audioUrl &&
        currentQuestion.type !== "listening" && {
          audioUrl: currentQuestion.audioUrl,
        }),
    };

    let updatedTestData: TestData;
    if (editingQuestion) {
      updatedTestData = {
        ...testData,
        questions: testData.questions.map((q) =>
          q.id === editingQuestion.id ? questionToSave : q
        ),
      };
      console.log("✏️ Question updated:", {
        questionId: questionToSave.id,
        type: questionToSave.type,
        text: questionToSave.text,
        changes: "Question modified",
      });
    } else {
      updatedTestData = {
        ...testData,
        questions: [...testData.questions, questionToSave],
      };
      console.log("➕ New question added:", {
        questionId: questionToSave.id,
        type: questionToSave.type,
        text: questionToSave.text,
        category: questionToSave.category,
        difficulty: questionToSave.difficulty,
        points: questionToSave.points,
      });
    }

    setTestData(updatedTestData);
    closeModal();
  };

  const deleteQuestion = (id: string) => {
    const questionToDelete = testData.questions.find((q) => q.id === id);
    const updatedTestData = {
      ...testData,
      questions: testData.questions.filter((q) => q.id !== id),
    };

    setTestData(updatedTestData);

    console.log("🗑️ Question deleted:", {
      questionId: id,
      text: questionToDelete?.text,
      type: questionToDelete?.type,
      deletedAt: new Date().toISOString(),
    });
  };

  const handleTestInfoChange = (
    field: keyof TestData,
    value: string | boolean | number
  ) => {
    const updatedData = {
      ...testData,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    setTestData(updatedData);
    console.log(`📝 Field "${field}" updated:`, {
      field,
      value,
      timestamp: new Date().toISOString(),
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "MC";
      case "pronunciation":
        return "🎤";
      case "fill-in-the-blank":
        return "___";
      case "listening":
        return "🎧";
      default:
        return "?";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderQuestionForm = () => {
    return (
      <div className="space-y-6">
        {/* Header with Question Type and Basic Info */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg border border-teal-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Question Type
              </Label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value: Question["type"]) => {
                  setCurrentQuestion({
                    ...currentQuestion,
                    type: value,
                    ...(value === "multiple-choice" && {
                      options: [
                        { text: "", isCorrect: false },
                        { text: "", isCorrect: false },
                      ],
                    }),
                    ...(value === "fill-in-the-blank" && {
                      fillInBlanks: { text: "", blanks: [] },
                    }),
                  });
                  setErrors({});
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 rounded text-xs flex items-center justify-center text-blue-600 mr-2">
                        MC
                      </span>
                      Multiple Choice
                    </div>
                  </SelectItem>
                  <SelectItem value="pronunciation">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-purple-100 rounded text-xs flex items-center justify-center text-purple-600 mr-2">
                        🎤
                      </span>
                      Pronunciation
                    </div>
                  </SelectItem>
                  <SelectItem value="fill-in-the-blank">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-green-100 rounded text-xs flex items-center justify-center text-green-600 mr-2">
                        ___
                      </span>
                      Fill in Blank
                    </div>
                  </SelectItem>
                  <SelectItem value="listening">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-orange-100 rounded text-xs flex items-center justify-center text-orange-600 mr-2">
                        🎧
                      </span>
                      Listening
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Points
              </Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={currentQuestion.points}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    points: Number(e.target.value),
                  })
                }
                className="h-9 text-sm"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Difficulty
              </Label>
              <Select
                value={currentQuestion.difficulty}
                onValueChange={(value: Question["difficulty"]) =>
                  setCurrentQuestion({ ...currentQuestion, difficulty: value })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Beginner
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediate">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      Intermediate
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Advanced
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <Select
                value={currentQuestion.category}
                onValueChange={(value) =>
                  setCurrentQuestion({ ...currentQuestion, category: value })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grammar">📝 Grammar</SelectItem>
                  <SelectItem value="Vocabulary">📚 Vocabulary</SelectItem>
                  <SelectItem value="Pronunciation">
                    🗣️ Pronunciation
                  </SelectItem>
                  <SelectItem value="Listening">👂 Listening</SelectItem>
                  <SelectItem value="Reading">📖 Reading</SelectItem>
                  <SelectItem value="General">🎯 General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content Area - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Question Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Question Text
                </Label>
                <span className="text-xs text-gray-500">
                  {currentQuestion.text?.length || 0}/500 characters
                </span>
              </div>
              <Textarea
                value={currentQuestion.text || ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    text: e.target.value,
                  })
                }
                placeholder="Enter your question here..."
                className="min-h-[80px] text-sm resize-none"
                maxLength={500}
              />
              {errors.text && (
                <p className="text-red-500 text-xs mt-1">{errors.text}</p>
              )}
            </div>

            {/* Question Type Specific Content */}
            {currentQuestion.type === "multiple-choice" && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-blue-800">
                    Answer Options
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addOption}
                    className="h-7 px-2 text-xs border-blue-300 text-blue-600 hover:bg-blue-100"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                <RadioGroup
                  value={currentQuestion.options
                    ?.findIndex((opt) => opt.isCorrect)
                    ?.toString()}
                  onValueChange={(value) =>
                    setCorrectAnswer(Number.parseInt(value))
                  }
                  className="space-y-2"
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-white p-2 rounded border"
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${index}`}
                        className="mt-0.5"
                      />
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 h-8 text-sm border-gray-200"
                      />
                      {currentQuestion.options &&
                        currentQuestion.options.length > 2 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeOption(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                    </div>
                  ))}
                </RadioGroup>
                {errors.options && (
                  <p className="text-red-500 text-xs mt-2">{errors.options}</p>
                )}
                {errors.correct && (
                  <p className="text-red-500 text-xs mt-1">{errors.correct}</p>
                )}
                {errors.optionText && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.optionText}
                  </p>
                )}
                {/* Explanation */}
                <div className="mt-4">
                  <Label className="text-sm font-medium text-blue-800 mb-2 block">
                    Explanation (optional)
                  </Label>
                  <Textarea
                    value={currentQuestion.explanation || ""}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        explanation: e.target.value,
                      })
                    }
                    placeholder="Explain why this is the correct answer..."
                    className="min-h-[60px] text-sm bg-white border-blue-200 resize-none"
                    maxLength={300}
                  />
                  <div className="text-right mt-1">
                    <span className="text-xs text-blue-600">
                      {currentQuestion.explanation?.length || 0}/300
                    </span>
                  </div>
                </div>
              </div>
            )}

            {currentQuestion.type === "pronunciation" && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <Label className="text-sm font-medium text-purple-800 mb-2 block">
                  Text to Pronounce
                </Label>
                <Textarea
                  placeholder="Enter word or sentence to pronounce"
                  value={currentQuestion.pronunciationText}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      pronunciationText: e.target.value,
                    })
                  }
                  className="min-h-[60px] text-sm bg-white border-purple-200"
                  maxLength={200}
                />
                <div className="flex justify-between mt-1">
                  {errors.pronunciationText && (
                    <p className="text-red-500 text-xs">
                      {errors.pronunciationText}
                    </p>
                  )}
                  <span className="text-xs text-purple-600">
                    {currentQuestion.pronunciationText?.length || 0}/200
                  </span>
                </div>
                {/* Explanation */}
                <div className="mt-4">
                  <Label className="text-sm font-medium text-purple-800 mb-2 block">
                    Explanation (optional)
                  </Label>
                  <Textarea
                    value={currentQuestion.explanation || ""}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        explanation: e.target.value,
                      })
                    }
                    placeholder="Provide pronunciation tips or explanation..."
                    className="min-h-[60px] text-sm bg-white border-purple-200 resize-none"
                    maxLength={300}
                  />
                  <div className="text-right mt-1">
                    <span className="text-xs text-purple-600">
                      {currentQuestion.explanation?.length || 0}/300
                    </span>
                  </div>
                </div>
              </div>
            )}

            {currentQuestion.type === "fill-in-the-blank" && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
                <div>
                  <Label className="text-sm font-medium text-green-800 mb-2 block">
                    Fill-in-the-Blank Text
                  </Label>
                  <Textarea
                    placeholder="Enter text with blanks marked as _____ (e.g., 'I _____ to school every day.')"
                    value={currentQuestion.text}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        text: e.target.value,
                      })
                    }
                    className="min-h-[60px] text-sm bg-white border-green-200"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    Use _____ to mark blanks in your text
                  </p>
                  {errors.fillInBlanks && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fillInBlanks}
                    </p>
                  )}
                </div>

                {currentQuestion.text?.split("_____").length > 1 && (
                  <div>
                    <Label className="text-sm font-medium text-green-800 mb-2 block">
                      Correct Answers
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Array.from(
                        {
                          length:
                            (currentQuestion.text?.split("_____").length || 1) -
                            1,
                        },
                        (_, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Label className="text-xs text-green-700 min-w-[50px]">
                              #{index + 1}:
                            </Label>
                            <Input
                              placeholder="Answer"
                              value={
                                currentQuestion.correctBlanks?.[index] || ""
                              }
                              onChange={(e) => {
                                const newBlanks = [
                                  ...(currentQuestion.correctBlanks || []),
                                ];
                                newBlanks[index] = e.target.value;
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  correctBlanks: newBlanks,
                                });
                              }}
                              className="h-8 text-sm bg-white border-green-200"
                            />
                          </div>
                        )
                      )}
                    </div>
                    {errors.fillInBlanksAnswers && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.fillInBlanksAnswers}
                      </p>
                    )}
                  </div>
                )}
                {/* Explanation */}
                <div className="mt-4">
                  <Label className="text-sm font-medium text-green-800 mb-2 block">
                    Explanation (optional)
                  </Label>
                  <Textarea
                    value={currentQuestion.explanation || ""}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        explanation: e.target.value,
                      })
                    }
                    placeholder="Explain the correct answers..."
                    className="min-h-[60px] text-sm bg-white border-green-200 resize-none"
                    maxLength={300}
                  />
                  <div className="text-right mt-1">
                    <span className="text-xs text-green-600">
                      {currentQuestion.explanation?.length || 0}/300
                    </span>
                  </div>
                </div>
              </div>
            )}

            {currentQuestion.type === "listening" && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-4">
                <div>
                  <Label className="text-sm font-medium text-orange-800 mb-2 block">
                    Maximum Listening Time
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[currentQuestion.maxListeningTime || 30]}
                      onValueChange={(value) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          maxListeningTime: value[0],
                        })
                      }
                      max={180}
                      min={10}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-orange-700 min-w-[60px]">
                      {currentQuestion.maxListeningTime || 30}s
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-orange-800">
                      Answer Options
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addOption}
                      className="h-7 px-2 text-xs border-orange-300 text-orange-600 hover:bg-orange-100"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <RadioGroup
                    value={currentQuestion.options
                      ?.findIndex((opt) => opt.isCorrect)
                      ?.toString()}
                    onValueChange={(value) =>
                      setCorrectAnswer(Number.parseInt(value))
                    }
                    className="space-y-2"
                  >
                    {currentQuestion.options?.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-white p-2 rounded border"
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`listening-option-${index}`}
                          className="mt-0.5"
                        />
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option.text}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 h-8 text-sm border-gray-200"
                        />
                        {currentQuestion.options &&
                          currentQuestion.options.length > 2 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeOption(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                {/* Explanation */}
                <div className="mt-4">
                  <Label className="text-sm font-medium text-orange-800 mb-2 block">
                    Explanation (optional)
                  </Label>
                  <Textarea
                    value={currentQuestion.explanation || ""}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        explanation: e.target.value,
                      })
                    }
                    placeholder="Explain the correct answer..."
                    className="min-h-[60px] text-sm bg-white border-orange-200 resize-none"
                    maxLength={300}
                  />
                  <div className="text-right mt-1">
                    <span className="text-xs text-orange-600">
                      {currentQuestion.explanation?.length || 0}/300
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Media & Settings */}
          <div className="space-y-4">
            {/* Media Upload Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2 text-gray-600" />
                  Media Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Image Upload */}
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-2 block">
                    Image
                  </Label>
                  {currentQuestion.imageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={currentQuestion.imageUrl || "/placeholder.svg"}
                        alt="Question image preview"
                        className="w-full h-24 object-cover rounded border"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 truncate">
                          {uploadedFiles.image?.name || "Image uploaded"}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeUploadedFile("image")}
                          className="h-6 px-2 text-xs text-red-500 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleFileUpload("image")}
                      disabled={isUploadingImage}
                      className="w-full h-20 border-dashed border-gray-300 text-gray-500 hover:border-teal-400 hover:text-teal-600"
                    >
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-4 w-4 animate-spin mb-1" />
                          <span className="text-xs">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="h-4 w-4 mb-1" />
                          <span className="text-xs">Upload Image</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>

                {/* Audio Upload */}
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-2 block">
                    Audio
                  </Label>
                  {currentQuestion.audioUrl ? (
                    <div className="space-y-2">
                      <AudioPreview
                        audioUrl={currentQuestion.audioUrl}
                        compact={true}
                        className="w-full"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeUploadedFile("audio")}
                        className="w-full h-6 text-xs text-red-500 hover:bg-red-50"
                      >
                        Remove Audio
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleFileUpload("audio")}
                      disabled={isUploadingAudio}
                      className="w-full h-16 border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600"
                    >
                      {isUploadingAudio ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-4 w-4 animate-spin mb-1" />
                          <span className="text-xs">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Volume2 className="h-4 w-4 mb-1" />
                          <span className="text-xs">Upload Audio</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "image")}
          className="hidden"
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileChange(e, "audio")}
          className="hidden"
        />
      </div>
    );
  };

  const renderPreviewContent = () => {
    // Check if we have questions before proceeding
    if (!testData.questions || testData.questions.length === 0) {
      return (
        <div className="max-w-4xl mx-auto">
          <Card className="border-yellow-100">
            <CardContent className="text-center py-8">
              <p className="text-yellow-600">
                No questions available for preview
              </p>
              <Button onClick={closePreview} className="mt-4">
                Close Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Ensure previewCurrentQuestion is within bounds
    if (previewCurrentQuestion >= testData.questions.length) {
      setPreviewCurrentQuestion(0);
      return null;
    }

    if (!previewStarted) {
      return (
        <div className="max-w-4xl mx-auto">
          <Card className="border-teal-100">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <Eye className="h-8 w-8 text-teal-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-4">
                {testData.name || "Untitled Test"}
              </CardTitle>
              <div className="text-lg mb-6 text-gray-600">
                {testData.description || "No description provided"}
              </div>

              <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
                <div className="flex items-center">
                  <span className="font-medium">
                    {testData.questions.length} Questions
                  </span>
                </div>
                <div className="flex items-center">
                  <span>{testData.totalPoints} Total Points</span>
                </div>
                <div className="flex items-center">
                  <span>~{testData.estimatedDuration} minutes</span>
                </div>
                {testData.hasTimer && (
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 mr-1" />
                    <span>{testData.timeLimit} min limit</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  Quiz Settings Preview:
                </h3>
                <div className="text-left space-y-2 max-w-md mx-auto text-sm">
                  <div className="flex justify-between">
                    <span>Navigation:</span>
                    <span className="font-medium">
                      {testData.navigationMode === "sequential"
                        ? "Sequential"
                        : testData.navigationMode === "back-only"
                        ? "Back Only"
                        : "Free Navigation"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timer:</span>
                    <span className="font-medium">
                      {testData.hasTimer
                        ? `${testData.timeLimit} minutes`
                        : "No limit"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Question Picker:</span>
                    <span className="font-medium">
                      {testData.allowQuestionPicker ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shuffle Questions:</span>
                    <span className="font-medium">
                      {testData.shuffleQuestions ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Attempts:</span>
                    <span className="font-medium">{testData.maxAttempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span className="font-medium">
                      {testData.passingScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={startPreview}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Preview
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={closePreview}
                  className="border-gray-600 text-gray-600 hover:bg-gray-50 px-8 py-4 text-lg"
                >
                  Close Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentQ = testData.questions[previewCurrentQuestion];

    if (!currentQ) {
      return (
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-100">
            <CardContent className="text-center py-8">
              <p className="text-red-600">Error: Question not found</p>
              <Button onClick={closePreview} className="mt-4">
                Close Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {testData.name || "Untitled Test"}
            </h1>
            <div className="flex items-center space-x-4">
              {testData.hasTimer && (
                <div
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                    previewTimeRemaining < 300
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <Timer className="h-4 w-4" />
                  <span className="font-mono font-semibold">
                    {formatTime(previewTimeRemaining)}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                Question {previewCurrentQuestion + 1} of{" "}
                {testData.questions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={closePreview}
                className="border-gray-400 text-gray-600 hover:bg-gray-50"
              >
                Exit Preview
              </Button>
            </div>
          </div>
          <Progress value={previewProgress} className="h-2 bg-teal-100" />
        </div>

        {/* Question Card */}
        <Card className="border-teal-100 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{currentQ.text}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(currentQ.difficulty)}>
                  {currentQ.difficulty}
                </Badge>
                <Badge variant="outline">{currentQ.points} pts</Badge>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {currentQ.category} • {currentQ.type.replace("-", " ")}
            </div>
          </CardHeader>
          <CardContent>
            {currentQ.imageUrl && (
              <div className="mb-4">
                <img
                  src={currentQ.imageUrl || "/placeholder.svg"}
                  alt="Question image"
                  className="max-w-full h-auto rounded-lg border shadow-sm"
                />
              </div>
            )}

            {currentQ.audioUrl && (
              <div className="mb-4">
                <AudioPreview
                  audioUrl={currentQ.audioUrl}
                  compact={true}
                  className="max-w-xs"
                />
              </div>
            )}

            {/* Question type specific rendering */}
            {currentQ.type === "multiple-choice" && currentQ.options && (
              <RadioGroup
                value={previewSelectedAnswer}
                onValueChange={setPreviewSelectedAnswer}
              >
                <div className="space-y-4">
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={option.text}
                        id={`preview-option-${index}`}
                      />
                      <Label
                        htmlFor={`preview-option-${index}`}
                        className="flex-1 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQ.type === "fill-in-the-blank" && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-700">
                    {currentQ.text.split("_____").map((part, index, array) => (
                      <span key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <input
                            type="text"
                            className="mx-2 px-2 py-1 border border-gray-300 rounded w-24 text-center"
                            placeholder="___"
                          />
                        )}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Fill in the blanks with the appropriate words
                </div>
              </div>
            )}

            {currentQ.type === "pronunciation" && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                  <p className="text-lg font-medium text-center text-blue-800">
                    "{currentQ.pronunciationText}"
                  </p>
                </div>
                <div className="text-center">
                  <Button className="bg-red-500 hover:bg-red-600 text-white">
                    🎤 Start Recording
                  </Button>
                </div>
                <div className="text-sm text-gray-500 text-center">
                  Click the microphone to record your pronunciation
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (previewCurrentQuestion > 0 && testData.questions.length > 0) {
                const newIndex = previewCurrentQuestion - 1;
                setPreviewCurrentQuestion(newIndex);
                setPreviewProgress(
                  (newIndex / testData.questions.length) * 100
                );
              }
            }}
            disabled={previewCurrentQuestion === 0}
            className="border-teal-600 text-teal-600 hover:bg-teal-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPreviewStarted(false)}
              className="border-gray-400 text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart Preview
            </Button>

            {previewCurrentQuestion < testData.questions.length - 1 ? (
              <Button
                onClick={() => {
                  if (previewCurrentQuestion < testData.questions.length - 1) {
                    const newIndex = previewCurrentQuestion + 1;
                    setPreviewCurrentQuestion(newIndex);
                    setPreviewProgress(
                      (newIndex / testData.questions.length) * 100
                    );
                  }
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Next Question
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => alert("Preview completed!")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Finish Preview
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Test Settings</span>
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Questions ({testData.questions.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Settings */}
            <div className="lg:col-span-2 space-y-8">
              {/* Test Information Section */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    Test Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="testName" className="text-gray-700">
                      Test Name
                    </Label>
                    <Input
                      id="testName"
                      placeholder="Enter test name"
                      value={testData.name}
                      onChange={(e) =>
                        handleTestInfoChange("name", e.target.value)
                      }
                      className="w-full p-2 border rounded focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testDescription" className="text-gray-700">
                      Test Description
                    </Label>
                    <Textarea
                      id="testDescription"
                      placeholder="Enter test description (optional)"
                      value={testData.description}
                      onChange={(e) =>
                        handleTestInfoChange("description", e.target.value)
                      }
                      className="w-full p-2 border rounded focus:border-teal-500 focus:ring-teal-500 min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Quiz Settings Section */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Quiz Settings
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Configure how students will take this quiz
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Navigation Mode */}
                  <div>
                    <Label className="text-gray-700 font-medium">
                      Navigation Mode
                    </Label>
                    <Select
                      value={testData.navigationMode}
                      onValueChange={(value: TestData["navigationMode"]) =>
                        handleTestInfoChange("navigationMode", value)
                      }
                    >
                      <SelectTrigger className="focus:border-teal-500 focus:ring-teal-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">
                          Sequential Only (Must answer in order, no going back)
                        </SelectItem>
                        <SelectItem value="back-only">
                          Back Only (Can review previous questions, no skipping
                          ahead)
                        </SelectItem>
                        <SelectItem value="free-navigation">
                          Free Navigation (Jump to any question freely)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      {testData.navigationMode === "sequential" &&
                        "Students must answer questions in order and cannot go back"}
                      {testData.navigationMode === "back-only" &&
                        "Students can review previous questions but cannot skip ahead"}
                      {testData.navigationMode === "free-navigation" &&
                        "Students can navigate freely between all questions"}
                    </p>
                  </div>
                  {/* Timer Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="hasTimer"
                          className="text-gray-700 font-medium"
                        >
                          Enable Timer
                        </Label>
                        <p className="text-sm text-gray-500">
                          Set a time limit for the entire quiz
                        </p>
                      </div>
                      <Switch
                        id="hasTimer"
                        checked={testData.hasTimer}
                        onCheckedChange={(checked) =>
                          handleTestInfoChange("hasTimer", checked)
                        }
                      />
                    </div>

                    {testData.hasTimer && (
                      <div className="space-y-4 pl-4 border-l-2 border-teal-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700">
                              Time Limit (minutes)
                            </Label>
                            <Input
                              type="number"
                              min="5"
                              max="300"
                              value={testData.timeLimit}
                              onChange={(e) =>
                                handleTestInfoChange(
                                  "timeLimit",
                                  Number(e.target.value)
                                )
                              }
                              className="focus:border-teal-500 focus:ring-teal-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              Students will have {testData.timeLimit} minutes to
                              complete the quiz
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-700">
                              Warning Time (minutes before end)
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max={Math.floor(testData.timeLimit / 2)}
                              value={testData.warningTime}
                              onChange={(e) =>
                                handleTestInfoChange(
                                  "warningTime",
                                  Number(e.target.value)
                                )
                              }
                              className="focus:border-teal-500 focus:ring-teal-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              Show warning when {testData.warningTime} minutes
                              remain
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Question Order */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-gray-700 font-medium flex items-center">
                          <Shuffle className="h-4 w-4 mr-2" />
                          Randomize Questions
                        </Label>
                        <p className="text-sm text-gray-500">
                          Shuffle question order for each student
                        </p>
                      </div>
                      <Switch
                        checked={testData.shuffleQuestions}
                        onCheckedChange={(checked) =>
                          handleTestInfoChange("shuffleQuestions", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-gray-700 font-medium">
                          Randomize Answer Options
                        </Label>
                        <p className="text-sm text-gray-500">
                          Shuffle answer choices in multiple choice questions
                        </p>
                      </div>
                      <Switch
                        checked={testData.shuffleAnswers}
                        onCheckedChange={(checked) =>
                          handleTestInfoChange("shuffleAnswers", checked)
                        }
                      />
                    </div>
                  </div>
                  {/* Question Picker */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-700 font-medium">
                        Show Question Picker
                      </Label>
                      <p className="text-sm text-gray-500">
                        Allow students to see and jump to specific questions
                      </p>
                    </div>
                    <Switch
                      checked={testData.allowQuestionPicker}
                      onCheckedChange={(checked) =>
                        handleTestInfoChange("allowQuestionPicker", checked)
                      }
                      disabled={testData.navigationMode === "sequential"}
                    />
                  </div>
                  {/* Additional Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-gray-700 font-medium">
                          Show Progress Bar
                        </Label>
                        <p className="text-sm text-gray-500">
                          Display completion progress to students
                        </p>
                      </div>
                      <Switch
                        checked={testData.showProgress}
                        onCheckedChange={(checked) =>
                          handleTestInfoChange("showProgress", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-gray-700 font-medium">
                          Allow Pause
                        </Label>
                        <p className="text-sm text-gray-500">
                          Let students pause and resume the quiz
                        </p>
                      </div>
                      <Switch
                        checked={testData.allowPause}
                        onCheckedChange={(checked) =>
                          handleTestInfoChange("allowPause", checked)
                        }
                        disabled={testData.hasTimer}
                      />
                    </div>
                  </div>
                  {/* Attempt and Scoring Settings */}SS
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700">Maximum Attempts</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={testData.maxAttempts}
                        onChange={(e) =>
                          handleTestInfoChange(
                            "maxAttempts",
                            Number(e.target.value)
                          )
                        }
                        className="focus:border-teal-500 focus:ring-teal-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Number of times students can retake the quiz
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-700">Passing Score (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={testData.passingScore}
                        onChange={(e) =>
                          handleTestInfoChange(
                            "passingScore",
                            Number(e.target.value)
                          )
                        }
                        className="focus:border-teal-500 focus:ring-teal-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum score required to pass
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar for Settings Tab */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="border-teal-100">
                <CardHeader>
                  <CardTitle className="text-lg">Test Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Questions</span>
                    <span className="text-sm font-semibold">
                      {testData.questions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Points</span>
                    <span className="text-sm font-semibold">
                      {testData.totalPoints}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Est. Duration</span>
                    <span className="text-sm font-semibold">
                      {testData.estimatedDuration} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Points</span>
                    <span className="text-sm font-semibold">
                      {testData.questions.length > 0
                        ? (
                            testData.totalPoints / testData.questions.length
                          ).toFixed(1)
                        : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Navigation</span>
                    <span className="text-sm font-semibold">
                      {testData.navigationMode === "sequential"
                        ? "Sequential"
                        : testData.navigationMode === "back-only"
                        ? "Back Only"
                        : "Free"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Timer</span>
                    <span className="text-sm font-semibold">
                      {testData.hasTimer ? `${testData.timeLimit}m` : "None"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setActiveTab("questions")}
                    className="w-full border-teal-500 text-teal-600 hover:bg-teal-50 bg-white border"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Questions
                  </Button>

                  <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={openPreview}
                        disabled={testData.questions.length === 0}
                        className="w-full border-gray-400 text-gray-600 hover:bg-gray-50 disabled:opacity-50 bg-white border"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
                      <div className="p-6">{renderPreviewContent()}</div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => saveTest()}
                    disabled={!testData.name.trim() || isSaving}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Test
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => saveTest(false, true)}
                    disabled={
                      testData.questions.length === 0 ||
                      !testData.name.trim() ||
                      isSaving
                    }
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <ChevronRight className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save And Exit
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => saveTest(true)}
                    disabled={
                      testData.questions.length === 0 ||
                      !testData.name.trim() ||
                      isSaving
                    }
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Send className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save and Publish
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-blue-100 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">
                    💡 Settings Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700 space-y-2">
                  <p>• Use sequential mode for formal assessments</p>
                  <p>• Enable timers for standardized testing</p>
                  <p>• Shuffle questions to prevent cheating</p>
                  <p>• Set appropriate passing scores</p>
                  <p>• Configure navigation based on test type</p>
                  <p>• Test settings are auto-saved</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Questions Section */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-800">
                      Questions ({testData.questions.length})
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Total Points: {testData.totalPoints} • Estimated Duration:{" "}
                      {testData.estimatedDuration} minutes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={isLibraryOpen}
                      onOpenChange={setIsLibraryOpen}
                    >
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
                              key={question.id + question.createdAt}
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
                    <Button
                      onClick={openAddModal}
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {testData.questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No questions added yet.</p>
                      <p className="text-sm">
                        Start by adding questions or importing from the library.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {testData.questions.map((question, index) => (
                        <div
                          key={question.id + question.createdAt}
                          className="bg-white shadow p-6 rounded border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="flex flex-col space-y-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => moveQuestion(index, "up")}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => moveQuestion(index, "down")}
                                  disabled={
                                    index === testData.questions.length - 1
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-3">
                                  <span className="font-medium text-gray-800">
                                    Question {index + 1}
                                  </span>
                                  <div className="w-6 h-6 bg-teal-100 rounded text-xs flex items-center justify-center text-teal-600 font-medium">
                                    {getQuestionTypeIcon(question.type)}
                                  </div>
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

                                <p className="text-gray-700 mb-3 font-medium">
                                  {question.text}
                                </p>

                                {/* Media Display */}
                                <div className="flex items-center space-x-4 mb-3">
                                  {question.imageUrl && (
                                    <div className="flex items-center space-x-2">
                                      <img
                                        src={
                                          question.imageUrl ||
                                          "/placeholder.svg" ||
                                          "/placeholder.svg"
                                        }
                                        alt="Question image"
                                        className="w-12 h-12 object-cover rounded border"
                                      />
                                      <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        <ImageIcon className="h-4 w-4 mr-1 inline" />
                                        Image attached
                                      </div>
                                    </div>
                                  )}
                                  {question.audioUrl && (
                                    <div className="mb-3">
                                      <AudioPreview
                                        audioUrl={question.audioUrl}
                                        compact={true}
                                        className="max-w-xs"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Question Type Specific Content */}
                                {question.type === "multiple-choice" &&
                                  question.options && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <p className="text-sm font-medium text-gray-700 mb-2">
                                        Options:
                                      </p>
                                      <div className="space-y-1">
                                        {question.options.map(
                                          (option, optIndex) => (
                                            <div
                                              key={optIndex}
                                              className="flex items-center space-x-2"
                                            >
                                              <div
                                                className={`w-2 h-2 rounded-full ${
                                                  option.isCorrect
                                                    ? "bg-green-500"
                                                    : "bg-gray-300"
                                                }`}
                                              />
                                              <span
                                                className={`text-sm ${
                                                  option.isCorrect
                                                    ? "text-green-700 font-medium"
                                                    : "text-gray-600"
                                                }`}
                                              >
                                                {option.text}
                                              </span>
                                              {option.isCorrect && (
                                                <Badge
                                                  variant="outline"
                                                  className="text-green-600 border-green-300"
                                                >
                                                  Correct
                                                </Badge>
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {question.type === "fill-in-the-blank" &&
                                  question.fillInBlanks && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <p className="text-sm font-medium text-gray-700 mb-2">
                                        Fill-in-the-blank:
                                      </p>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {question.fillInBlanks.text}
                                      </p>
                                      {question.fillInBlanks.blanks &&
                                        question.fillInBlanks.blanks.length >
                                          0 && (
                                          <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                              Correct Answers:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {question.fillInBlanks.blanks.map(
                                                (blank, blankIndex) => (
                                                  <Badge
                                                    key={blankIndex}
                                                    variant="outline"
                                                    className="text-green-600 border-green-300"
                                                  >
                                                    Blank {blankIndex + 1}:{" "}
                                                    {blank.answer}
                                                  </Badge>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )}

                                {question.type === "pronunciation" && (
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      Text to pronounce:
                                    </p>
                                    <p className="text-sm text-gray-600 italic">
                                      "{question.pronunciationText}"
                                    </p>
                                  </div>
                                )}

                                {question.type === "listening" && (
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-sm font-medium text-gray-700">
                                        Listening Question
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="text-blue-600 border-blue-300"
                                      >
                                        Max: {question.maxListeningTime}s
                                      </Badge>
                                    </div>
                                    {question.options && (
                                      <div className="space-y-1">
                                        {question.options.map(
                                          (option, optIndex) => (
                                            <div
                                              key={optIndex}
                                              className="flex items-center space-x-2"
                                            >
                                              <div
                                                className={`w-2 h-2 rounded-full ${
                                                  option.isCorrect
                                                    ? "bg-green-500"
                                                    : "bg-gray-300"
                                                }`}
                                              />
                                              <span
                                                className={`text-sm ${
                                                  option.isCorrect
                                                    ? "text-green-700 font-medium"
                                                    : "text-gray-600"
                                                }`}
                                              >
                                                {option.text}
                                              </span>
                                              {option.isCorrect && (
                                                <Badge
                                                  variant="outline"
                                                  className="text-green-600 border-green-300"
                                                >
                                                  Correct
                                                </Badge>
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(question)}
                                className="border-teal-500 text-teal-600 hover:bg-teal-50"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-400 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the question.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        deleteQuestion(question.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar for Questions Tab */}
            <div className="space-y-6">
              {/* Question Stats */}
              <Card className="border-teal-100">
                <CardHeader>
                  <CardTitle className="text-lg">Question Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Questions</span>
                    <span className="font-semibold">
                      {testData.questions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Multiple Choice</span>
                    <span className="font-semibold">
                      {
                        testData.questions.filter(
                          (q) => q.type === "multiple-choice"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fill in Blank</span>
                    <span className="font-semibold">
                      {
                        testData.questions.filter(
                          (q) => q.type === "fill-in-the-blank"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">With Media</span>
                    <span className="font-semibold">
                      {
                        testData.questions.filter(
                          (q) => q.imageUrl || q.audioUrl
                        ).length
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setActiveTab("settings")}
                    className="w-full border-teal-500 text-teal-600 hover:bg-teal-50 bg-white border"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Back to Settings
                  </Button>

                  <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={openPreview}
                        disabled={testData.questions.length === 0}
                        className="w-full border-gray-400 text-gray-600 hover:bg-gray-50 disabled:opacity-50 bg-white border"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
                      <div className="p-6">{renderPreviewContent()}</div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => saveTest()}
                    disabled={!testData.name.trim() || isSaving}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Test
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => saveTest(false, true)}
                    disabled={
                      testData.questions.length === 0 ||
                      !testData.name.trim() ||
                      isSaving
                    }
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <ChevronRight className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save And Exit
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => saveTest(true)}
                    disabled={
                      testData.questions.length === 0 ||
                      !testData.name.trim() ||
                      isSaving
                    }
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Send className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save and Publish
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-blue-100 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">
                    💡 Question Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700 space-y-2">
                  <p>• Mix different question types for variety</p>
                  <p>• Use multimedia to enhance engagement</p>
                  <p>• Set appropriate point values</p>
                  <p>• Organize questions by difficulty</p>
                  <p>• Preview questions before saving</p>
                  <p>• Questions are auto-saved</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Question Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center">
              {editingQuestion ? (
                <>
                  <Edit className="h-5 w-5 mr-2 text-teal-600" />
                  Edit Question #
                  {testData.questions.findIndex(
                    (q) => q.id === editingQuestion.id
                  ) + 1}
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2 text-teal-600" />
                  Add New Question
                </>
              )}
            </DialogTitle>
            <p className="text-sm text-gray-500">
              {editingQuestion
                ? "Modify the question details below"
                : "Create a new question for your quiz"}
            </p>
          </DialogHeader>

          {renderQuestionForm()}

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-500">
              {currentQuestion.text?.length ||
                (0 > 0 && (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Question text added
                  </span>
                ))}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={closeModal} className="px-6">
                Cancel
              </Button>
              <Button
                onClick={saveQuestion}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6"
                disabled={!currentQuestion.text?.trim()}
              >
                {editingQuestion ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Question
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuth(CreateTestPage);
