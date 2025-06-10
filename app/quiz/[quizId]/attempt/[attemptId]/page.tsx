"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  RotateCcw,
  Share2,
  BookOpen,
  Clock,
  Users,
  Star,
  Mic,
  Square,
  Send,
  Timer,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { quizService } from "@/lib/services/quiz-service";
import { resourceService } from "@/lib/services/resource-service";
// Assuming IQuiz is defined in interfaces, if not, it should be.
// import type { IQuiz } from "@/lib/types/interfaces";
import { SUCCESS_CODE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { ListeningQuestion } from "@/components/quiz/ListeningQuestion";

// --- API and State Interfaces ---

interface ApiMeta {
  code: number;
  message: string;
}

// For getQuizAttempt API
interface SelectedAnswerDetail {
  id: string;
  isCorrect: boolean;
  text: string;
}

interface AttemptAnswer {
  id: string;
  quizAttemptId: string;
  questionId: string;
  selectedAnswers: SelectedAnswerDetail[] | null;
  fillInBlanksAnswers: string[] | null;
  answerText: string | null;
  scoreAchieved: number;
  timeTaken: number | null; // Assuming timeTaken from API can be number or null
  audioUrl: string | null;
  answeredAt: string;
  correct: boolean;
  // This field is from the submit body, might not be in getQuizAttempt response for T/F user's actual choice
  userAnswerTrueFalse?: boolean | null;
}

interface QuizAttemptData {
  id: string;
  quizId: string;
  userId: string;
  quiz: any | null; // Define further if needed
  user: any | null; // Define further if needed
  answers: AttemptAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string | null;
  passed: boolean;
  deletedAt: string | null;
}

interface QuizAttemptResponse {
  meta: ApiMeta;
  data: QuizAttemptData | null; // API might return null data on error
}

// For getQuizById API
interface QuestionOption {
  id: string;
  isCorrect: boolean;
  text: string;
}

interface ApiQuestion {
  id: string;
  quizId: string;
  type: string; // Will be cast to QuestionType
  text: string;
  options: QuestionOption[] | null;
  pronunciationText: string | null;
  correctBlanks: string[] | null;
  trueFalseAnswer: boolean | null;
  audioUrl: string | null;
  imageUrl: string | null;
  maxListeningTime: number | null;
  correctAnswer: string[]; // Or appropriate type
  explanation: string | null;
  points: number;
  timeLimit: number | null;
  difficulty: string; // Will be cast to DifficultyLevel
  category: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  quiz: any | null; // Define further if needed
}

interface QuizByIdData {
  id: string;
  title: string;
  description: string;
  category: string | null;
  difficulty: string | null;
  duration: number | null;
  questionCount: number;
  tags: string[];
  status: string | null;
  createdAt: string | null;
  updatedAt: string;
  deletedAt: string | null;
  authorId: string;
  author: any | null; // Define further
  rating: number;
  attempts: number;
  passingScore: number;
  navigationMode: string; // Will be cast to NavigationMode
  hasTimer: boolean;
  timeLimit: number; // in minutes
  warningTime: number; // in minutes
  allowQuestionPicker: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showProgress: boolean;
  allowPause: boolean;
  maxAttempts: number;
  questions: ApiQuestion[];
  quizAttempts: any | null; // Define further
  savedByUsers: any | null; // Define further
  leaderboardEntries: any | null; // Define further
}

interface QuizByIdResponse {
  meta: ApiMeta;
  data: QuizByIdData | null; // API might return null data on error
}

// For submit question API request body
interface SubmitQuestionBody {
  questionId: string;
  selectedOptions: string[] | null; // Array of option IDs
  fillInBlanksAnswers: string[] | null;
  answerText: string | null;
  userAnswerTrueFalse: boolean | null;
  timeTaken: number | null;
  audioUrl: string | null;
}

// --- Component Specific Interfaces ---

type QuestionType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_THE_BLANK"
  | "PRONUNCIATION"
  | "LISTENING"
  | "UNKNOWN_TYPE"; // For safety

type DifficultyLevel = "Intermediate" | "Advanced" | "Beginner" | "Unknown";
type NavigationMode =
  | "sequential"
  | "back-only"
  | "free-navigation"
  | "unknown";

// Internal state for a question, derived from ApiQuestion
interface IQuestionState {
  id: string;
  type: QuestionType;
  question: string; // Renamed from 'text' for clarity in component
  options?: QuestionOption[]; // Keep full option objects
  instructions: string;
  points: number;
  difficulty: DifficultyLevel;
  category: string;
  // Type-specific properties
  fillInText?: string; // For FILL_IN_THE_BLANK, this is the text with "_____"
  correctBlanks?: string[] | null; // Correct answers for FIB
  trueFalseCorrectAnswer?: boolean | null; // Correct answer for T/F
  pronunciationText?: string;
  audioUrl?: string; // For listening questions or pronunciation if pre-recorded
  imageUrl?: string | null;
  maxListeningTime?: number;
  // 'correct' field from original IQuiz was ambiguous, replaced by type-specific correct answers
}

// Internal state for the quiz, derived from QuizByIdData
interface IQuizState {
  id: string;
  title: string;
  description: string;
  creator: string;
  participants: number;
  rating: number;
  duration: string; // e.g., "30 min" or "N/A"
  difficulty: DifficultyLevel;
  navigationMode: NavigationMode;
  hasTimer: boolean;
  timeLimit: number; // in seconds for internal use
  allowQuestionPicker: boolean;
  questions: IQuestionState[];
  // Other fields from QuizByIdData if needed directly
  passingScore: number;
  warningTime: number; // in seconds
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showProgress: boolean;
  allowPause: boolean;
  maxAttempts: number;
}

// For storing individual question answers in component state
interface QuestionAnswer {
  questionId: string;
  questionType: QuestionType;
  answer: string | boolean | Blob | string[] | null; // string[] for fillInBlanks
  timeSpent: number;
  timestamp: string;
  selectedOptions?: string[]; // For multiple choice, array of option IDs
  fillInBlanksAnswers?: string[]; // Explicitly for fill in blanks
  audioUrl?: string | null; // Store URL if applicable (e.g., after uploading blob)
  correct?: boolean; // From attempt response
  scoreAchieved?: number; // From attempt response
  userAnswerTrueFalse?: boolean | null; // User's actual T/F choice
}

// For the main quizAnswers state object
interface QuizAnswers {
  [questionId: string]: QuestionAnswer; // questionId is string (UUID)
}

const mapApiQuestionToState = (apiQuestion: ApiQuestion): IQuestionState => {
  const baseQuestion: IQuestionState = {
    id: apiQuestion.id,
    type: apiQuestion.type as QuestionType, // Cast, consider validation
    question: apiQuestion.text, // This is the main question text, might include "_____" for FIB
    instructions: `Complete this ${apiQuestion.type
      .toLowerCase()
      .replace("_", " ")} question.`,
    points: apiQuestion.points,
    difficulty: (apiQuestion.difficulty as DifficultyLevel) || "Unknown",
    category: apiQuestion.category,
    imageUrl: apiQuestion.imageUrl,
  };

  switch (apiQuestion.type) {
    case "MULTIPLE_CHOICE":
      return {
        ...baseQuestion,
        options: apiQuestion.options || [],
      };
    case "FILL_IN_THE_BLANK":
      return {
        ...baseQuestion,
        // 'question' field in baseQuestion already has the text with "_____"
        // fillInText: apiQuestion.text, // This is redundant if 'question' is used
        correctBlanks: apiQuestion.correctBlanks,
      };
    case "PRONUNCIATION":
      return {
        ...baseQuestion,
        pronunciationText: apiQuestion.pronunciationText || "",
        audioUrl: apiQuestion.audioUrl || undefined, // If question itself has an audio (e.g. example pronunciation)
      };
    case "LISTENING":
      return {
        ...baseQuestion,
        audioUrl: apiQuestion.audioUrl || "",
        options: apiQuestion.options || [], // Assuming options are for MC after listening
        maxListeningTime: apiQuestion.maxListeningTime || 0,
      };
    default:
      console.warn("Unknown question type:", apiQuestion.type);
      return { ...baseQuestion, type: "UNKNOWN_TYPE" };
  }
};

const mapApiQuizToState = (apiQuiz: QuizByIdData): IQuizState => {
  return {
    id: apiQuiz.id,
    title: apiQuiz.title,
    description: apiQuiz.description,
    creator: apiQuiz.author?.name || "Unknown Author", // Assuming author object has name
    participants: apiQuiz.attempts,
    rating: apiQuiz.rating,
    duration: apiQuiz.duration ? `${apiQuiz.duration} min` : "N/A",
    difficulty: (apiQuiz.difficulty as DifficultyLevel) || "Unknown",
    navigationMode:
      (apiQuiz.navigationMode
        ?.toLowerCase()
        .replace("_", "-") as NavigationMode) || "unknown",
    hasTimer: apiQuiz.hasTimer,
    timeLimit: apiQuiz.timeLimit * 60, // Convert minutes to seconds
    warningTime: apiQuiz.warningTime * 60, // Convert minutes to seconds
    allowQuestionPicker: apiQuiz.allowQuestionPicker,
    questions: apiQuiz.questions.map(mapApiQuestionToState),
    passingScore: apiQuiz.passingScore,
    shuffleQuestions: apiQuiz.shuffleQuestions,
    shuffleAnswers: apiQuiz.shuffleAnswers,
    showProgress: apiQuiz.showProgress,
    allowPause: apiQuiz.allowPause,
    maxAttempts: apiQuiz.maxAttempts,
  };
};

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(0);

  // Answer states
  const [selectedAnswer, setSelectedAnswer] = useState(""); // For MC text display
  const [selectedOptionId, setSelectedOptionId] = useState<string>(""); // For MC option ID
  const [fillInAnswers, setFillInAnswers] = useState<string[]>([]); // For FIB
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<"true" | "false" | "">(
    ""
  ); // For T/F

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [hasListened, setHasListened] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );
  const [isSubmitting, setIsSubmitting] = useState(false); // For overall quiz submission

  const [timeRemaining, setTimeRemaining] = useState<number>(0); // Overall quiz timer
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [content, setContent] = useState<IQuizState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const questionNavRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null); // Renamed from timerRef
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null); // Renamed from audioRef
  const quizTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      quizTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (quizTimerRef.current) clearInterval(quizTimerRef.current);
            setIsTimerActive(false);
            submitQuiz(); // Auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeRemaining <= 0 && isTimerActive) {
      // Handles case where time might be set to 0 directly
      setIsTimerActive(false);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      // submitQuiz(); // Already called if prev <=1, but good for safety if time is forced to 0
    }

    return () => {
      if (quizTimerRef.current) {
        clearInterval(quizTimerRef.current);
      }
    };
  }, [isTimerActive, timeRemaining]);

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
    if (!content?.questions || !canNavigateToQuestion(questionIndex)) return;

    // Consider saving current answer before jumping, if not auto-saving
    // For simplicity, current setup auto-saves on blur/change for relevant types

    setCurrentQuestion(questionIndex);
    // Progress update will be handled by useEffect watching currentQuestion

    // Scroll the clicked question into view in the navigator
    if (questionNavRef.current) {
      const questionButton = questionNavRef.current.children[
        questionIndex
      ] as HTMLElement;
      if (questionButton) {
        questionButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  async function saveAnswer(
    questionId: string,
    answerValue: string | boolean | Blob | string[], // For MC, this is optionId. For FIB, string[]. For Pron, Blob.
    questionType: QuestionType,
    metadata?: { mcOptionText?: string } // To store MC text in local QuizAnswers state
  ) {
    if (!params.attemptId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Attempt ID is missing.",
      });
      return;
    }

    const timeSpentOnQuestion = Date.now() - questionStartTime;

    // This body should match the structure expected by quizService.submitQuizAttemptQuestion
    // which is IQuizAttemptAnswer from the service's perspective (likely similar to SubmitQuestionBody).
    const submitBodyForService: SubmitQuestionBody = {
      questionId: questionId,
      selectedOptions: null,
      fillInBlanksAnswers: null,
      answerText: null, // For essay types, or if MCQs were submitted as text.
      userAnswerTrueFalse: null, // For True/False questions
      timeTaken: timeSpentOnQuestion,
      audioUrl: null, // This will be set by quizService if a blob is uploaded and URL returned, or if upload happens before this call.
    };

    if (questionType === "MULTIPLE_CHOICE") {
      // answerValue is the optionId (string) for MCQs
      submitBodyForService.selectedOptions = answerValue
        ? [answerValue as string]
        : null;
    } else if (questionType === "FILL_IN_THE_BLANK") {
      submitBodyForService.fillInBlanksAnswers = answerValue as string[];
    } else if (questionType === "TRUE_FALSE") {
      // Ensure you have a QuestionType for "TRUE_FALSE"
      submitBodyForService.userAnswerTrueFalse = answerValue as boolean;
    } else if (questionType === "PRONUNCIATION") {
      if (typeof answerValue === "string") {
        // answerValue is now the audio URL from the upload
        submitBodyForService.audioUrl = answerValue;
      } else if (answerValue instanceof Blob) {
        // This should not happen anymore since we upload before calling saveAnswer
        console.warn(
          "Pronunciation Blob should be uploaded before calling saveAnswer"
        );
        return;
      }
    }

    // Update local state optimistically for UI feedback
    const newQuizAnswerEntry: QuestionAnswer = {
      questionId,
      questionType,
      answer:
        questionType === "MULTIPLE_CHOICE"
          ? metadata?.mcOptionText // Store the selected option's text for UI display in quizAnswers
          : answerValue, // For MC, answerValue is optionId; for FIB, string[]; for Pron, audio URL
      timeSpent: timeSpentOnQuestion,
      timestamp: new Date().toISOString(),
      // Store the option ID(s) for MC
      selectedOptions:
        questionType === "MULTIPLE_CHOICE" && typeof answerValue === "string"
          ? [answerValue]
          : undefined,
      fillInBlanksAnswers:
        questionType === "FILL_IN_THE_BLANK"
          ? (answerValue as string[])
          : undefined,
      userAnswerTrueFalse:
        questionType === "TRUE_FALSE" // Store the boolean value for True/False
          ? (answerValue as boolean)
          : undefined,
      // Store audio URL for pronunciation questions
      audioUrl:
        questionType === "PRONUNCIATION" && typeof answerValue === "string"
          ? answerValue
          : quizAnswers[questionId]?.audioUrl,
      // 'correct' and 'scoreAchieved' will be updated upon receiving response from server
    };
    setQuizAnswers((prev) => ({ ...prev, [questionId]: newQuizAnswerEntry }));
    setQuestionStartTime(Date.now()); // Reset start time for the next interaction

    try {
      const response = await quizService.submitQuizAttemptQuestion(
        params.attemptId as string,
        submitBodyForService // This object should align with IQuizAttemptAnswer (from quiz-service types)
      );

      if (response.meta.code !== SUCCESS_CODE) {
        toast({
          variant: "destructive",
          title: "Save Error",
          description:
            response.meta.message || "Failed to save answer. Please try again.",
        });
        // Optionally revert optimistic update here if critical
      } else {
        // Update local answer state with 'correct' and 'scoreAchieved' from response if available
        if (response.data) {
          // Assuming response.data contains the updated answer details
          const updatedAnswerDetails = response.data as AttemptAnswer; // Cast to your attempt answer type
          setQuizAnswers((prev) => ({
            ...prev,
            [questionId]: {
              ...prev[questionId], // Keep existing local data like Blob
              correct: updatedAnswerDetails.correct,
              scoreAchieved: updatedAnswerDetails.scoreAchieved,
              audioUrl:
                updatedAnswerDetails.audioUrl || prev[questionId]?.audioUrl, // Prefer server URL
              // Potentially update other fields if the server response is the source of truth
            },
          }));
        }
        // Optionally, a subtle success indicator, but can be noisy for auto-saves.
        // toast({ title: "Progress Saved" });
      }
    } catch (error) {
      console.error("Failed to save answer:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to save answer. Please check your connection.",
      });
      // Optionally revert optimistic update
    }
  }

  const loadSavedAnswer = (questionId: string) => {
    if (!content?.questions) return;

    const currentQDetails = content.questions.find((q) => q.id === questionId);
    const savedQuizAnswer = quizAnswers[questionId];

    // Reset all answer states first to defaults for the current question type
    setSelectedAnswer("");
    setSelectedOptionId("");
    setTrueFalseAnswer("");
    setAudioBlob(null);
    setHasRecorded(false);
    setRecordingTime(0);
    setHasListened(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = "";
    }

    // Initialize fillInAnswers based on the number of blanks for the current question
    if (currentQDetails && currentQDetails.type === "FILL_IN_THE_BLANK") {
      const qText = currentQDetails.question || ""; // question text with "_____"
      const numBlanks = qText.split("_____").length - 1;
      setFillInAnswers(Array(numBlanks > 0 ? numBlanks : 0).fill(""));
    } else {
      setFillInAnswers([]);
    }

    if (savedQuizAnswer && currentQDetails) {
      switch (currentQDetails.type) {
        case "MULTIPLE_CHOICE":
          if (
            savedQuizAnswer.selectedOptions &&
            savedQuizAnswer.selectedOptions.length > 0
          ) {
            const optionIdToLoad = savedQuizAnswer.selectedOptions[0];
            const option = currentQDetails.options?.find(
              (opt) => opt.id === optionIdToLoad
            );
            if (option) {
              setSelectedAnswer(option.text);
              setSelectedOptionId(option.id);
            }
          }
          break;
        case "FILL_IN_THE_BLANK":
          if (savedQuizAnswer.fillInBlanksAnswers) {
            const qText = currentQDetails.question || "";
            const numBlanks = qText.split("_____").length - 1;
            const loadedAnswers = Array(numBlanks > 0 ? numBlanks : 0).fill("");
            savedQuizAnswer.fillInBlanksAnswers.forEach((ans, i) => {
              if (i < loadedAnswers.length) loadedAnswers[i] = ans;
            });
            setFillInAnswers(loadedAnswers);
          }
          break;
        case "PRONUNCIATION":
          if (savedQuizAnswer.answer instanceof Blob) {
            setAudioBlob(savedQuizAnswer.answer);
            setHasRecorded(true);
            // recordingTime might need to be stored and reloaded if important
          } else if (savedQuizAnswer.audioUrl) {
            // If we have a URL, we might want to allow playing it, but not set audioBlob
            // This indicates a previously submitted and processed recording
            setHasRecorded(true); // Mark as recorded if URL exists
          }
          break;
        case "LISTENING":
          // For listening questions, we don't need to restore audio state
          // but we should restore the selected answer if any
          if (
            savedQuizAnswer.selectedOptions &&
            savedQuizAnswer.selectedOptions.length > 0
          ) {
            const optionIdToLoad = savedQuizAnswer.selectedOptions[0];
            const option = currentQDetails.options?.find(
              (opt) => opt.id === optionIdToLoad
            );
            if (option) {
              setSelectedAnswer(option.text);
              setSelectedOptionId(option.id);
            }
          }
          // Mark as listened if there's a saved answer
          if (
            savedQuizAnswer.answer !== null &&
            savedQuizAnswer.answer !== ""
          ) {
            setHasListened(true);
          }
          break;
      }
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    setIsTimerActive(false);
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);

    // Final save for the current question if any pending changes
    // This logic might be complex depending on autosave strategy.
    // For now, assume answers are reasonably up-to-date via onBlur/onChange handlers.

    toast({ title: "Submitting Quiz", description: "Please wait..." });

    try {
      // The API call to finalize/submit the attempt
      // This might be different from submitting individual questions
      // For example, it might just be a POST to /quiz-attempts/{attemptId}/complete
      // The user's current code navigates to results page.
      // Let's assume there's a service call for this.
      const response = await quizService.completeQuizAttempt(params.attemptId);
      if (response?.meta?.code === SUCCESS_CODE) {
        if (params.attemptId) {
          // const response = await quizService.completeQuizAttempt(params.attemptId as string);
          // if (response.meta.code === SUCCESS_CODE) {
          router.push(
            `/quiz/${params.quizId}/attempt/${params.attemptId}/result`
          );
        } else {
          toast({
            variant: "destructive",
            title: "Submission Failed",
            description: response.meta.message,
          });
          setIsSubmitting(false);
        }
      } else {
        throw new Error("Attempt ID missing");
      }
      // Simulate submission for now as in original code
      setTimeout(() => {
        setIsSubmitting(false);
        if (params.quizId && params.attemptId) {
          router.push(
            `/quiz/${params.quizId}/attempt/${params.attemptId}/result`
          );
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Quiz or Attempt ID is missing for navigation.",
          });
        }
      }, 1500);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not submit the quiz.",
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (isStarted && content && content.questions.length > 0) {
      setQuestionStartTime(Date.now()); // Reset timer when question changes
      loadSavedAnswer(content.questions[currentQuestion].id);
      setProgress(((currentQuestion + 1) / content.questions.length) * 100);
    }
  }, [currentQuestion, isStarted, content]); // quizAnswers removed, loadSavedAnswer reads it directly

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimerDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    let display = "";
    if (hours > 0) display += `${hours}:`;
    display += `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
    return display;
  };

  const canNavigateToQuestion = (questionIndex: number) => {
    if (!content) return false;
    if (content.navigationMode === "free-navigation") return true;
    if (content.navigationMode === "back-only")
      return questionIndex <= currentQuestion;
    // For "sequential", can only navigate to current or next if current is "proceedable"
    // This simple check allows clicking current, but next/prev buttons handle proceed logic
    if (content.navigationMode === "sequential")
      return questionIndex === currentQuestion;
    return false; // Default deny
  };

  const canGoBack = () => {
    if (!content) return false;
    if (content.navigationMode === "sequential") return false;
    return currentQuestion > 0;
  };

  const canProceedCurrentQuestion = () => {
    if (!content || !content.questions[currentQuestion]) return false;
    const currentQState = content.questions[currentQuestion];
    switch (currentQState.type) {
      case "MULTIPLE_CHOICE":
        return selectedOptionId !== "";
      case "FILL_IN_THE_BLANK":
        // All blanks must be filled to proceed (as per original logic)
        const numBlanks =
          currentQState.question?.split("_____").length - 1 || 0;
        if (numBlanks === 0 && currentQState.question) return true; // No blanks, proceedable
        const filledBlanks = fillInAnswers.filter(
          (answer) => answer && answer.trim() !== ""
        ).length;
        return filledBlanks === numBlanks && numBlanks > 0;
      case "PRONUNCIATION":
        return hasRecorded;
      case "LISTENING":
        return selectedOptionId !== "" && hasListened; // Must have listened AND selected an answer
      default:
        return true; // For unknown types or types without specific validation here
    }
  };

  const canGoForward = () => {
    if (!content || currentQuestion >= content.questions.length - 1)
      return false;
    if (content.navigationMode === "sequential" && !canProceedCurrentQuestion())
      return false;
    return true;
  };

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const newAudioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          setAudioBlob(newAudioBlob);
          setHasRecorded(true);
          stream.getTracks().forEach((track) => track.stop()); // Stop microphone access
          if (recordingTimerRef.current)
            clearInterval(recordingTimerRef.current);

          // Upload the recorded audio blob
          try {
            // Convert blob to File object for upload
            const audioFile = new File([newAudioBlob], "recording.wav", {
              type: "audio/wav",
            });

            // Upload the audio file
            const uploadResult = await resourceService.uploadFile(audioFile);

            if (uploadResult.meta?.code === SUCCESS_CODE && uploadResult.data) {
              const audioUrl = uploadResult.data.url;

              // Now submit the question with the audio URL
              const currentQ = content?.questions[currentQuestion];
              if (currentQ) {
                await saveAnswer(currentQ.id, audioUrl, currentQ.type);
              }

              toast({
                title: "Audio uploaded successfully",
                description:
                  "Your pronunciation has been recorded and submitted.",
              });
            } else {
              throw new Error(uploadResult.meta?.message || "Upload failed");
            }
          } catch (uploadError) {
            console.error("Error uploading audio:", uploadError);
            toast({
              variant: "destructive",
              title: "Upload failed",
              description:
                "Failed to upload audio recording. Please try again.",
            });
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        recordingTimerRef.current = setInterval(
          () => setRecordingTime((prev) => prev + 1),
          1000
        );
      } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({
          variant: "destructive",
          title: "Microphone Error",
          description: "Could not access microphone. Please check permissions.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Unsupported",
        description: "Audio recording is not supported by your browser.",
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop(); // onstop will handle the rest
      setIsRecording(false); // Set recording to false immediately
      // Timer cleared in onstop
    }
  };

  const playRecording = () => {
    // First, try to play the local audio blob (for preview before upload)
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play();
        audioPlayerRef.current.onended = () => URL.revokeObjectURL(audioUrl);
      }
      return;
    }

    // If no local blob, try to play the uploaded audio URL
    const currentQ = content?.questions[currentQuestion];
    if (currentQ && quizAnswers[currentQ.id]?.audioUrl) {
      const uploadedAudioUrl = quizAnswers[currentQ.id].audioUrl;
      if (audioPlayerRef.current && uploadedAudioUrl) {
        audioPlayerRef.current.src = uploadedAudioUrl;
        audioPlayerRef.current.play();
      }
      return;
    }

    // If neither local blob nor uploaded URL exists
    toast({
      title: "No Recording",
      description: "There is no recording to play.",
    });
  };

  const handleNext = async () => {
    if (!content?.questions || !canGoForward()) return;

    // Save current answer (already handled by onBlur/onChange for most types)
    // Explicit save might be needed if not relying on auto-save
    const currentQ = content.questions[currentQuestion];
    // await saveCurrentAnswerIfNeeded(currentQ); // Placeholder for explicit save

    if (currentQuestion < content.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = async () => {
    if (!canGoBack()) return;
    // await saveCurrentAnswerIfNeeded(content.questions[currentQuestion]); // Placeholder
    setCurrentQuestion((prev) => prev - 1);
  };

  const handleFinish = async () => {
    if (!content?.questions) return;
    // await saveCurrentAnswerIfNeeded(content.questions[currentQuestion]); // Placeholder
    setProgress(100); // Visually mark as complete
    submitQuiz();
  };

  const handleMultipleChoiceChange = async (
    optionText: string,
    optionId: string
  ) => {
    if (!content?.questions || !optionId.trim()) return;

    setSelectedAnswer(optionText); // Update UI display state
    setSelectedOptionId(optionId); // Update state for other UI logic or future reads

    const currentQ = content.questions[currentQuestion];
    if (currentQ) {
      // Pass the optionId directly as the 'answerValue' for this question type.
      // Pass optionText via metadata if local state needs it separately.
      await saveAnswer(currentQ.id, optionId, currentQ.type, {
        mcOptionText: optionText,
      });
    }
  };

  const handleFillInChange = (index: number, value: string) => {
    const newAnswers = [...fillInAnswers];
    // Ensure array is long enough (though loadSavedAnswer should initialize it correctly)
    while (newAnswers.length <= index) {
      newAnswers.push("");
    }
    newAnswers[index] = value;
    setFillInAnswers(newAnswers);
    // Auto-save on change is handled by onBlur, or could be triggered here if desired
    // For FIB, saving on every keystroke might be too much, onBlur is better.
    // The original page.tsx called handleFillInBlur in onChange of the input.
    // If that's the desired behavior (save on change after first blur), keep it.
    // For now, let's assume onBlur is the primary save trigger.
  };

  const handleFillInBlur = async (index: number) => {
    if (!content?.questions) return;
    const currentQ = content.questions[currentQuestion];
    if (!currentQ || currentQ.type !== "FILL_IN_THE_BLANK") return;

    // fillInAnswers is the state variable, which React should have updated
    // from handleFillInChange before the blur event typically fires.
    const answersToSave = fillInAnswers.map((ans) => (ans ? ans.trim() : ""));

    const previouslySavedAnswers =
      quizAnswers[currentQ.id]?.fillInBlanksAnswers;

    // Only save if there's a change
    if (
      JSON.stringify(answersToSave) !==
      JSON.stringify(
        previouslySavedAnswers || Array(answersToSave.length).fill("")
      )
    ) {
      await saveAnswer(currentQ.id, answersToSave, currentQ.type);
    }
  };

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!params.quizId || !params.attemptId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Quiz or Attempt ID missing.",
        });
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [quizResponse, attemptResponse] = await Promise.all([
          quizService.getQuizById(
            params.quizId as string
          ) as Promise<QuizByIdResponse>,
          quizService.getQuizAttempt(
            params.attemptId as string
          ) as Promise<QuizAttemptResponse>,
        ]);

        if (quizResponse.meta.code === SUCCESS_CODE && quizResponse.data) {
          const mappedQuiz = mapApiQuizToState(quizResponse.data);
          setContent(mappedQuiz);

          if (mappedQuiz.hasTimer) {
            setTimeRemaining(mappedQuiz.timeLimit); // timeLimit is already in seconds
            setIsTimerActive(true);
          }
          setQuizStartTime(Date.now());

          const initialAnswersMap: QuizAnswers = {};
          if (
            attemptResponse.meta.code === SUCCESS_CODE &&
            attemptResponse.data
          ) {
            const attemptData = attemptResponse.data;
            (attemptData.answers || []).forEach((apiAns: AttemptAnswer) => {
              const questionTypeForAnswer =
                mappedQuiz.questions.find((q) => q.id === apiAns.questionId)
                  ?.type || "UNKNOWN_TYPE";
              initialAnswersMap[apiAns.questionId] = {
                questionId: apiAns.questionId,
                questionType: questionTypeForAnswer,
                answer:
                  apiAns.fillInBlanksAnswers ||
                  apiAns.selectedAnswers?.map((sa) => sa.text).join(", ") ||
                  apiAns.answerText ||
                  null, // General representation
                timeSpent: apiAns.timeTaken || 0,
                timestamp: apiAns.answeredAt,
                selectedOptions: apiAns.selectedAnswers?.map((sa) => sa.id),
                fillInBlanksAnswers: apiAns.fillInBlanksAnswers || undefined,
                audioUrl: apiAns.audioUrl || undefined,
                correct: apiAns.correct,
                scoreAchieved: apiAns.scoreAchieved,
                userAnswerTrueFalse:
                  typeof apiAns.userAnswerTrueFalse === "boolean"
                    ? apiAns.userAnswerTrueFalse
                    : undefined,
              };
            });
          }
          setQuizAnswers(initialAnswersMap);
          setIsStarted(true); // This will trigger the useEffect that calls loadSavedAnswer for currentQuestion=0
        } else {
          toast({
            variant: "destructive",
            title: "Load Error",
            description:
              quizResponse.meta.message || "Failed to load quiz content.",
          });
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "An error occurred while loading the quiz.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [params.quizId, params.attemptId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading quiz...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex justify-center items-center h-screen">
        Quiz content not available.
      </div>
    );
  }

  const currentQState = content.questions[currentQuestion];
  if (!currentQState) {
    return (
      <div className="flex justify-center items-center h-screen">
        Current question not found.
      </div>
    );
  }

  // Audio player for listening questions or playing back pronunciation recordings
  // <audio ref={audioPlayerRef} className="hidden" /> (place somewhere in JSX if needed globally)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <audio ref={audioPlayerRef} className="hidden" />
      {/* Progress Header with Timer */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
          <div className="flex items-center space-x-4">
            {content.hasTimer && (
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  timeRemaining < content.warningTime && timeRemaining > 0 // warningTime is in seconds
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <Timer className="h-4 w-4" />
                <span className="font-mono font-semibold">
                  {formatTimerDisplay(timeRemaining)}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {content.questions.length}
            </span>
            <Badge
              variant="outline"
              className="border-green-600 text-green-600"
            >
              {
                Object.keys(quizAnswers).filter(
                  (qid) =>
                    quizAnswers[qid].answer !== null &&
                    quizAnswers[qid].answer !== ""
                ).length
              }{" "}
              Answered
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="h-2 bg-teal-100" />
          {content.allowQuestionPicker && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Navigation: {content.navigationMode.replace("-", " ")}
                </span>
              </div>
              <div className="relative">
                <div
                  ref={questionNavRef}
                  className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {content.questions.map((q, index) => {
                    const questionNumber = index + 1;
                    const isAnswered =
                      quizAnswers[q.id]?.answer !== null &&
                      quizAnswers[q.id]?.answer !== "";
                    const isCurrent = currentQuestion === index;
                    const canNav = canNavigateToQuestion(index);
                    return (
                      <button
                        key={q.id}
                        onClick={() => handleQuestionNavigation(index)}
                        disabled={!canNav}
                        className={`
                          flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all relative
                          ${
                            isCurrent
                              ? "border-teal-600 bg-teal-600 text-white shadow-lg ring-2 ring-teal-300 ring-offset-1"
                              : isAnswered
                              ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                              : canNav
                              ? "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                          }
                        `}
                        title={`Question ${questionNumber}${
                          isAnswered ? " (Answered)" : ""
                        }`}
                      >
                        {questionNumber}
                        {isAnswered && !isCurrent && (
                          <CheckCircle className="absolute -top-1.5 -right-1.5 h-4 w-4 text-green-500 bg-white rounded-full p-0.5" />
                        )}
                        {!isAnswered && !isCurrent && canNav && (
                          <Circle className="absolute -top-1.5 -right-1.5 h-4 w-4 text-gray-400 bg-white rounded-full p-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {content.questions.length > 8 && ( // Show arrows if many questions
                  <>
                    <button
                      onClick={() => scrollQuestionNav("left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border shadow-md flex items-center justify-center hover:bg-gray-100 z-10 disabled:opacity-50"
                      disabled={questionNavRef.current?.scrollLeft === 0}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => scrollQuestionNav("right")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border shadow-md flex items-center justify-center hover:bg-gray-100 z-10"
                      disabled={
                        questionNavRef.current &&
                        questionNavRef.current.scrollLeft +
                          questionNavRef.current.clientWidth >=
                          questionNavRef.current.scrollWidth
                      }
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Card className="border-teal-100 mb-8 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-800">
              {currentQState.question}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="border-teal-600 text-teal-600"
              >
                {currentQState.type.replace("_", " ")}
              </Badge>
              {quizAnswers[currentQState.id]?.answer !== null &&
                quizAnswers[currentQState.id]?.answer !== "" && (
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Answered
                  </Badge>
                )}
            </div>
          </div>
          <CardDescription>{currentQState.instructions}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentQState.imageUrl && (
            <div className="mb-4 max-w-md mx-auto">
              <img
                src={currentQState.imageUrl}
                alt="Question visual aid"
                className="max-w-full h-auto rounded-lg border shadow-sm"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://placehold.co/600x400/eee/ccc?text=Image+Not+Found")
                }
              />
            </div>
          )}

          {currentQState.type === "MULTIPLE_CHOICE" &&
            currentQState.options && (
              <RadioGroup
                value={selectedAnswer}
                onValueChange={(value) => {
                  const option = currentQState.options?.find(
                    (opt) => opt.text === value
                  );
                  if (option) handleMultipleChoiceChange(value, option.id);
                }}
              >
                <div className="space-y-3">
                  {currentQState.options.map((option) => (
                    <Label
                      key={option.id}
                      htmlFor={option.id}
                      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                                ${
                                  selectedOptionId === option.id
                                    ? "bg-teal-50 border-teal-500 ring-2 ring-teal-300"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                    >
                      <RadioGroupItem value={option.text} id={option.id} />
                      <span>{option.text}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            )}

          {currentQState.type === "FILL_IN_THE_BLANK" &&
            currentQState.question && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-lg font-medium text-blue-900 leading-relaxed">
                    {currentQState.question
                      .split("_____")
                      .map((part, index, array) => (
                        <span key={index}>
                          {part}
                          {index < array.length - 1 && (
                            <input
                              type="text"
                              value={fillInAnswers[index] || ""}
                              onChange={(e) =>
                                handleFillInChange(index, e.target.value)
                              }
                              onBlur={() => handleFillInBlur(index)}
                              className="mx-2 px-3 py-1 border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[120px] text-center text-base"
                              placeholder="type here"
                            />
                          )}
                        </span>
                      ))}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  Fill in all the blanks with the appropriate words.
                </div>
              </div>
            )}

          {currentQState.type === "PRONUNCIATION" && (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="font-medium text-indigo-800 mb-2">
                  Text to pronounce:
                </h3>
                <p className="text-xl font-semibold text-indigo-900 mb-1 leading-relaxed">
                  {currentQState.pronunciationText}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">
                    Record your pronunciation:
                  </h3>
                  {isRecording && (
                    <div className="flex items-center text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
                      <span className="font-mono">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
                      disabled={hasRecorded && !!audioBlob}
                    >
                      {" "}
                      {/* Disable if already recorded and blob exists */}
                      <Mic className="h-5 w-5 mr-2" />{" "}
                      {hasRecorded ? "Recorded" : "Start Recording"}
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3"
                    >
                      <Square className="h-5 w-5 mr-2" /> Stop Recording
                    </Button>
                  )}
                  {hasRecorded &&
                    (audioBlob || quizAnswers[currentQState.id]?.audioUrl) && ( // Show play button if there's a blob OR uploaded URL
                      <>
                        <Button
                          onClick={playRecording}
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-3"
                        >
                          <Play className="h-5 w-5 mr-2" /> Play
                        </Button>
                        {audioBlob && ( // Only show re-record if there's a local blob
                          <Button
                            onClick={() => {
                              setHasRecorded(false);
                              setAudioBlob(null);
                              setRecordingTime(0);
                            }}
                            variant="outline"
                            className="border-gray-500 text-gray-600 hover:bg-gray-100 px-5 py-3"
                          >
                            <RotateCcw className="h-5 w-5 mr-2" /> Re-record
                          </Button>
                        )}
                      </>
                    )}
                </div>
                {hasRecorded && audioBlob && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    ✓ Recording ready. Duration: {formatTime(recordingTime)}.
                    You can re-record if needed.
                  </div>
                )}
                {hasRecorded &&
                  !audioBlob &&
                  quizAnswers[currentQState.id]?.audioUrl && ( // Previously submitted, has URL
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      ✓ Recording submitted. You can play it back or record a
                      new one to replace it.
                    </div>
                  )}
              </div>
            </div>
          )}

          {currentQState.type === "LISTENING" && (
            <ListeningQuestion
              question={currentQState.question}
              audioUrl={currentQState.audioUrl || null}
              maxListeningTime={currentQState.maxListeningTime}
              options={currentQState.options}
              selectedOptionId={selectedOptionId}
              onOptionSelect={handleMultipleChoiceChange}
              hasListened={hasListened}
              onListeningStateChange={setHasListened}
              formatTime={formatTime}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-10">
        <Button
          variant="outline"
          className="border-gray-400 text-gray-700 hover:bg-gray-100 px-6 py-3"
          disabled={!canGoBack()}
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> Previous
        </Button>
        <div className="flex items-center space-x-3">
          {currentQuestion < content.questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canGoForward()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 disabled:opacity-60"
            >
              Next Question <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!canProceedCurrentQuestion() || isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Finish Assessment"}{" "}
              <Send className="h-5 w-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
      {/* Overall Submit Button - if needed separately from Finish Assessment */}
      {/* <div className="mt-6 text-center">
            <Button
                onClick={submitQuiz}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                disabled={isSubmitting || Object.keys(quizAnswers).length === 0}
            >
                {isSubmitting ? 'Submitting...' : `Submit All (${Object.keys(quizAnswers).length}/${content.questions.length})`}
            </Button>
        </div> */}
    </div>
  );
}
