"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Clock,
  Award,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AudioPreview } from "@/components/ui/audio-preview";
import { quizService } from "@/lib/services/quiz-service";
import { SUCCESS_CODE } from "@/lib/constants";

// Updated interface to match the new API response
interface QuizAttemptDetail {
  id: string;
  quizId: string;
  userId: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    category: string | null;
    difficulty: string | null;
    duration: number | null;
    questionCount: number;
    tags: string[];
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    authorId: string;
    author: any | null;
    rating: number;
    attempts: number;
    passingScore: number;
    navigationMode: string;
    hasTimer: boolean;
    timeLimit: number;
    warningTime: number;
    allowQuestionPicker: boolean;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    showProgress: boolean;
    allowPause: boolean;
    maxAttempts: number;
    questions: Array<{
      id: string;
      quizId: string;
      type: string;
      text: string;
      options: Array<{
        id: string;
        isCorrect: boolean;
        text: string;
      }> | null;
      pronunciationText: string | null;
      correctBlanks: string[] | null;
      trueFalseAnswer: boolean | null;
      audioUrl: string | null;
      imageUrl: string | null;
      maxListeningTime: number | null;
      correctAnswer: string[];
      explanation: string | null;
      points: number;
      timeLimit: number | null;
      difficulty: string;
      category: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      quiz: any | null;
    }> | null;
    quizAttempts: any | null;
    savedByUsers: any | null;
    leaderboardEntries: any | null;
  };
  user: any | null;
  answers: Array<{
    id: string;
    quizAttemptId: string;
    questionId: string;
    selectedAnswers: Array<{
      id: string;
      isCorrect: boolean;
      text: string;
    }> | null;
    fillInBlanksAnswers: string[] | null;
    answerText: string | null;
    scoreAchieved: number;
    timeTaken: number;
    audioUrl: string | null;
    answeredAt: string;
    correct: boolean;
    userAnswerTrueFalse?: boolean;
  }>;
  score: number;
  totalQuestions: number | null;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  passed: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export default function CreatorAttemptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { quizId, attemptId } = params;

  const [attemptDetail, setAttemptDetail] = useState<QuizAttemptDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttemptDetail = async () => {
      setIsLoading(true);
      try {
        const response = await quizService.getQuizAttempt(attemptId as string);

        if (response.meta.code === SUCCESS_CODE && response.data) {
          setAttemptDetail(response.data);
          setComment(response.data.creatorComment || "");
        } else {
          console.error("Failed to fetch attempt detail:", response);
        }
      } catch (error) {
        console.error("Error fetching attempt detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttemptDetail();
  }, [quizId, attemptId]);

  const handleSaveComment = async () => {
    if (!attemptDetail) return;

    setIsSavingComment(true);
    try {
      // API call to save comment
      // await quizService.saveAttemptComment(attemptId, comment);

      setAttemptDetail((prev) =>
        prev ? { ...prev, creatorComment: comment } : prev
      );
    } catch (error) {
      console.error("Error saving comment:", error);
    } finally {
      setIsSavingComment(false);
    }
  };

  const playAudio = (audioUrl: string, audioId: string) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
      return;
    }
    setPlayingAudio(audioId);
    // Audio playback logic here
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "bg-green-900/50 text-green-300 border-green-700/50";
    if (score >= 60)
      return "bg-yellow-900/50 text-yellow-300 border-yellow-700/50";
    return "bg-red-900/50 text-red-300 border-red-700/50";
  };

  // Helper function to get user answer text based on answer type
  const getUserAnswerText = (answer: any) => {
    if (answer.selectedAnswers && answer.selectedAnswers.length > 0) {
      return answer.selectedAnswers.map((sa: any) => sa.text).join(", ");
    }
    if (answer.fillInBlanksAnswers && answer.fillInBlanksAnswers.length > 0) {
      return answer.fillInBlanksAnswers.join(", ");
    }
    if (answer.answerText) {
      return answer.answerText;
    }
    return "No answer provided";
  };

  // Helper function to get question details by ID
  const getQuestionById = (questionId: string) => {
    if (!attemptDetail?.quiz?.questions) return null;
    return attemptDetail.quiz.questions.find((q) => q.id === questionId);
  };

  // Helper function to get correct answer text based on question type
  const getCorrectAnswerText = (answer: any) => {
    const question = getQuestionById(answer.questionId);
    if (!question) return "Question not found";

    switch (question.type) {
      case "MULTIPLE_CHOICE":
        const correctOption = question.options?.find((opt) => opt.isCorrect);
        return correctOption ? correctOption.text : "No correct option found";

      case "FILL_IN_THE_BLANK":
        return question.correctBlanks
          ? question.correctBlanks.join(", ")
          : "No correct blanks defined";

      case "TRUE_FALSE":
        return question.trueFalseAnswer !== null
          ? question.trueFalseAnswer
            ? "True"
            : "False"
          : "No true/false answer defined";

      case "PRONUNCIATION":
        return question.pronunciationText || "No pronunciation text defined";

      default:
        return "Unknown question type";
    }
  };

  // Helper function to get question text
  const getQuestionText = (questionId: string) => {
    const question = getQuestionById(questionId);
    return question ? question.text : "Question not found";
  };

  // Helper function to get question type
  const getQuestionType = (questionId: string) => {
    const question = getQuestionById(questionId);
    return question ? question.type : "Unknown";
  };

  // Helper function to get question explanation
  const getQuestionExplanation = (questionId: string) => {
    const question = getQuestionById(questionId);
    return question ? question.explanation : null;
  };

  // Helper function to get question image
  const getQuestionImage = (questionId: string) => {
    const question = getQuestionById(questionId);
    return question ? question.imageUrl : null;
  };

  // Helper function to get question audio
  const getQuestionAudio = (questionId: string) => {
    const question = getQuestionById(questionId);
    return question ? question.audioUrl : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            <div className="h-32 bg-gray-800 rounded"></div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!attemptDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">
            Attempt not found
          </h1>
          <Button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/quiz/${quizId}/analytics`)}
            className="mb-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>

          <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-lg">
            <CardHeader className="py-3 px-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg mb-0 text-gray-100 flex items-center gap-2">
                    <span>{attemptDetail.quiz.title}</span>
                    <Badge
                      className={`${getScoreColor(
                        attemptDetail.score
                      )} text-sm px-2 py-0.5`}
                    >
                      {attemptDetail.score}%
                    </Badge>
                    <Badge
                      variant={attemptDetail.passed ? "default" : "destructive"}
                      className={
                        attemptDetail.passed
                          ? "bg-green-900/50 text-green-300 border-green-700/50 text-sm"
                          : "bg-red-900/50 text-red-300 border-red-700/50 text-sm"
                      }
                    >
                      {attemptDetail.passed ? "Passed" : "Failed"}
                    </Badge>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4 text-purple-400" />
                    <span className="font-medium">
                      {attemptDetail.user?.name || "Unknown User"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Award className="h-4 w-4 text-green-400" />
                    <span>
                      {attemptDetail.correctAnswers}/
                      {attemptDetail.totalQuestions ||
                        attemptDetail.answers.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>{formatTime(attemptDetail.timeSpent)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span className="text-xs">
                      {formatDate(attemptDetail.completedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Comment Section */}
        <Card className="mb-4 border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-lg">
          <CardHeader className="py-3 px-4 border-b border-gray-700/50">
            <CardTitle className="text-sm text-gray-100">
              Feedback for Student
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-3">
              <Textarea
                id="comment"
                placeholder="Leave feedback for this student..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px] bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
              />
              <Button
                onClick={handleSaveComment}
                disabled={isSavingComment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {isSavingComment ? "Saving..." : "Save Comment"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Answers */}
        <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b border-gray-700/50 py-3 px-4">
            <CardTitle className="text-gray-100">
              Question-by-Question Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <Accordion type="single" collapsible className="w-full">
              {attemptDetail.answers.map((answer, index) => (
                <AccordionItem
                  key={answer.id}
                  value={`item-${index}`}
                  className="border-gray-700/50"
                >
                  <AccordionTrigger className="text-left py-2 px-3 hover:bg-gray-800/30 rounded-md">
                    <div className="flex items-center space-x-3 w-full">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold ${
                          answer.correct ? "bg-green-500/80" : "bg-red-500/80"
                        }`}
                      >
                        {answer.correct ? "✓" : "✗"}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-gray-200">
                          Question {index + 1}
                        </span>
                        <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">
                          {getQuestionText(answer.questionId)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Type: {getQuestionType(answer.questionId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={answer.correct ? "default" : "destructive"}
                          className={
                            answer.correct
                              ? "bg-green-900/50 text-green-300 border-green-700/50"
                              : "bg-red-900/50 text-red-300 border-red-700/50"
                          }
                        >
                          {answer.correct ? "Correct" : "Incorrect"}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(answer.timeTaken)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-2 pb-3 bg-gray-800/20 rounded-md mt-1">
                    <div className="pt-2 space-y-4">
                      {/* Question Text */}
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                        <h4 className="font-medium text-gray-300 text-sm mb-2">
                          Question:
                        </h4>
                        <p className="text-gray-200">
                          {getQuestionText(answer.questionId)}
                        </p>
                      </div>

                      {/* Question Media */}
                      <div className="space-y-3">
                        {/* Question Image */}
                        {getQuestionImage(answer.questionId) && (
                          <div>
                            <h4 className="font-medium text-gray-300 text-sm mb-2">
                              Question Image:
                            </h4>
                            <img
                              src={
                                getQuestionImage(answer.questionId) ||
                                "/placeholder.svg"
                              }
                              alt="Question visual aid"
                              className="max-w-full h-auto rounded-lg border border-gray-700/50 shadow-sm max-h-48"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "https://placehold.co/600x400/1f2937/475569?text=Image+Not+Found")
                              }
                            />
                          </div>
                        )}

                        {/* Question Audio */}
                        {getQuestionAudio(answer.questionId) && (
                          <div>
                            <h4 className="font-medium text-gray-300 text-sm mb-2">
                              Question Audio:
                            </h4>
                            <AudioPreview
                              audioUrl={getQuestionAudio(answer.questionId)!}
                              compact
                            />
                          </div>
                        )}
                      </div>

                      {/* Multiple Choice Options */}
                      {getQuestionType(answer.questionId) ===
                        "MULTIPLE_CHOICE" && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-300 text-sm">
                            All Options:
                          </h4>
                          <div className="space-y-1">
                            {getQuestionById(answer.questionId)?.options?.map(
                              (option, i) => (
                                <div
                                  key={i}
                                  className={`p-2 rounded-md border ${
                                    option.isCorrect
                                      ? "bg-green-900/20 border-green-700/40"
                                      : answer.selectedAnswers?.some(
                                          (sa) => sa.id === option.id
                                        )
                                      ? "bg-red-900/20 border-red-700/40"
                                      : "bg-gray-800/30 border-gray-700/40"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {option.isCorrect && (
                                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                    )}
                                    {!option.isCorrect &&
                                      answer.selectedAnswers?.some(
                                        (sa) => sa.id === option.id
                                      ) && (
                                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                      )}
                                    <span
                                      className={`text-sm ${
                                        option.isCorrect
                                          ? "text-green-400"
                                          : answer.selectedAnswers?.some(
                                              (sa) => sa.id === option.id
                                            )
                                          ? "text-red-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      {option.text}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Fill in the Blanks */}
                      {getQuestionType(answer.questionId) ===
                        "FILL_IN_THE_BLANK" && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-300 text-sm">
                            Blank Answers:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {getQuestionById(
                              answer.questionId
                            )?.correctBlanks?.map((blank, i) => (
                              <div key={i} className="space-y-1">
                                <p className="text-xs text-gray-400">
                                  Blank {i + 1}
                                </p>
                                <div className="flex gap-2">
                                  <div className="p-2 rounded-md bg-green-900/20 border border-green-700/40">
                                    <p className="text-sm text-green-400">
                                      Correct: {blank}
                                    </p>
                                  </div>
                                  <div
                                    className={`p-2 rounded-md ${
                                      answer.fillInBlanksAnswers?.[i] === blank
                                        ? "bg-green-900/20 border border-green-700/40"
                                        : "bg-red-900/20 border border-red-700/40"
                                    }`}
                                  >
                                    <p
                                      className={`text-sm ${
                                        answer.fillInBlanksAnswers?.[i] ===
                                        blank
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      Student:{" "}
                                      {answer.fillInBlanksAnswers?.[i] ||
                                        "No answer"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* True/False */}
                      {getQuestionType(answer.questionId) === "TRUE_FALSE" && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-300 text-sm">
                            True/False Answer:
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-2 rounded-md bg-green-900/20 border border-green-700/40">
                              <p className="text-sm text-green-400">
                                Correct:{" "}
                                {getQuestionById(answer.questionId)
                                  ?.trueFalseAnswer
                                  ? "True"
                                  : "False"}
                              </p>
                            </div>
                            <div
                              className={`p-2 rounded-md ${
                                answer.correct
                                  ? "bg-green-900/20 border border-green-700/40"
                                  : "bg-red-900/20 border border-red-700/40"
                              }`}
                            >
                              <p
                                className={`text-sm ${
                                  answer.correct
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                Student:{" "}
                                {answer.userAnswerTrueFalse ? "True" : "False"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pronunciation */}
                      {getQuestionType(answer.questionId) ===
                        "PRONUNCIATION" && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-300 text-sm">
                            Pronunciation Text:
                          </h4>
                          <div className="p-2 rounded-md bg-gray-800/40 border border-gray-700/40">
                            <p className="text-sm text-gray-200 font-mono">
                              "
                              {
                                getQuestionById(answer.questionId)
                                  ?.pronunciationText
                              }
                              "
                            </p>
                          </div>

                          {/* Student's Audio */}
                          {answer.audioUrl && (
                            <div>
                              <h4 className="font-medium text-gray-300 text-sm mb-2">
                                Student's Audio Answer:
                              </h4>
                              <AudioPreview
                                audioUrl={answer.audioUrl}
                                compact
                              />
                            </div>
                          )}

                          {/* Score */}
                          <div className="p-2 rounded-md bg-blue-900/20 border border-blue-700/40">
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-300">
                                Pronunciation Score:
                              </p>
                              <Badge
                                className={getScoreColor(
                                  answer.scoreAchieved || 0
                                )}
                              >
                                {answer.scoreAchieved || 0}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Answer Details (Simplified) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          className={`p-3 rounded-lg border ${
                            answer.correct
                              ? "bg-green-900/20 border-green-700/40"
                              : "bg-red-900/20 border-red-700/40"
                          }`}
                        >
                          <p className="font-medium text-xs mb-1 text-gray-400">
                            Student's Answer:
                          </p>
                          <p
                            className={`font-mono text-sm ${
                              answer.correct ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {getUserAnswerText(answer)}
                          </p>
                          {answer.scoreAchieved !== undefined && (
                            <p className="text-xs text-gray-400 mt-2">
                              Score: {answer.scoreAchieved}
                            </p>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/40">
                          <p className="font-medium text-xs mb-1 text-gray-400">
                            Correct Answer:
                          </p>
                          <p className="text-green-400 font-mono text-sm">
                            {getCorrectAnswerText(answer)}
                          </p>
                        </div>
                      </div>

                      {/* Question Explanation */}
                      {getQuestionExplanation(answer.questionId) && (
                        <div className="p-3 bg-blue-900/20 border border-blue-700/40 rounded-lg">
                          <p className="font-medium text-xs mb-1 text-gray-400">
                            Explanation:
                          </p>
                          <p className="text-gray-300 text-sm">
                            {getQuestionExplanation(answer.questionId)}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
