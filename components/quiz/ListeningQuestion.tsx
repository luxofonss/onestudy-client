"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface QuestionOption {
  id: string;
  isCorrect: boolean;
  text: string;
}

interface ListeningQuestionProps {
  question: string;
  audioUrl: string | null;
  maxListeningTime?: number;
  options?: QuestionOption[];
  selectedOptionId: string;
  onOptionSelect: (optionText: string, optionId: string) => void;
  hasListened: boolean;
  onListeningStateChange: (hasListened: boolean) => void;
  formatTime: (seconds: number) => string;
}

export function ListeningQuestion({
  question,
  audioUrl,
  maxListeningTime,
  options,
  selectedOptionId,
  onOptionSelect,
  hasListened,
  onListeningStateChange,
  formatTime,
}: ListeningQuestionProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (listeningTimerRef.current) {
        clearInterval(listeningTimerRef.current);
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
      }
    };
  }, []);

  const startListening = async () => {
    if (!audioUrl) {
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "No audio file available for this question.",
      });
      return;
    }

    try {
      setIsListening(true);
      setListeningTime(0);
      onListeningStateChange(false);

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play();

        // Start timer for listening duration
        listeningTimerRef.current = setInterval(() => {
          setListeningTime((prev) => {
            const newTime = prev + 1;

            // Check if max listening time is reached
            if (maxListeningTime && newTime >= maxListeningTime) {
              if (listeningTimerRef.current) {
                clearInterval(listeningTimerRef.current);
              }
              setIsListening(false);
              onListeningStateChange(true);
              if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
              }
              toast({
                title: "Listening Time Complete",
                description:
                  "Maximum listening time reached. Please select your answer.",
              });
              return maxListeningTime;
            }

            return newTime;
          });
        }, 1000);

        // Handle audio end event
        audioPlayerRef.current.onended = () => {
          if (listeningTimerRef.current) {
            clearInterval(listeningTimerRef.current);
          }
          setIsListening(false);
          onListeningStateChange(true);
          toast({
            title: "Audio Complete",
            description: "Audio playback finished. Please select your answer.",
          });
        };

        // Handle audio error
        audioPlayerRef.current.onerror = () => {
          if (listeningTimerRef.current) {
            clearInterval(listeningTimerRef.current);
          }
          setIsListening(false);
          toast({
            variant: "destructive",
            title: "Audio Error",
            description: "Failed to play audio. Please try again.",
          });
        };
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "Failed to start audio playback.",
      });
    }
  };

  const stopListening = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (listeningTimerRef.current) {
      clearInterval(listeningTimerRef.current);
    }
    setIsListening(false);
    onListeningStateChange(true);
  };

  const replayAudio = () => {
    if (!audioUrl) return;

    // Reset listening state
    onListeningStateChange(false);
    setListeningTime(0);

    // Start listening again
    startListening();
  };

  const selectedAnswer =
    options?.find((opt) => opt.id === selectedOptionId)?.text || "";

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-purple-800">Listen to the audio:</h3>
          {maxListeningTime && (
            <div className="text-sm text-purple-600">
              Max time: {formatTime(maxListeningTime)}
            </div>
          )}
        </div>

        {isListening && (
          <div className="flex items-center text-purple-600 mb-4">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse mr-2"></div>
            <span className="font-mono">
              {formatTime(listeningTime)}
              {maxListeningTime && (
                <span className="text-purple-500">
                  {" "}
                  / {formatTime(maxListeningTime)}
                </span>
              )}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {!isListening ? (
            <Button
              onClick={startListening}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
              disabled={!audioUrl}
            >
              <Play className="h-5 w-5 mr-2" />
              {hasListened ? "Replay Audio" : "Start Listening"}
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3"
            >
              <Square className="h-5 w-5 mr-2" /> Stop
            </Button>
          )}

          {hasListened && !isListening && (
            <Button
              onClick={replayAudio}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 px-5 py-3"
            >
              <RotateCcw className="h-5 w-5 mr-2" /> Replay
            </Button>
          )}
        </div>

        {!audioUrl && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ No audio file available for this question.
          </div>
        )}

        {hasListened && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✓ Audio played. Please select your answer below.
          </div>
        )}
      </div>

      {/* Multiple Choice Options - Only show after listening or if already answered */}
      {(hasListened || selectedOptionId) && options && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-4">
            Select your answer:
          </h3>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={(value) => {
              const option = options.find((opt) => opt.text === value);
              if (option) onOptionSelect(value, option.id);
            }}
          >
            <div className="space-y-3">
              {options.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                            ${
                              selectedOptionId === option.id
                                ? "bg-purple-50 border-purple-500 ring-2 ring-purple-300"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                >
                  <RadioGroupItem value={option.text} id={option.id} />
                  <span>{option.text}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Instructions */}
      {!hasListened && !selectedOptionId && (
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          Please listen to the audio first, then select your answer from the
          options below.
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioPlayerRef} className="hidden" />
    </div>
  );
}
