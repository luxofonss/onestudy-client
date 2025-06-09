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
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!attemptDetail) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Attempt not found
        </h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/quiz/${quizId}/analytics`)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">
                    Student Attempt Details
                  </CardTitle>
                  <p className="text-gray-600">{attemptDetail.quiz.title}</p>
                </div>
                <Badge
                  className={`${getScoreColor(
                    attemptDetail.score
                  )} text-lg px-3 py-1`}
                >
                  {attemptDetail.score}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {attemptDetail.user?.name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {attemptDetail.user?.email || "No email provided"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span>
                        {attemptDetail.correctAnswers}/
                        {attemptDetail.totalQuestions ||
                          attemptDetail.answers.length}{" "}
                        correct
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{formatTime(attemptDetail.timeSpent)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>{formatDate(attemptDetail.completedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {attemptDetail.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          attemptDetail.passed
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {attemptDetail.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="comment" className="text-sm font-medium">
                      Your Comment for Student
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="Leave feedback for this student..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                  <Button
                    onClick={handleSaveComment}
                    disabled={isSavingComment}
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isSavingComment ? "Saving..." : "Save Comment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Question-by-Question Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {attemptDetail.answers.map((answer, index) => (
                <AccordionItem key={answer.id} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-3 w-full">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          answer.correct ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {answer.correct ? "✓" : "✗"}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {getQuestionText(answer.questionId)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: {getQuestionType(answer.questionId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={answer.correct ? "default" : "destructive"}
                        >
                          {answer.correct ? "Correct" : "Incorrect"}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(answer.timeTaken)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-4">
                      {/* Question Media */}
                      <div className="space-y-3">
                        {/* Question Image */}
                        {getQuestionImage(answer.questionId) && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">
                              Question Image:
                            </h4>
                            <img
                              src={
                                getQuestionImage(answer.questionId) ||
                                "/placeholder.svg"
                              }
                              alt="Question visual aid"
                              className="max-w-full h-auto rounded-lg border shadow-sm max-h-48"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "https://placehold.co/600x400/eee/ccc?text=Image+Not+Found")
                              }
                            />
                          </div>
                        )}

                        {/* Question Audio */}
                        {getQuestionAudio(answer.questionId) && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">
                              Question Audio:
                            </h4>
                            <AudioPreview
                              audioUrl={getQuestionAudio(answer.questionId)!}
                              compact
                            />
                          </div>
                        )}
                      </div>

                      {/* Answer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className={`p-4 rounded-lg border ${
                            answer.correct
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <p className="font-medium text-sm mb-2">
                            Student's Answer:
                          </p>
                          <p
                            className={`font-mono ${
                              answer.correct ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {getUserAnswerText(answer)}
                          </p>
                          {answer.scoreAchieved !== undefined && (
                            <p className="text-sm text-gray-600 mt-2">
                              Score: {answer.scoreAchieved}
                            </p>
                          )}
                        </div>
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <p className="font-medium text-sm mb-2">
                            Correct Answer:
                          </p>
                          <p className="text-green-700 font-mono">
                            {getCorrectAnswerText(answer)}
                          </p>
                        </div>
                      </div>

                      {/* Audio if available */}
                      {answer.audioUrl && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">
                            Student's Audio Answer:
                          </h4>
                          <AudioPreview audioUrl={answer.audioUrl} compact />
                        </div>
                      )}

                      {/* Question Explanation */}
                      {getQuestionExplanation(answer.questionId) && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-medium text-sm mb-2">
                            Explanation:
                          </p>
                          <p className="text-blue-700">
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
