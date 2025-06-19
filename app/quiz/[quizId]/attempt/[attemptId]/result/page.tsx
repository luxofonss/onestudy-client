"use client";

import { useState, useRef, useEffect, use } from "react";
import {
  RotateCcw,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  Home,
  XCircle,
  Volume2,
  Loader2,
  Play,
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
import { trackQuizComplete } from "@/lib/utils/analytics";

// Helper functions
const formatTimeSpent = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} min ${remainingSeconds} sec`;
};

const calculateTimeSpent = (completedAt: string, createdAt: string): number => {
  const completedTime = new Date(completedAt).getTime();
  const createdTime = new Date(createdAt).getTime();
  return Math.floor((completedTime - createdTime) / 1000); // Convert ms to seconds
};

const getPerformanceText = (score: number): string => {
  if (score >= 90) return "Outstanding";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Improvement";
};

const getPerformanceColor = (score: number) => {
  if (score >= 90) return "text-green-400 bg-green-900/30 border-green-700/50";
  if (score >= 80) return "text-blue-400 bg-blue-900/30 border-blue-700/50";
  if (score >= 70)
    return "text-yellow-400 bg-yellow-900/30 border-yellow-700/50";
  return "text-red-400 bg-red-900/30 border-red-700/50";
};

const getWordScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-900/30 text-green-400 border-green-700/50";
  if (score >= 80) return "bg-blue-900/30 text-blue-400 border-blue-700/50";
  if (score >= 70)
    return "bg-yellow-900/30 text-yellow-400 border-yellow-700/50";
  return "bg-red-900/30 text-red-400 border-red-700/50";
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
  const [isPlayingReference, setIsPlayingReference] = useState<{
    [key: string]: boolean;
  }>({});

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
          
          // Track quiz completion
          trackQuizComplete(quizId, attemptResponse.data.score);
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
  // Calculate time spent based on completedAt and createdAt
  const timeSpentSeconds =
    attempt?.completedAt && attempt?.createdAt
      ? calculateTimeSpent(attempt.completedAt, attempt.createdAt)
      : attempt?.timeSpent || 0;

  const results = {
    quizId: quizId,
    quizTitle: quiz?.title || "Loading...",
    creator: quiz?.author?.name || "Unknown",
    score: attempt?.score || 0,
    totalQuestions: quiz?.questions?.length || 0,
    correctAnswers: attempt?.correctAnswers || 0,
    incorrectAnswers:
      (quiz?.questions?.length || 0) - (attempt?.correctAnswers || 0),
    timeSpent: formatTimeSpent(timeSpentSeconds),
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

            // Try to parse the pronunciation data
            let pronunciationData = null;
            if (answer.answerText && typeof answer.answerText === "string") {
              try {
                pronunciationData = JSON.parse(answer.answerText);
                // Update score from the parsed data if available
                if (
                  pronunciationData &&
                  typeof pronunciationData.pronunciationAccuracy === "number"
                ) {
                  answer.scoreAchieved =
                    pronunciationData.pronunciationAccuracy;
                }
              } catch (e) {
                console.error("Failed to parse pronunciation data:", e);
              }
            }

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

  const playReferenceAudio = (text: string, questionId: string) => {
    if (!text || isPlayingReference[questionId]) return;

    // Update state to show loading
    setIsPlayingReference((prev) => ({ ...prev, [questionId]: true }));

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.onend = () => {
      setIsPlayingReference((prev) => ({ ...prev, [questionId]: false }));
    };

    // Speak the text
    speechSynthesis.speak(utterance);
  };

  const renderPronunciationResult = (result: any) => {
    // Parse the JSON data from answerText if it exists
    let pronunciationData: any = null;

    console.log("Pronunciation result:", result);
    console.log("Raw userAnswer:", result.userAnswer);

    if (result.userAnswer && typeof result.userAnswer === "string") {
      try {
        pronunciationData = JSON.parse(result.userAnswer);
        console.log("Parsed pronunciation data:", pronunciationData);
      } catch (e) {
        console.error("Failed to parse pronunciation data:", e);
      }
    }

    return (
      <div className="space-y-4">
        {/* Audio Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-gray-800/40 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-200 text-sm">
                  Your Pronunciation
                </h4>
                <Badge className={getPerformanceColor(result.overallScore)}>
                  {result.overallScore}%
                </Badge>
              </div>
              {result.userAudioUrl && (
                <div className="bg-gray-800/70 rounded border border-gray-700/50">
                  <AudioPreview audioUrl={result.userAudioUrl} compact />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-800/40 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-200 text-sm">
                  Correct Pronunciation
                </h4>
                <Badge className="bg-green-900/50 text-green-300 border-green-700/50">
                  Reference
                </Badge>
              </div>
              {result.correctAudioUrl ? (
                <div className="bg-gray-800/70 rounded border border-gray-700/50">
                  <AudioPreview audioUrl={result.correctAudioUrl} compact />
                </div>
              ) : (
                <div className="flex justify-center mt-2">
                  <Button
                    onClick={() =>
                      playReferenceAudio(
                        pronunciationData?.realTranscripts,
                        result.questionId
                      )
                    }
                    disabled={isPlayingReference[result.questionId]}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    {isPlayingReference[result.questionId] ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4 mr-1" />
                    )}
                    Play Reference
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pronunciation Analysis - Based on pronunciation-test page */}
        {pronunciationData && (
          <div className="space-y-3 p-4 bg-gray-900/70 rounded-lg border border-gray-700/50 shadow-inner">
            <div className="text-center">
              <Badge
                className={getPerformanceColor(
                  pronunciationData.pronunciationAccuracy
                )}
              >
                {pronunciationData.pronunciationAccuracy}% Accuracy
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs mt-3">
              <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/30">
                <h4 className="font-medium text-xs text-gray-400">
                  Reference Text:
                </h4>
                <div className="font-mono text-blue-300 mt-1">
                  {pronunciationData.realTranscripts ||
                    result.pronunciationText}
                </div>
                {pronunciationData.realTranscriptsIpa && (
                  <>
                    <h4 className="font-medium text-xs text-gray-400 mt-2">
                      Reference IPA:
                    </h4>
                    <div className="font-mono text-blue-300 mt-1">
                      / {pronunciationData.realTranscriptsIpa} /
                    </div>
                  </>
                )}
              </div>
              <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/30">
                <h4 className="font-medium text-xs text-gray-400">
                  Your Text:
                </h4>
                <div className="font-mono text-purple-300 mt-1">
                  {pronunciationData.matchedTranscripts ||
                    "No transcription available"}
                </div>
                {pronunciationData.matchedTranscriptsIpa && (
                  <>
                    <h4 className="font-medium text-xs text-gray-400 mt-2">
                      Your IPA:
                    </h4>
                    <div className="font-mono text-purple-300 mt-1">
                      / {pronunciationData.matchedTranscriptsIpa} /
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Word-by-Word Analysis */}
            {pronunciationData.isLetterCorrectAllWords && (
              <div className="space-y-2 mt-3">
                <h4 className="font-medium text-gray-300 text-sm">
                  Word-by-Word Analysis:
                </h4>
                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                  <div className="text-base font-medium leading-relaxed">
                    {(() => {
                      const words = pronunciationData.realTranscripts.split(" ");
                      const letterCorrectness = pronunciationData.isLetterCorrectAllWords.split(" ");
                      
                      return words.map((word, wordIndex) => {
                        const wordCorrectness = letterCorrectness[wordIndex] || "";
                        return (
                          <span key={wordIndex} className="mr-1">
                            {word.split("").map((letter, letterIndex) => {
                              const isCorrect = wordCorrectness[letterIndex] === "1";
                              return (
                                <span
                                  key={letterIndex}
                                  className={isCorrect ? "text-green-500" : "text-red-500"}
                                >
                                  {letter}
                                </span>
                              );
                            })}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback message */}
            <div className="text-center text-sm mt-2">
              {pronunciationData.pronunciationAccuracy >= 80 ? (
                <div className="flex items-center justify-center text-green-500 bg-green-900/20 py-2 px-3 rounded-md">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Excellent pronunciation!
                </div>
              ) : pronunciationData.pronunciationAccuracy >= 60 ? (
                <div className="flex items-center justify-center text-yellow-500 bg-yellow-900/20 py-2 px-3 rounded-md">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Good job! Keep practicing.
                </div>
              ) : (
                <div className="flex items-center justify-center text-red-500 bg-red-900/20 py-2 px-3 rounded-md">
                  <XCircle className="h-4 w-4 mr-1" />
                  Keep practicing to improve.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Original Word Analysis Section - Keep as fallback */}
        {!pronunciationData &&
          result.wordAnalysis &&
          result.wordAnalysis.length > 0 && (
            <>
              {console.log("Word Analysis Data:", {
                pronunciationText: result.pronunciationText,
                question: result.question,
                wordAnalysis: result.wordAnalysis
              })}
              {/* Text with Word-by-Word Analysis */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300 text-sm">
                  Word-by-Word Analysis:
                </h4>
                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                  <div className="text-base font-medium leading-relaxed">
                    {(() => {
                      // Find the best source for the text to analyze
                      const textToAnalyze = result.pronunciationText || 
                                           (result.wordAnalysis.length > 0 && result.wordAnalysis.map(w => w.word).join(' ')) || 
                                           result.question || 
                                           "";
                      
                      return textToAnalyze.split(" ").map((word, wordIndex) => {
                        const wordData = result.wordAnalysis.find(w => w.word.toLowerCase() === word.toLowerCase());
                        const isCorrect = wordData ? wordData.correct : false;
                        
                        return (
                          <span key={wordIndex} className={`mr-1 ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                            {word}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Detailed Phonetic Analysis */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300 text-sm">
                  Phonetic Analysis:
                </h4>
                <div className="space-y-2">
                  {result.wordAnalysis.map((word: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getWordScoreColor(
                        word.score
                      )}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">
                          {word.word}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-current text-xs"
                        >
                          {word.score}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-gray-300">
                            Your pronunciation:
                          </span>
                          <div className="font-mono bg-gray-900/50 p-2 rounded mt-1 text-gray-300">
                            {word.userPronunciation}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-300">
                            Correct pronunciation:
                          </span>
                          <div className="font-mono bg-gray-900/50 p-2 rounded mt-1 text-gray-300">
                            {word.correctPronunciation}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        {/* Overall Feedback */}
        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800/30">
          <h4 className="font-medium text-blue-400 mb-1 text-sm">Feedback:</h4>
          <p className="text-gray-300 text-sm">{result.explanation}</p>
        </div>

        {/* Pronunciation Tips */}
        {!result.isCorrect && (
          <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-800/30">
            <h4 className="font-medium text-yellow-400 mb-1 text-sm">
              💡 Pronunciation Tips:
            </h4>
            <ul className="text-gray-300 space-y-1 text-xs">
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
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className={`p-3 rounded-lg border ${
              result.isCorrect
                ? "bg-green-900/20 border-green-700/40"
                : "bg-red-900/20 border-red-700/40"
            }`}
          >
            <p className="font-medium text-xs mb-1 text-gray-400">
              Your Answer:
            </p>
            <p
              className={`font-mono text-sm ${
                result.isCorrect ? "text-green-400" : "text-red-400"
              }`}
            >
              {result.userAnswer || "No answer provided"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/40">
            <p className="font-medium text-xs mb-1 text-gray-400">
              Correct Answer:
            </p>
            <p className="text-green-400 font-mono text-sm">
              {result.correctAnswer}
            </p>
          </div>
        </div>
        <div className="p-3 bg-blue-900/20 border border-blue-700/40 rounded-lg">
          <p className="font-medium text-xs mb-1 text-gray-400">Explanation:</p>
          <p className="text-gray-300 text-sm">{result.explanation}</p>
        </div>
      </div>
    );
  };

  const renderFillInBlankResult = (result: any) => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className={`p-3 rounded-lg border ${
              result.isCorrect
                ? "bg-green-900/20 border-green-700/40"
                : "bg-red-900/20 border-red-700/40"
            }`}
          >
            <p className="font-medium text-xs mb-1 text-gray-400">
              Your Answers:
            </p>
            <div className="space-y-1">
              {(result.userAnswer as string[]).map((answer, index) => (
                <p
                  key={index}
                  className={`font-mono text-sm ${
                    answer === result.correctAnswer[index]
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {answer}
                </p>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/40">
            <p className="font-medium text-xs mb-1 text-gray-400">
              Correct Answers:
            </p>
            <div className="space-y-1">
              {(result.correctAnswer as string[]).map((answer, index) => (
                <p key={index} className="text-green-400 font-mono text-sm">
                  {answer}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 bg-blue-900/20 border border-blue-700/40 rounded-lg">
          <p className="font-medium text-xs mb-1 text-gray-400">Explanation:</p>
          <p className="text-gray-300 text-sm">{result.explanation}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-300">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Results Not Found</h2>
          <p className="mb-6">The quiz results could not be loaded.</p>
          <Link href="/library">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Return to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  console.log("results:: ", results);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border border-gray-800/50 backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 text-transparent bg-clip-text mb-1">
              Quiz Complete!
            </h1>
            <p className="text-gray-400 text-sm mb-1">
              Here's how you performed on
            </p>
            <h2 className="text-lg font-semibold text-gray-200">
              {results.quizTitle}
            </h2>
            <p className="text-xs text-gray-400">
              Created by {results.creator}
            </p>
          </div>

          {/* Score Card */}
          <Card className="border-gray-800/40 bg-gray-800/30 backdrop-blur-sm shadow-xl w-full lg:w-auto">
            <CardHeader className="text-center p-3 space-y-2">
              <div className="relative w-24 h-24 mx-auto mb-2">
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${
                      (results.score / results.maxScore) * 314
                    } 314`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {results.score}/{results.maxScore}
                  </span>
                </div>
              </div>
              <CardTitle className="text-base font-bold text-gray-100 mb-1">
                <Badge
                  className={`${getPerformanceColor(
                    scorePercent
                  )} text-sm px-3 py-1`}
                >
                  {getPerformanceText(scorePercent || 0)}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-gray-300">
                {results.correctAnswers} of {results.totalQuestions} correct
              </CardDescription>
              <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-400">
                <span>{results.completedAt}</span>
                <span>•</span>
                <span
                  className={
                    results.passed
                      ? "text-green-400 font-medium"
                      : "text-red-400 font-medium"
                  }
                >
                  {results.passed ? "PASSED" : "FAILED"} ({results.passingScore}
                  %)
                </span>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-gray-800/40 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <div className="bg-teal-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-5 w-5 text-teal-400" />
              </div>
              <h3 className="font-medium text-gray-300 text-xs mb-1">
                Accuracy
              </h3>
              <p className="text-xl font-bold text-teal-400">
                {results.accuracy}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800/40 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <div className="bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-medium text-gray-300 text-xs mb-1">Time</h3>
              <p className="text-xl font-bold text-blue-400">
                {results.timeSpent}{" "}
                {results?.quiz?.timeLimit
                  ? ` / ${results?.quiz?.timeLimit} minutes`
                  : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800/40 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <div className="bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="font-medium text-gray-300 text-xs mb-1">
                Correct
              </h3>
              <p className="text-xl font-bold text-green-400">
                {results.correctAnswers}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800/40 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <div className="bg-red-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-red-400 font-bold text-lg">✗</span>
              </div>
              <h3 className="font-medium text-gray-300 text-xs mb-1">
                Incorrect
              </h3>
              <p className="text-xl font-bold text-red-400">
                {results.incorrectAnswers}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card className="border-gray-800/40 bg-gray-800/30 backdrop-blur-sm shadow-xl mb-6">
          <CardHeader className="border-b border-gray-700/50 py-3 px-4">
            <CardTitle className="text-lg text-gray-100">
              Detailed Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Review your answers and pronunciation analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <Accordion type="single" collapsible className="w-full">
              {detailedResults.map((result, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-gray-700/50"
                >
                  <AccordionTrigger className="text-left py-2 px-3 hover:bg-gray-800/30 rounded-md">
                    <div className="flex items-center space-x-3 w-full">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold ${
                          result.isCorrect ? "bg-green-500/80" : "bg-red-500/80"
                        }`}
                      >
                        {result.isCorrect ? "✓" : "✗"}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm text-gray-200">
                          Question {result.questionNumber}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {result.question}
                        </p>
                        {result.type === "pronunciation" && (
                          <p className="text-xs font-mono text-blue-400 mt-0.5">
                            "{result.pronunciationText}"
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={result.isCorrect ? "default" : "destructive"}
                          className={
                            result.isCorrect
                              ? "bg-green-900/50 text-green-300 border-green-700/50"
                              : "bg-red-900/50 text-red-300 border-red-700/50"
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
                  <AccordionContent className="px-3 pt-2 pb-3 bg-gray-800/20 rounded-md mt-1">
                    <div className="pt-2 space-y-4">
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
                            className="max-w-full h-auto rounded-lg border border-gray-700/50 shadow-sm max-h-48 mx-auto"
                            onError={(e) =>
                              (e.currentTarget.src =
                                "https://placehold.co/600x400/1f2937/475569?text=Image+Not+Found")
                            }
                          />
                        </div>
                      )}

                      {/* Question Audio */}
                      {quiz?.questions.find((q) => q.id === result.questionId)
                        ?.audioUrl && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-300 text-sm mb-2">
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/content/${results.quizId}`}>
            <Button
              size="default"
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white px-6 py-2 shadow-lg shadow-blue-900/20 transform hover:scale-105 transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
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
              size="default"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800/50 px-6 py-2 transform hover:scale-105 transition-all duration-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
