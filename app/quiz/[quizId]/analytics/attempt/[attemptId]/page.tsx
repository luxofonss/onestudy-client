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

interface QuizAttemptDetail {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  passed: boolean;
  creatorComment?: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    passingScore: number;
  };
  answers: Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    questionImage?: string;
    questionAudio?: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    timeSpent: number;
    explanation?: string;
    audioUrl?: string;
    correctAudioUrl?: string;
  }>;
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
        // Mock data - replace with actual API call
        const mockDetail: QuizAttemptDetail = {
          id: attemptId as string,
          userId: "user1",
          userName: "Alice Johnson",
          userEmail: "alice@example.com",
          userAvatar: "/placeholder.svg",
          score: 85,
          totalQuestions: 5,
          correctAnswers: 4,
          timeSpent: 2700,
          completedAt: "2024-01-20T10:30:00Z",
          passed: true,
          creatorComment:
            "Great job! Your pronunciation has improved significantly.",
          quiz: {
            id: quizId as string,
            title: "Advanced English Grammar",
            description:
              "Test your knowledge of advanced English grammar concepts",
            passingScore: 70,
          },
          answers: [
            {
              questionId: "q1",
              questionText: "Pronounce the word 'pronunciation'",
              questionType: "pronunciation",
              questionImage: "/images/pronunciation-example.jpg", // Add this
              questionAudio: "/audio/pronunciation-question.mp3", // Add this
              userAnswer: "prə-ˌnən-sē-ˈā-shən",
              correctAnswer: "prə-ˌnən-sē-ˈā-shən",
              isCorrect: true,
              timeSpent: 45,
              explanation:
                "Perfect pronunciation! You nailed the stress pattern.",
              audioUrl: "/audio/user-pronunciation.mp3",
              correctAudioUrl: "/audio/correct-pronunciation.mp3",
            },
            {
              questionId: "q2",
              questionText: "What is the past tense of 'go'?",
              questionType: "multiple_choice",
              userAnswer: "went",
              correctAnswer: "went",
              isCorrect: true,
              timeSpent: 15,
              explanation:
                "Correct! 'Went' is the irregular past tense of 'go'.",
            },
            {
              questionId: "q3",
              questionText:
                "Fill in the blank: I _____ to the store yesterday.",
              questionType: "fill_in_the_blank",
              userAnswer: "went",
              correctAnswer: "went",
              isCorrect: true,
              timeSpent: 20,
              explanation: "Perfect! You used the correct past tense form.",
            },
            {
              questionId: "q4",
              questionText:
                "True or False: 'Their' and 'there' are homophones.",
              questionType: "true_false",
              userAnswer: "true",
              correctAnswer: "true",
              isCorrect: true,
              timeSpent: 12,
              explanation:
                "Correct! Homophones are words that sound the same but have different meanings.",
            },
            {
              questionId: "q5",
              questionText: "Pronounce the word 'schedule'",
              questionType: "pronunciation",
              userAnswer: "ˈsked-yül",
              correctAnswer: "ˈsked-yül",
              isCorrect: false,
              timeSpent: 60,
              explanation:
                "Close! The American pronunciation is 'SKED-yool', while British is 'SHED-yool'.",
              audioUrl: "/audio/user-schedule.mp3",
              correctAudioUrl: "/audio/correct-schedule.mp3",
            },
          ],
        };

        setAttemptDetail(mockDetail);
        setComment(mockDetail.creatorComment || "");
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
                        {attemptDetail.userName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {attemptDetail.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span>
                        {attemptDetail.correctAnswers}/
                        {attemptDetail.totalQuestions} correct
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
                <AccordionItem key={answer.questionId} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-3 w-full">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          answer.isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {answer.isCorrect ? "✓" : "✗"}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {answer.questionText}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={answer.isCorrect ? "default" : "destructive"}
                        >
                          {answer.isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(answer.timeSpent)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-4">
                      {/* Question Media */}
                      <div className="space-y-3">
                        {/* Question Image */}
                        {answer.questionImage && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">
                              Question Image:
                            </h4>
                            <img
                              src={answer.questionImage || "/placeholder.svg"}
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
                        {answer.questionAudio && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">
                              Question Audio:
                            </h4>
                            <AudioPreview
                              audioUrl={answer.questionAudio}
                              compact
                            />
                          </div>
                        )}
                      </div>

                      {answer.questionType === "pronunciation" ? (
                        <div className="space-y-4">
                          {/* Audio Controls */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-blue-200 bg-blue-50">
                              <CardContent className="p-4">
                                <h4 className="font-medium text-blue-800 mb-3">
                                  Student's Pronunciation
                                </h4>
                                {answer.audioUrl && (
                                  <AudioPreview
                                    audioUrl={answer.audioUrl}
                                    compact
                                  />
                                )}
                              </CardContent>
                            </Card>

                            <Card className="border-green-200 bg-green-50">
                              <CardContent className="p-4">
                                <h4 className="font-medium text-green-800 mb-3">
                                  Correct Pronunciation
                                </h4>
                                {answer.correctAudioUrl && (
                                  <AudioPreview
                                    audioUrl={answer.correctAudioUrl}
                                    compact
                                  />
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className={`p-4 rounded-lg border ${
                              answer.isCorrect
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <p className="font-medium text-sm mb-2">
                              Student's Answer:
                            </p>
                            <p
                              className={`font-mono ${
                                answer.isCorrect
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {answer.userAnswer || "No answer provided"}
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                            <p className="font-medium text-sm mb-2">
                              Correct Answer:
                            </p>
                            <p className="text-green-700 font-mono">
                              {answer.correctAnswer}
                            </p>
                          </div>
                        </div>
                      )}

                      {answer.explanation && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-medium text-sm mb-2">
                            Explanation:
                          </p>
                          <p className="text-blue-700">{answer.explanation}</p>
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
