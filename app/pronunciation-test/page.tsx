"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Mic,
  Play,
  Square,
  RotateCcw,
  Volume2,
  Shuffle,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  pronunciationService,
  type PronunciationSample,
  type PronunciationResult,
} from "@/lib/services/pronunciation-service";
import { SUCCESS_CODE } from "@/lib/constants";

type DifficultyLevel = "EASY" | "MEDIUM" | "HARD" | "RANDOM";
type RecordingState = "idle" | "recording" | "processing" | "completed";

export default function PronunciationTestPage() {
  const { toast } = useToast();

  // State management
  const [currentSample, setCurrentSample] =
    useState<PronunciationSample | null>(null);
  const currentSampleRef = useRef<PronunciationSample | null>(null);
  const [customText, setCustomText] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("EASY");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update ref when currentSample changes
  useEffect(() => {
    console.log("currentSample:: ", currentSample);
    currentSampleRef.current = currentSample;
  }, [currentSample]);

  // Initialize media devices
  useEffect(() => {
    initializeMediaDevices();
    generateRandomSample();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const initializeMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000,
        },
      });
      streamRef.current = stream;

      // Check for supported MIME types
      const mimeTypes = [
        "audio/webm",
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/mp4",
        "audio/mpeg",
        "audio/wav",
      ];

      // Find the first supported MIME type
      const supportedMimeType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      if (!supportedMimeType) {
        throw new Error("No supported audio MIME types found in your browser");
      }

      console.log("Using MIME type:", supportedMimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          // Double check if we have a valid sample before processing
          if (!currentSampleRef.current) {
            throw new Error("No sample text available for comparison");
          }

          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/ogg;",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          recordedAudioRef.current = new Audio(audioUrl);

          await processPronunciation(audioBlob);
          audioChunksRef.current = [];
        } catch (error) {
          console.error("Recording processing error:", error);
          toast({
            title: "Processing Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to process recording. Please try again.",
            variant: "destructive",
          });
          setRecordingState("idle");
        }
      };
    } catch (error) {
      console.error("Media initialization error:", error);

      // Check if it's a permission error
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast({
          title: "Microphone Access Required",
          description: (
            <div className="space-y-2">
              <p>
                Please allow microphone access to use the pronunciation feature.
              </p>
              <p className="text-sm text-gray-500">
                1. Click the camera/microphone icon in your browser's address
                bar
                <br />
                2. Select "Allow" for microphone access
                <br />
                3. Refresh the page
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          ),
          variant: "destructive",
          duration: 10000, // Show for 10 seconds
        });
      } else if (
        error instanceof Error &&
        error.message.includes("MIME types")
      ) {
        toast({
          title: "Browser Compatibility Error",
          description:
            "Your browser doesn't support the required audio recording features. Please try using Chrome, Firefox, or Edge.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Microphone Error",
          description:
            "Could not access microphone. Please check your device settings and try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Add a retry function for microphone initialization
  const retryMicrophoneAccess = async () => {
    try {
      // Stop any existing tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Clear existing recorder
      mediaRecorderRef.current = null;

      // Reinitialize
      await initializeMediaDevices();

      toast({
        title: "Success",
        description: "Microphone access granted. You can now start recording.",
        variant: "default",
      });
    } catch (error) {
      console.error("Retry failed:", error);
      toast({
        title: "Retry Failed",
        description:
          "Could not access microphone. Please check your device settings and try again.",
        variant: "destructive",
      });
    }
  };

  const generateRandomSample = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await pronunciationService.getSample(
        difficulty,
        customText
      );
      if (response.meta.code === SUCCESS_CODE && response.data) {
        setCurrentSample(response.data);
        setCustomText("");
      } else {
        toast({
          title: "Error",
          description: "Failed to generate sample. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sample. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useCustomText = async () => {
    if (!customText.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter some text to practice.",
        variant: "destructive",
      });
      return;
    }

    const wordCount = customText.trim().split(/\s+/).length;
    if (wordCount > 20) {
      toast({
        title: "Text Too Long",
        description: "Please limit your text to 20 words or less.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await pronunciationService.getSample(
        difficulty,
        customText.trim()
      );
      if (response.meta.code === SUCCESS_CODE && response.data) {
        setCurrentSample(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to process custom text. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process custom text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    // Ensure we have both a valid sample and media recorder
    if (!currentSample) {
      toast({
        title: "Error",
        description: "Please select or generate a sample text first.",
        variant: "destructive",
      });
      return;
    }

    if (!mediaRecorderRef.current) {
      toast({
        title: "Error",
        description:
          "Recording device not initialized. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    // Update the ref with the latest sample
    currentSampleRef.current = currentSample;

    setRecordingState("recording");
    audioChunksRef.current = [];

    try {
      mediaRecorderRef.current.start(100); // Request data every 100ms
    } catch (error) {
      console.error("Recording start error:", error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
      setRecordingState("idle");
    }
  };

  const stopRecording = () => {
    // Double check conditions before stopping
    if (!mediaRecorderRef.current) {
      toast({
        title: "Error",
        description:
          "Recording device not initialized. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (!currentSampleRef.current) {
      toast({
        title: "Error",
        description:
          "No sample text available. Please select or generate a sample first.",
        variant: "destructive",
      });
      return;
    }

    setRecordingState("processing");
    try {
      mediaRecorderRef.current.stop();
    } catch (error) {
      console.error("Recording stop error:", error);
      toast({
        title: "Recording Error",
        description: "Failed to stop recording. Please try again.",
        variant: "destructive",
      });
      setRecordingState("idle");
    }
  };

  const processPronunciation = async (audioBlob: Blob) => {
    // Double check sample availability
    const sample = currentSampleRef.current;
    if (!sample) {
      throw new Error("No sample text available for comparison");
    }

    try {
      const base64Audio = await blobToBase64(audioBlob);
      const response = await pronunciationService.analyzePronunciation({
        text: sample.realTranscript,
        base64Audio,
      });

      if (response.meta.code === SUCCESS_CODE && response.data) {
        setResult(response.data);
        setScore((prev) => prev + response?.data?.pronunciationAccuracy || 0);
        setTotalAttempts((prev) => prev + 1);

        // Play feedback sound based on accuracy
        playFeedbackSound(response.data.pronunciationAccuracy);
      } else {
        toast({
          title: "Error",
          description: "Failed to analyze pronunciation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Pronunciation analysis error:", error);
      throw error; // Let the caller handle the error
    } finally {
      setRecordingState("completed");
    }
  };

  const playFeedbackSound = (accuracy: number) => {
    // Create audio context for feedback sounds
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different tones based on accuracy
    if (accuracy >= 80) {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High tone for good
    } else if (accuracy >= 60) {
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime); // Medium tone for okay
    } else {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Low tone for needs improvement
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const playReferenceAudio = () => {
    if (!currentSample || isPlayingReference) return;

    setIsPlayingReference(true);
    const utterance = new SpeechSynthesisUtterance(
      currentSample.realTranscript
    );
    utterance.rate = 0.8;
    utterance.onend = () => setIsPlayingReference(false);
    speechSynthesis.speak(utterance);
  };

  const playRecordedAudio = () => {
    if (!recordedAudioRef.current || isPlayingRecorded) return;

    setIsPlayingRecorded(true);
    recordedAudioRef.current.onended = () => setIsPlayingRecorded(false);
    recordedAudioRef.current.play();
  };

  const resetTest = () => {
    setRecordingState("idle");
    setResult(null);
    setCurrentSample(null);
    setCustomText("");
    if (recordedAudioRef.current) {
      recordedAudioRef.current = null;
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Keep the full data URL format including the prefix
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-500";
    if (accuracy >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (accuracy: number) => {
    if (accuracy >= 80) return "success";
    if (accuracy >= 60) return "warning";
    return "destructive";
  };

  const renderColoredText = () => {
    if (!result || !currentSample) return currentSample?.realTranscript;

    const words = currentSample.realTranscript.split(" ");
    const letterCorrectness = result.isLetterCorrectAllWords.split(" ");

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
  };

  const averageScore =
    totalAttempts > 0 ? Math.round(score / totalAttempts) : 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl min-h-screen text-gray-100">
      <div className="space-y-4">
        {/* Main Content - Flex Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Panel - Controls */}
          <Card className="w-full lg:w-80 flex-shrink-0 bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-3 border-b border-gray-700/50">
              <CardTitle className="text-lg text-gray-100">
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                  Pronunciation Test
                </h1>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Auto Generate */}
              <div className="text-center space-y-2">
                <p className="text-gray-400">
                  Practice your pronunciation with AI-powered feedback
                </p>

                {/* Stats Cards */}
                <div className="flex justify-center gap-8 mt-3">
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2 flex flex-col items-center border border-gray-700/50">
                    <span className="text-2xl font-bold text-blue-400">
                      {averageScore}%
                    </span>
                    <span className="text-xs text-gray-400">Average Score</span>
                  </div>
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2 flex flex-col items-center border border-gray-700/50">
                    <span className="text-2xl font-bold text-purple-400">
                      {totalAttempts}
                    </span>
                    <span className="text-xs text-gray-400">
                      Total Attempts
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  Auto Generate
                </Label>
                <Select
                  value={difficulty}
                  onValueChange={(value: DifficultyLevel) =>
                    setDifficulty(value)
                  }
                >
                  <SelectTrigger className="h-9 bg-gray-900/70 border-gray-700 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                    <SelectItem value="RANDOM">Random</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={generateRandomSample}
                  disabled={isLoading}
                  className="w-full h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shuffle className="h-4 w-4 mr-2" />
                  )}
                  Generate Random
                </Button>
              </div>

              <Separator className="bg-gray-700/50" />

              {/* Custom Text */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  Custom Text (max 20 words)
                </Label>
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your own sentence..."
                  className="min-h-[60px] text-sm bg-gray-900/70 border-gray-700 text-gray-200 placeholder:text-gray-500"
                  rows={5}
                />
                <Button
                  onClick={useCustomText}
                  disabled={!customText.trim() || isLoading}
                  variant="outline"
                  className="w-full h-9 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  size="sm"
                >
                  Use Custom Text
                </Button>
              </div>

              {/* Reset Button */}
              {currentSample && (
                <>
                  <Separator className="bg-gray-700/50" />
                  <Button
                    onClick={resetTest}
                    variant="outline"
                    size="sm"
                    className="w-full h-9 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start New Test
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Practice Area */}
          {currentSample ? (
            <Card className="flex-1 bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-3 border-b border-gray-700/50">
                <CardTitle className="text-lg text-gray-100">
                  Practice Text
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Text Display */}
                <div className="text-center space-y-3">
                  <div className="text-xl font-medium leading-relaxed p-4 bg-gray-900/70 rounded-lg border border-gray-700/50 shadow-inner">
                    {renderColoredText()}
                  </div>

                  {/* IPA and Translation in same line */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm">
                    <div className="text-blue-300 font-mono">
                      / {currentSample.ipaTranscript} /
                    </div>
                    {currentSample.transcriptTranslation && (
                      <>
                        <span className="hidden sm:inline text-gray-500">
                          •
                        </span>
                        <div className="text-gray-400 italic">
                          {currentSample.transcriptTranslation}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Audio Controls - Compact */}
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={playReferenceAudio}
                    disabled={isPlayingReference}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    {isPlayingReference ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4 mr-1" />
                    )}
                    Reference
                  </Button>

                  {recordedAudioRef.current && (
                    <Button
                      onClick={playRecordedAudio}
                      disabled={isPlayingRecorded}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    >
                      {isPlayingRecorded ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      Recording
                    </Button>
                  )}
                </div>

                {/* Recording Control - Compact */}
                <div className="text-center">
                  {recordingState === "idle" && (
                    <Button
                      onClick={startRecording}
                      size="default"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-2"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Start Recording
                    </Button>
                  )}

                  {recordingState === "recording" && (
                    <Button
                      onClick={stopRecording}
                      size="default"
                      variant="destructive"
                      className="px-6 py-2 animate-pulse bg-red-600 hover:bg-red-700"
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Stop Recording
                    </Button>
                  )}

                  {recordingState === "processing" && (
                    <Button
                      size="default"
                      disabled
                      className="px-6 py-2 bg-gray-700 text-gray-300"
                    >
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </Button>
                  )}

                  {recordingState === "completed" && (
                    <Button
                      onClick={() => startRecording()}
                      size="default"
                      variant="outline"
                      className="px-6 py-2 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Record Again
                    </Button>
                  )}
                </div>

                {/* Results - Compact */}
                {result && (
                  <div className="space-y-3 p-4 bg-gray-900/70 rounded-lg border border-gray-700/50 shadow-inner">
                    <div className="text-center">
                      <Badge
                        variant={getScoreBadgeVariant(
                          result.pronunciationAccuracy
                        )}
                        className="text-base px-4 py-1 bg-opacity-20 backdrop-blur-sm"
                      >
                        {result.pronunciationAccuracy}% Accuracy
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs mt-3">
                      <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/30">
                        <Label className="font-medium text-xs text-gray-400">
                          Reference IPA:
                        </Label>
                        <div className="font-mono text-blue-300 mt-1">
                          / {result.realTranscriptsIpa} /
                        </div>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/30">
                        <Label className="font-medium text-xs text-gray-400">
                          Your IPA:
                        </Label>
                        <div className="font-mono text-purple-300 mt-1">
                          / {result.matchedTranscriptsIpa} /
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-sm mt-2">
                      {result.pronunciationAccuracy >= 80 ? (
                        <div className="flex items-center justify-center text-green-500 bg-green-900/20 py-2 px-3 rounded-md">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Excellent pronunciation!
                        </div>
                      ) : result.pronunciationAccuracy >= 60 ? (
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
              </CardContent>
            </Card>
          ) : (
            <div className="flex-1 flex items-center justify-center h-64 bg-gray-800/30 border border-gray-700/50 rounded-lg backdrop-blur-sm">
              <p className="text-gray-400 text-center">
                Select a difficulty level and generate a sample to start
                practicing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
