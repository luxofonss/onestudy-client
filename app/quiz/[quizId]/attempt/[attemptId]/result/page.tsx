"use client";

import { useState, useRef, useEffect, use } from "react";
import {
  RotateCcw,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { quizService } from "@/lib/services/quiz-service";
import { useToast } from "@/hooks/use-toast";
import { SUCCESS_CODE } from "@/lib/constants";
import type { IQuiz, IQuizAttempt } from "@/lib/types/api-types";
import { AudioPreview } from "@/components/ui/audio-preview";
import { useParams } from "next/navigation";

// Helper functions
const formatTimeSpent = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} min ${remainingSeconds} sec`;
};

const getPerformanceText = (score: number): string => {
  if (score >= 90) return "Outstanding";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Improvement";
};

const getPerformanceColor = (score: number) => {
  if (score >= 90) return "text-green-600 bg-green-50";
  if (score >= 80) return "text-blue-600 bg-blue-50";
  if (score >= 70) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

const getWordScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
  if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export default function QuizResultsPage() {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [attempt, setAttempt] = useState<IQuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const paramsValue = useParams();
  const quizId = paramsValue.quizId as string;
  const attemptId = paramsValue.attemptId as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [quizResponse, attemptResponse] = await Promise.all([
          quizService.getQuizById(quizId),
          quizService.getQuizAttempt(attemptId),
        ]);

        if (quizResponse.meta.code === SUCCESS_CODE && quizResponse.data) {
          setQuiz(quizResponse.data);
        }

        if (
          attemptResponse.meta.code === SUCCESS_CODE &&
          attemptResponse.data
        ) {
          setAttempt(attemptResponse.data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quiz results",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [quizId, attemptId, toast]);

  // Calculate derived data
  const quizMaxScore =
    quiz?.questions?.reduce(
      (total, question) => total + (question.points || 0),
      0
    ) || 0;
  const scorePercent = (attempt?.score ?? 0 / quizMaxScore) * 100 || 0;
  const results = {
    quizId: quizId,
    quizTitle: quiz?.title || "Loading...",
    creator: quiz?.author?.name || "Unknown",
    score: attempt?.score || 0,
    totalQuestions: quiz?.questions?.length || 0,
    correctAnswers: attempt?.correctAnswers || 0,
    incorrectAnswers:
      (quiz?.questions?.length || 0) - (attempt?.correctAnswers || 0),
    timeSpent: formatTimeSpent(attempt?.timeSpent || 0),
    accuracy: attempt
      ? Math.round((attempt.correctAnswers / quiz?.questions?.length) * 100)
      : 0,
    maxScore: quizMaxScore,
    performance: getPerformanceText(scorePercent || 0),
    completedAt: attempt?.completedAt
      ? new Date(attempt.completedAt).toLocaleString()
      : "",
    passingScore: quiz?.passingScore || 0,
    passed:
      (attempt?.score ?? 0) >= quizMaxScore * ((quiz?.passingScore ?? 0) / 100),
  };

  // Map attempt answers to detailed results
  const detailedResults =
    attempt?.answers
      .map((answer, index) => {
        const question = quiz?.questions.find(
          (q) => q.id === answer.questionId
        );
        if (!question) return null;

        // Get correct answer based on question type
        let correctAnswer: string | string[] | null = null;
        let userAnswer: string | string[] | null = null;
        let isCorrect = false;

        switch (question.type.toLowerCase()) {
          case "multiple_choice":
            // Find the single correct option
            const correctOption = question.options?.find(
              (opt) => opt.isCorrect
            );
            correctAnswer = correctOption?.text || null;

            // Get user's selected answer
            const selectedAnswer = answer.selectedAnswers?.[0]; // Only take the first selected answer
            userAnswer =
              question.options?.find((opt) => opt.id === selectedAnswer.id)
                ?.text || null;

            // Check if user's answer matches the correct option
            console.log(selectedAnswer);
            console.log(correctOption);
            isCorrect = selectedAnswer.id === correctOption?.id;
            break;
          case "fill_in_the_blank":
            correctAnswer = question.correctBlanks || [];
            userAnswer = answer.fillInBlanksAnswers || [];
            isCorrect =
              JSON.stringify(correctAnswer) === JSON.stringify(userAnswer);
            break;
          case "pronunciation":
            correctAnswer = question.pronunciationText || null;
            userAnswer = answer.answerText || null;
            isCorrect = answer.correct || false;
            break;
          case "true_false":
            correctAnswer = question.trueFalseAnswer ? "True" : "False";
            userAnswer = answer.userAnswerTrueFalse ? "True" : "False";
            isCorrect = answer.correct || false;
            break;
        }

        return {
          questionNumber: index + 1,
          question: question.text,
          type: question.type.toLowerCase(),
          pronunciationText: question.pronunciationText,
          userPronunciation: answer.answerText,
          isCorrect,
          overallScore: answer.scoreAchieved || 0,
          explanation: question.explanation,
          timeSpent: formatTimeSpent(answer.timeTaken || 0),
          wordAnalysis: answer.wordAnalysis
            ? [
                {
                  word: answer.wordAnalysis.word,
                  correct: true,
                  userPronunciation: answer.wordAnalysis.pronunciation,
                  correctPronunciation: answer.wordAnalysis.pronunciation,
                  score: answer.scoreAchieved || 0,
                },
              ]
            : [],
          userAudioUrl: answer.audioUrl,
          correctAudioUrl: question.audioUrl,
          // Add new fields for multiple choice and fill in blank
          correctAnswer,
          userAnswer,
          questionId: question.id,
        };
      })
      .filter(Boolean) || [];

  const [quizLeaderboard] = useState([
    {
      rank: 1,
      user: {
        name: "Emma Rodriguez",
        avatar: "/placeholder.svg",
        country: "Spain",
      },
      score: 95,
      completionTime: "12 min 15 sec",
      accuracy: 95,
      attempts: 2,
      lastAttempt: "1 day ago",
    },
    {
      rank: 2,
      user: { name: "You", avatar: "/placeholder.svg", country: "USA" },
      score: results.score,
      completionTime: results.timeSpent,
      accuracy: results.accuracy,
      attempts: 1,
      lastAttempt: "Just now",
    },
    {
      rank: 3,
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg",
        country: "USA",
      },
      score: 85,
      completionTime: "18 min 30 sec",
      accuracy: 85,
      attempts: 3,
      lastAttempt: "2 hours ago",
    },
    {
      rank: 4,
      user: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg",
        country: "Canada",
      },
      score: 82,
      completionTime: "16 min 45 sec",
      accuracy: 82,
      attempts: 1,
      lastAttempt: "5 hours ago",
    },
    {
      rank: 5,
      user: {
        name: "Marco Silva",
        avatar: "/placeholder.svg",
        country: "Brazil",
      },
      score: 79,
      completionTime: "20 min 12 sec",
      accuracy: 79,
      attempts: 2,
      lastAttempt: "1 day ago",
    },
  ]);

  const playAudio = (audioUrl: string, audioId: string) => {
    // Stop any currently playing audio
    if (playingAudio && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }

    if (playingAudio === audioId) {
      setPlayingAudio(null);
      return;
    }

    // Create audio element if it doesn't exist
    if (!audioRefs.current[audioId]) {
      audioRefs.current[audioId] = new Audio(audioUrl);
      audioRefs.current[audioId].addEventListener("ended", () => {
        setPlayingAudio(null);
      });
    }

    audioRefs.current[audioId].play();
    setPlayingAudio(audioId);
  };

  const stopAudio = () => {
    if (playingAudio && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
      setPlayingAudio(null);
    }
  };

  const renderPronunciationResult = (result: any) => {
    return (
      <div className="space-y-6">
        {/* Audio Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-800">
                  Your Pronunciation
                </h4>
                <Badge className={getPerformanceColor(scorePercent)}>
                  {result.overallScore}%
                </Badge>
              </div>
              {result.userAudioUrl && (
                <AudioPreview audioUrl={result.userAudioUrl} compact />
              )}
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-800">
                  Correct Pronunciation
                </h4>
                <Badge className="bg-green-100 text-green-800">Reference</Badge>
              </div>
              {result.correctAudioUrl && (
                <AudioPreview audioUrl={result.correctAudioUrl} compact />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Text with Word-by-Word Analysis */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Word-by-Word Analysis:</h4>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex flex-wrap gap-2 mb-4">
              {result.wordAnalysis.map((word: any, index: number) => (
                <span
                  key={index}
                  className={`px-3 py-2 rounded-lg border font-mono text-lg ${
                    word.correct
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }`}
                  title={`Score: ${word.score}%`}
                >
                  {word.word}
                  {!word.correct && <span className="ml-1 text-xs">❌</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Phonetic Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Phonetic Analysis:</h4>
          <div className="space-y-3">
            {result.wordAnalysis.map((word: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getWordScoreColor(
                  word.score
                )}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{word.word}</span>
                  <Badge variant="outline" className="border-current">
                    {word.score}%
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Your pronunciation:</span>
                    <div className="font-mono bg-white/50 p-2 rounded mt-1">
                      {word.userPronunciation}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Correct pronunciation:</span>
                    <div className="font-mono bg-white/50 p-2 rounded mt-1">
                      {word.correctPronunciation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Feedback:</h4>
          <p className="text-blue-700">{result.explanation}</p>
        </div>

        {/* Pronunciation Tips */}
        {!result.isCorrect && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">
              💡 Pronunciation Tips:
            </h4>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• Listen to the correct pronunciation multiple times</li>
              <li>• Practice breaking down difficult words into syllables</li>
              <li>• Pay attention to stress patterns and intonation</li>
              <li>• Record yourself and compare with the reference</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderMultipleChoiceResult = (result: any) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border ${
              result.isCorrect
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="font-medium text-sm mb-2">Your Answer:</p>
            <p
              className={`font-mono ${
                result.isCorrect ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.userAnswer || "No answer provided"}
              {result.userAnswer}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-medium text-sm mb-2">Correct Answer:</p>
            <p className="text-green-700 font-mono">{result.correctAnswer}</p>
          </div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-medium text-sm mb-2">Explanation:</p>
          <p className="text-blue-700">{result.explanation}</p>
        </div>
      </div>
    );
  };

  const renderFillInBlankResult = (result: any) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border ${
              result.isCorrect
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="font-medium text-sm mb-2">Your Answers:</p>
            <div className="space-y-2">
              {(result.userAnswer as string[]).map((answer, index) => (
                <p
                  key={index}
                  className={`font-mono ${
                    answer === result.correctAnswer[index]
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {answer}
                </p>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-medium text-sm mb-2">Correct Answers:</p>
            <div className="space-y-2">
              {(result.correctAnswer as string[]).map((answer, index) => (
                <p key={index} className="text-green-700 font-mono">
                  {answer}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-medium text-sm mb-2">Explanation:</p>
          <p className="text-blue-700">{result.explanation}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading quiz results...
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="flex justify-center items-center h-screen">
        Quiz results not found
      </div>
    );
  }

  console.log("results:: ", results);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-6">
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start mb-3">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Complete! vv
          </h1>
          <p className="text-gray-600 mb-2">Here's how you performed on</p>
          <h2 className="text-lg font-semibold text-gray-800">
            {results.quizTitle}
          </h2>
          <p className="text-sm text-gray-500">Created by {results.creator}</p>
        </div>

        {/* Score Card */}
        <Card className="border-teal-100 w-full lg:w-auto">
          <CardHeader className="text-center p-4">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg
                className="w-24 h-24 transform -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#0d9488"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${
                    (results.score / results.maxScore) * 314
                  } 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-teal-600">
                  {results.score} / {results.maxScore}
                </span>
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              <Badge
                className={`${getPerformanceColor(
                  scorePercent
                )} text-base px-3 py-1`}
              >
                {getPerformanceText(scorePercent || 0)}
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">
              You scored {results.correctAnswers} out of{" "}
              {results.totalQuestions} questions correctly
            </CardDescription>
            <div className="mt-3 flex items-center justify-center space-x-3 text-sm text-gray-500">
              <span>Completed: {results.completedAt}</span>
              <span>•</span>
              <span
                className={
                  results.passed
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {results.passed ? "PASSED" : "FAILED"} (Required:{" "}
                {results.passingScore}%)
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-teal-100">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-teal-600 mx-auto mb-1" />
            <h3 className="font-semibold text-base mb-1">Accuracy</h3>
            <p className="text-xl font-bold text-teal-600">
              {results.accuracy}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-100">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-teal-600 mx-auto mb-1" />
            <h3 className="font-semibold text-base mb-1">Time Spent</h3>
            <p className="text-xl font-bold text-teal-600">
              {results.timeSpent}
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-100">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <h3 className="font-semibold text-base mb-1">Correct</h3>
            <p className="text-xl font-bold text-green-600">
              {results.correctAnswers}
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-100">
          <CardContent className="p-4 text-center">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-red-600 font-bold text-base">✗</span>
            </div>
            <h3 className="font-semibold text-base mb-1">Incorrect</h3>
            <p className="text-xl font-bold text-red-600">
              {results.incorrectAnswers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card className="border-teal-100 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Detailed Breakdown</CardTitle>
          <CardDescription>
            Review your answers and pronunciation analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {detailedResults.map((result, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3 w-full">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        result.isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {result.isCorrect ? "✓" : "✗"}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium">
                        Question {result.questionNumber}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {result.question}
                      </p>
                      {result.type === "pronunciation" && (
                        <p className="text-sm font-mono text-blue-600 mt-1">
                          "{result.pronunciationText}"
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={result.isCorrect ? "default" : "destructive"}
                        className={
                          result.isCorrect ? "bg-green-100 text-green-800" : ""
                        }
                      >
                        {result.type === "pronunciation"
                          ? `${result.overallScore}%`
                          : result.isCorrect
                          ? "Correct"
                          : "Incorrect"}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {result.timeSpent}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4">
                    {/* Question Image */}
                    {quiz?.questions.find((q) => q.id === result.questionId)
                      ?.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={
                            quiz.questions.find(
                              (q) => q.id === result.questionId
                            )?.imageUrl || "/placeholder.svg"
                          }
                          alt="Question visual aid"
                          className="max-w-full h-auto rounded-lg border shadow-sm max-h-64 mx-auto"
                          onError={(e) =>
                            (e.currentTarget.src =
                              "https://placehold.co/600x400/eee/ccc?text=Image+Not+Found")
                          }
                        />
                      </div>
                    )}

                    {/* Question Audio */}
                    {quiz?.questions.find((q) => q.id === result.questionId)
                      ?.audioUrl && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Question Audio:
                        </h4>
                        <AudioPreview
                          audioUrl={
                            quiz.questions.find(
                              (q) => q.id === result.questionId
                            )?.audioUrl!
                          }
                          compact
                        />
                      </div>
                    )}

                    {result.type === "pronunciation"
                      ? renderPronunciationResult(result)
                      : result.type === "multiple_choice"
                      ? renderMultipleChoiceResult(result)
                      : result.type === "fill_in_the_blank"
                      ? renderFillInBlankResult(result)
                      : renderMultipleChoiceResult(result)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quiz Leaderboard */}
      {/** TODO: implement in the future */}
      {/* <Card className="border-blue-100 mb-8">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Quiz Leaderboard
          </CardTitle>
          <CardDescription>Top performers on this quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quizLeaderboard.map((entry) => (
              <LeaderboardCard
                key={entry.rank}
                entry={entry}
                isCurrentUser={entry.user.name === "You"}
                showDetails={true}
                className="bg-gray-50"
              />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/leaderboard">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                View Global Leaderboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card> */}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={`/content/${results.quizId}`}>
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 transform hover:scale-105 transition-all duration-200"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Retake Quiz
          </Button>
        </Link>
        {/* <Link href="/attempted-quizzes">
          <Button
            size="lg"
            variant="outline"
            className="border-gray-600 text-gray-600 hover:bg-gray-50 px-8 py-4 transform hover:scale-105 transition-all duration-200"
          >
            <Eye className="h-5 w-5 mr-2" />
            View All Results
          </Button>
        </Link> */}
        <Link href="/">
          <Button
            size="lg"
            variant="outline"
            className="border-gray-600 text-gray-600 hover:bg-gray-50 px-8 py-4 transform hover:scale-105 transition-all duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
