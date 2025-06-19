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
  Pause,
} from "lucide-react";
import {
  pronunciationService,
  type PronunciationSample,
  type PronunciationResult,
} from "@/lib/services/pronunciation-service";
import { SUCCESS_CODE } from "@/lib/constants";
import { event } from "@/lib/utils/analytics";

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
  const [isPlayingSlowReference, setIsPlayingSlowReference] = useState(false);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [isPausedReference, setIsPausedReference] = useState(false);
  const [isPausedSlowReference, setIsPausedSlowReference] = useState(false);

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

  // Initialize speech synthesis voices
  useEffect(() => {
    // Force load voices for speech synthesis
    const forceLoadVoices = () => {
      // This creates a silent utterance that forces Chrome to load voices
      const silentUtterance = new SpeechSynthesisUtterance('');
      silentUtterance.volume = 0;
      silentUtterance.rate = 1;
      speechSynthesis.speak(silentUtterance);
      
      // Cancel it immediately
      setTimeout(() => {
        speechSynthesis.cancel();
      }, 50);
    };
    
    // Load voices for speech synthesis
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      console.log("Available voices:", voices.length);
      if (voices.length > 0) {
        const englishVoices = voices.filter(voice => voice.lang.includes('en'));
        console.log("Available English voices:", englishVoices.map(v => v.name));
      } else {
        // If no voices are available, try to force load them
        forceLoadVoices();
      }
    };

    // Initial load attempt
    loadVoices();

    // Set up event listener for when voices are loaded
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      // Cleanup
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.onvoiceschanged = null;
        // Cancel any ongoing speech
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize media devices
  useEffect(() => {
    initializeMediaDevices();
    generateRandomSample();
    
    // Track page view with more details
    event({
      action: 'pronunciation_page_view',
      category: 'Pronunciation',
      label: 'Pronunciation Test Page',
    });
    
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

      // Track successful microphone access
      event({
        action: 'microphone_access_granted',
        category: 'Pronunciation',
        label: 'Microphone Initialization',
      });

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

      // Track microphone access error
      event({
        action: 'microphone_access_error',
        category: 'Pronunciation',
        label: error instanceof Error ? error.message : 'Unknown error',
      });

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

    // Track sample generation attempt
    event({
      action: 'pronunciation_generate_sample',
      category: 'Pronunciation',
      label: difficulty,
    });

    try {
      const response = await pronunciationService.getSample(
        difficulty,
        customText
      );
      if (response.meta.code === SUCCESS_CODE && response.data) {
        setCurrentSample(response.data);
        setCustomText("");
        
        // Track successful sample generation
        event({
          action: 'pronunciation_sample_success',
          category: 'Pronunciation',
          label: difficulty,
          value: response.data.realTranscript.length,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate sample. Please try again.",
          variant: "destructive",
        });
        
        // Track sample generation error
        event({
          action: 'pronunciation_sample_error',
          category: 'Pronunciation',
          label: difficulty,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sample. Please try again.",
        variant: "destructive",
      });
      
      // Track sample generation network error
      event({
        action: 'pronunciation_sample_network_error',
        category: 'Pronunciation',
        label: difficulty,
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

    // Track custom text usage
    event({
      action: 'pronunciation_custom_text',
      category: 'Pronunciation',
      label: customText.substring(0, 30),
      value: customText.trim().split(/\s+/).length,
    });

    const wordCount = customText.trim().split(/\s+/).length;
    if (wordCount > 20) {
      toast({
        title: "Text Too Long",
        description: "Please limit your text to 20 words or less.",
        variant: "destructive",
      });
      
      // Track custom text error - too long
      event({
        action: 'pronunciation_custom_text_too_long',
        category: 'Pronunciation',
        label: 'Text too long',
        value: wordCount,
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
        
        // Track custom text success
        event({
          action: 'pronunciation_custom_text_success',
          category: 'Pronunciation',
          label: customText.substring(0, 30),
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to process custom text. Please try again.",
          variant: "destructive",
        });
        
        // Track custom text error
        event({
          action: 'pronunciation_custom_text_error',
          category: 'Pronunciation',
          label: 'API Error',
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process custom text. Please try again.",
        variant: "destructive",
      });
      
      // Track custom text network error
      event({
        action: 'pronunciation_custom_text_network_error',
        category: 'Pronunciation',
        label: 'Network Error',
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

    // Track recording start
    event({
      action: 'pronunciation_recording_start',
      category: 'Pronunciation',
      label: currentSample.realTranscript.substring(0, 30),
    });

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
      
      // Track recording start error
      event({
        action: 'pronunciation_recording_start_error',
        category: 'Pronunciation',
        label: error instanceof Error ? error.message : 'Unknown error',
      });
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

    // Track recording stop
    event({
      action: 'pronunciation_recording_stop',
      category: 'Pronunciation',
      label: currentSampleRef.current.realTranscript.substring(0, 30),
    });

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
      
      // Track recording stop error
      event({
        action: 'pronunciation_recording_stop_error',
        category: 'Pronunciation',
        label: error instanceof Error ? error.message : 'Unknown error',
      });
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
      
      // Track pronunciation analysis attempt
      event({
        action: 'pronunciation_analysis_attempt',
        category: 'Pronunciation',
        label: sample.realTranscript.substring(0, 30),
      });
      
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
        
        // Track pronunciation analysis success
        event({
          action: 'pronunciation_analysis_success',
          category: 'Pronunciation',
          label: sample.realTranscript.substring(0, 30),
          value: Math.round(response.data.pronunciationAccuracy),
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to analyze pronunciation. Please try again.",
          variant: "destructive",
        });
        
        // Track pronunciation analysis error
        event({
          action: 'pronunciation_analysis_error',
          category: 'Pronunciation',
          label: 'API Error',
        });
      }
    } catch (error) {
      console.error("Pronunciation analysis error:", error);
      
      // Track pronunciation analysis network error
      event({
        action: 'pronunciation_analysis_network_error',
        category: 'Pronunciation',
        label: error instanceof Error ? error.message : 'Unknown error',
      });
      
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
    // If already playing, pause it
    if (isPlayingReference && !isPausedReference) {
      // Track pause event
      event({
        action: 'pronunciation_pause_reference',
        category: 'Pronunciation',
        label: currentSample?.realTranscript?.substring(0, 30) || '',
      });
      
      speechSynthesis.pause();
      setIsPausedReference(true);
      return;
    }
    
    // If paused, resume it
    if (isPlayingReference && isPausedReference) {
      // Track resume event
      event({
        action: 'pronunciation_resume_reference',
        category: 'Pronunciation',
        label: currentSample?.realTranscript?.substring(0, 30) || '',
      });
      
      speechSynthesis.resume();
      setIsPausedReference(false);
      return;
    }
    
    // Otherwise start new playback
    if (!currentSample) return;

    // Track reference audio play
    event({
      action: 'pronunciation_play_reference',
      category: 'Pronunciation',
      label: currentSample.realTranscript.substring(0, 30),
    });

    setIsPlayingReference(true);
    setIsPausedReference(false);
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(currentSample.realTranscript);
    
    // Slightly slower rate for clearer pronunciation
    utterance.rate = 0.8;
    
    // Force English language for consistent pronunciation
    utterance.lang = 'en-US';
    
    // Get best available voice
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log("Using voice for reference:", bestVoice.name);
    }
    
    // Set up onend handler
    utterance.onend = () => {
      setIsPlayingReference(false);
      setIsPausedReference(false);
    };
    
    // Speak the utterance
    speechSynthesis.speak(utterance);
    
    // Fallback in case onend doesn't fire
    setTimeout(() => {
      if (isPlayingReference) {
        setIsPlayingReference(false);
        setIsPausedReference(false);
      }
    }, currentSample.realTranscript.length * 200); // Rough estimate based on text length
  };

  const playSlowReferenceAudio = () => {
    // If already playing, pause it
    if (isPlayingSlowReference && !isPausedSlowReference) {
      // Track pause event
      event({
        action: 'pronunciation_pause_slow_reference',
        category: 'Pronunciation',
        label: currentSample?.realTranscript?.substring(0, 30) || '',
      });
      
      speechSynthesis.pause();
      setIsPausedSlowReference(true);
      return;
    }
    
    // If paused, resume it
    if (isPlayingSlowReference && isPausedSlowReference) {
      // Track resume event
      event({
        action: 'pronunciation_resume_slow_reference',
        category: 'Pronunciation',
        label: currentSample?.realTranscript?.substring(0, 30) || '',
      });
      
      speechSynthesis.resume();
      setIsPausedSlowReference(false);
      return;
    }
    
    // Otherwise start new playback
    if (!currentSample) return;

    // Track slow reference audio play
    event({
      action: 'pronunciation_play_slow_reference',
      category: 'Pronunciation',
      label: currentSample.realTranscript.substring(0, 30),
    });

    setIsPlayingSlowReference(true);
    setIsPausedSlowReference(false);
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(currentSample.realTranscript);
    
    // Much slower rate for clearer pronunciation
    utterance.rate = 0.5;
    
    // Force English language for consistent pronunciation
    utterance.lang = 'en-US';
    
    // Get best available voice
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log("Using voice for slow reference:", bestVoice.name);
    }
    
    // Set up onend handler
    utterance.onend = () => {
      setIsPlayingSlowReference(false);
      setIsPausedSlowReference(false);
    };
    
    // Speak the utterance
    speechSynthesis.speak(utterance);
    
    // Fallback in case onend doesn't fire
    setTimeout(() => {
      if (isPlayingSlowReference) {
        setIsPlayingSlowReference(false);
        setIsPausedSlowReference(false);
      }
    }, currentSample.realTranscript.length * 400); // Longer timeout for slow speech
  };

  const playRecordedAudio = () => {
    if (!recordedAudioRef.current || isPlayingRecorded) return;

    // Track recorded audio play
    event({
      action: 'pronunciation_play_recording',
      category: 'Pronunciation',
      label: currentSample?.realTranscript?.substring(0, 30) || 'Unknown text',
    });

    setIsPlayingRecorded(true);
    recordedAudioRef.current.onended = () => setIsPlayingRecorded(false);
    recordedAudioRef.current.play();
  };

  // Stop any ongoing speech synthesis
  const stopSpeech = () => {
    if (speechSynthesis.speaking || speechSynthesis.pending || speechSynthesis.paused) {
      // Track stop event
      event({
        action: 'pronunciation_stop_speech',
        category: 'Pronunciation',
        label: currentSample?.realTranscript?.substring(0, 30) || '',
      });
      
      speechSynthesis.cancel();
      setIsPlayingReference(false);
      setIsPausedReference(false);
      setIsPlayingSlowReference(false);
      setIsPausedSlowReference(false);
    }
  };

  const resetTest = () => {
    // Stop any ongoing speech
    stopSpeech();
    
    // Track test reset
    event({
      action: 'pronunciation_reset_test',
      category: 'Pronunciation',
      label: currentSample?.realTranscript?.substring(0, 30) || 'Unknown text',
    });
    
    setRecordingState("idle");
    setResult(null);
    setCurrentSample(null);
    setCustomText("");
    if (recordedAudioRef.current) {
      recordedAudioRef.current = null;
    }
  };

  // Helper function to get the best available voice
  const getBestVoice = () => {
    const voices = speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      return null;
    }
    
    // Priority order for voice selection
    const preferredVoices = [
      // First priority: English Google voices (usually high quality)
      voices.find(v => v.name.includes('Google') && v.lang.includes('en-US') && v.name.includes('Female')),
      voices.find(v => v.name.includes('Google') && v.lang.includes('en-US')),
      
      // Second priority: Any English US female voice
      voices.find(v => v.lang === 'en-US' && v.name.includes('Female')),
      
      // Third priority: Any English US voice
      voices.find(v => v.lang === 'en-US'),
      
      // Fourth priority: Any English voice
      voices.find(v => v.lang.includes('en') && v.name.includes('Female')),
      voices.find(v => v.lang.includes('en')),
      
      // Last resort: First available voice
      voices[0]
    ];
    
    // Return the first non-null voice from our priority list
    return preferredVoices.find(voice => voice !== undefined) || null;
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

    return (
      <div className="flex flex-wrap justify-center">
        {words.map((word, wordIndex) => {
          const wordCorrectness = letterCorrectness[wordIndex] || "";
          return (
            <span key={wordIndex} className="mr-1 mb-1 inline-block">
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
        })}
      </div>
    );
  };

  const averageScore =
    totalAttempts > 0 ? Math.round(score / totalAttempts) : 0;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl min-h-screen text-gray-100">
      {/* Mobile Header - Only visible on small screens */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            Pronunciation Test
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-800/60 border-gray-700/50 text-blue-400 px-2">
              {averageScore}% Avg
            </Badge>
            <Badge variant="outline" className="bg-gray-800/60 border-gray-700/50 text-purple-400 px-2">
              {totalAttempts} Tests
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
          {/* Left Panel - Controls */}
          <Card className="w-full lg:w-1/4 flex-shrink-0 bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-3 border-b border-gray-700/50">
              <CardTitle className="text-lg text-gray-100">
                {/* Hide this title on mobile since we have the header above */}
                <h1 className="hidden lg:block text-xl font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                  Pronunciation Test
                </h1>
                {/* Mobile title shows controls label instead */}
                <h2 className="lg:hidden text-base font-medium text-gray-300">Test Controls</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Auto Generate */}
              <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm sm:text-base hidden lg:block">
                  Practice your pronunciation with AI-powered feedback
                </p>

                {/* Stats Cards - More compact on mobile, hidden on mobile (moved to header) */}
                <div className="hidden lg:flex justify-center gap-4 sm:gap-8 mt-3">
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 flex flex-col items-center border border-gray-700/50">
                    <span className="text-xl sm:text-2xl font-bold text-blue-400">
                      {averageScore}%
                    </span>
                    <span className="text-xs text-gray-400">Average Score</span>
                  </div>
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 flex flex-col items-center border border-gray-700/50">
                    <span className="text-xl sm:text-2xl font-bold text-purple-400">
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={difficulty}
                    onValueChange={(value: DifficultyLevel) =>
                      setDifficulty(value)
                    }
                  >
                    <SelectTrigger className="h-10 sm:h-9 bg-gray-900/70 border-gray-700 text-gray-200">
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
                    className="w-full h-10 sm:h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
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
                  rows={3}
                />
                <Button
                  onClick={useCustomText}
                  disabled={!customText.trim() || isLoading}
                  variant="outline"
                  className="w-full h-10 sm:h-9 border-gray-600 text-gray-300 hover:bg-gray-700/50"
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
                    className="w-full h-10 sm:h-9 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start New Test
                  </Button>
                </>
              )}
              
              {/* Mobile-only controls that appear when a sample is selected */}
              {currentSample && (
                <div className="lg:hidden mt-2">
                  <Separator className="bg-gray-700/50 my-4" />
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={playReferenceAudio}
                      disabled={(isPlayingSlowReference && !isPausedSlowReference)}
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 px-2 bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:text-white transition-colors"
                    >
                      {isPlayingReference && !isPausedReference ? (
                        <Pause className="h-4 w-4 mr-1" />
                      ) : isPlayingReference && isPausedReference ? (
                        <Play className="h-4 w-4 mr-1" />
                      ) : (
                        <Volume2 className="h-4 w-4 mr-1" />
                      )}
                      {isPlayingReference && isPausedReference ? "Resume" : 
                       isPlayingReference && !isPausedReference ? "Pause" : "Play"}
                    </Button>

                    <Button
                      onClick={playSlowReferenceAudio}
                      disabled={(isPlayingReference && !isPausedReference)}
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 px-2 bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:text-white transition-colors"
                    >
                      {isPlayingSlowReference && !isPausedSlowReference ? (
                        <Pause className="h-4 w-4 mr-1" />
                      ) : isPlayingSlowReference && isPausedSlowReference ? (
                        <Play className="h-4 w-4 mr-1" />
                      ) : (
                        <Volume2 className="h-4 w-4 mr-1" />
                      )}
                      {isPlayingSlowReference && isPausedSlowReference ? "Resume" : 
                       isPlayingSlowReference && !isPausedSlowReference ? "Pause" : "Slow"}
                    </Button>
                    
                    {(isPlayingReference || isPlayingSlowReference) && (
                      <Button
                        onClick={stopSpeech}
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 bg-gray-800/80 border-gray-700 text-red-400 hover:bg-red-900/30 hover:border-red-700 transition-colors"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}

                    {recordedAudioRef.current && (
                      <Button
                        onClick={playRecordedAudio}
                        disabled={isPlayingRecorded}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 px-2 bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:text-white transition-colors"
                      >
                        {isPlayingRecorded ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-1" />
                        )}
                        Rec
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Practice Area */}
          {currentSample ? (
            <Card className="w-full lg:w-3/4 flex-shrink-0 bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-3 border-b border-gray-700/50">
                <CardTitle className="text-lg text-gray-100 flex justify-between items-center">
                  <span>Practice Text</span>
                  {/* Recording indicator for better visibility */}
                  {recordingState === "recording" && (
                    <span className="text-xs bg-red-600/80 text-white px-2 py-1 rounded-full animate-pulse flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-1"></span> Recording
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Text Display */}
                <div className="text-center space-y-3">
                  <div className="text-base sm:text-xl font-medium leading-relaxed p-3 sm:p-4 bg-gray-900/70 rounded-lg border border-gray-700/50 shadow-inner break-words whitespace-pre-wrap overflow-hidden w-full">
                    {renderColoredText()}
                  </div>

                {/* IPA and Translation - stacked on mobile, side by side on larger screens */}
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

              {/* Audio Controls - Hidden on mobile (moved to left panel) */}
              <div className="hidden lg:flex justify-center gap-3">
                <Button
                  onClick={playReferenceAudio}
                  disabled={(isPlayingSlowReference && !isPausedSlowReference)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 px-3 bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:text-white transition-colors"
                >
                  {isPlayingReference && !isPausedReference ? (
                    <Pause className="h-4 w-4 mr-1" />
                  ) : isPlayingReference && isPausedReference ? (
                    <Play className="h-4 w-4 mr-1" />
                  ) : (
                    <Volume2 className="h-4 w-4 mr-1" />
                  )}
                  {isPlayingReference && isPausedReference ? "Resume" : 
                   isPlayingReference && !isPausedReference ? "Pause" : "Play"}
                </Button>

                <Button
                  onClick={playSlowReferenceAudio}
                  disabled={(isPlayingReference && !isPausedReference)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 px-3 bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:text-white transition-colors"
                >
                  {isPlayingSlowReference && !isPausedSlowReference ? (
                    <Pause className="h-4 w-4 mr-1" />
                  ) : isPlayingSlowReference && isPausedSlowReference ? (
                    <Play className="h-4 w-4 mr-1" />
                  ) : (
                    <Volume2 className="h-4 w-4 mr-1" />
                  )}
                  {isPlayingSlowReference && isPausedSlowReference ? "Resume" : 
                   isPlayingSlowReference && !isPausedSlowReference ? "Pause" : "Slow"}
                </Button>

                {(isPlayingReference || isPlayingSlowReference) && (
                  <Button
                    onClick={stopSpeech}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 bg-gray-800/80 border-gray-700 text-red-400 hover:bg-red-900/30 hover:border-red-700 transition-colors"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                )}

                {recordedAudioRef.current && (
                  <Button
                    onClick={playRecordedAudio}
                    disabled={isPlayingRecorded}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 px-3 bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:text-white transition-colors"
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

              {/* Recording Control - Fixed position on mobile for better UX */}
              <div className="text-center">
                {recordingState === "idle" && (
                  <Button
                    onClick={startRecording}
                    size="default"
                    className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 text-white px-4 sm:px-6 py-2 w-full sm:w-auto shadow-md"
                  >
                    <Mic className="h-5 w-5 mr-2 text-red-400" />
                    Start Recording
                  </Button>
                )}

                {recordingState === "recording" && (
                  <Button
                    onClick={stopRecording}
                    size="default"
                    variant="destructive"
                    className="px-4 sm:px-6 py-2 animate-pulse bg-red-900/80 hover:bg-red-800 border border-red-700 w-full sm:w-auto shadow-md"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                )}

                {recordingState === "processing" && (
                  <Button
                    size="default"
                    disabled
                    className="px-4 sm:px-6 py-2 bg-gray-800 text-gray-300 border border-gray-700 w-full sm:w-auto shadow-md"
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
                    className="px-4 sm:px-6 py-2 bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:text-white w-full sm:w-auto shadow-md transition-colors"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Record Again
                  </Button>
                )}
              </div>

              {/* Results - Responsive layout */}
              {result && (
                <div className="space-y-3 p-3 sm:p-4 bg-gray-900/70 rounded-lg border border-gray-700/50 shadow-inner">
                  <div className="text-center">
                    <Badge
                      variant={getScoreBadgeVariant(
                        result.pronunciationAccuracy
                      )}
                      className="text-sm sm:text-base px-3 sm:px-4 py-1 bg-opacity-20 backdrop-blur-sm"
                    >
                      {result.pronunciationAccuracy}% Accuracy
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs mt-3">
                    <div className="bg-gray-800/50 p-2 sm:p-3 rounded-md border border-gray-700/30">
                      <Label className="font-medium text-xs text-gray-400">
                        Reference IPA:
                      </Label>
                      <div className="font-mono text-blue-300 mt-1 break-words">
                        / {result.realTranscriptsIpa} /
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-2 sm:p-3 rounded-md border border-gray-700/30">
                      <Label className="font-medium text-xs text-gray-400">
                        Your IPA:
                      </Label>
                      <div className="font-mono text-purple-300 mt-1 break-words">
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
          <div className="flex-1 flex items-center justify-center h-48 sm:h-64 bg-gray-800/30 border border-gray-700/50 rounded-lg backdrop-blur-sm">
            <p className="text-gray-400 text-center px-4">
              Select a difficulty level and generate a sample to start
              practicing
            </p>
          </div>
        )}
      </div>
    </div>
    
    {/* Mobile bottom action bar - provides quick access to controls */}
    {currentSample && (
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 z-10 px-3 py-2 flex items-center justify-between shadow-lg">
        {recordingState !== "recording" && (
          <Button
            onClick={resetTest}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-200 hover:bg-transparent"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        )}
        
        {/* Dynamic center button based on recording state */}
        {recordingState === "idle" && (
          <Button
            onClick={startRecording}
            size="lg"
            className="h-12 w-12 rounded-full bg-gray-800 border border-gray-700/80 hover:bg-gray-700 text-red-400 shadow-lg"
          >
            <Mic className="h-6 w-6" />
          </Button>
        )}

        {recordingState === "recording" && (
          <Button
            onClick={stopRecording}
            size="lg"
            variant="destructive"
            className="h-12 w-12 rounded-full animate-pulse bg-red-900/80 hover:bg-red-800 border border-red-700 shadow-lg"
          >
            <Square className="h-6 w-6" />
          </Button>
        )}

        {recordingState === "processing" && (
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-800 border border-gray-700 text-gray-300">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {recordingState === "completed" && (
          <Button
            onClick={() => startRecording()}
            size="lg"
            className="h-12 w-12 rounded-full bg-gray-800 border border-gray-700/80 hover:bg-gray-700 text-green-400 shadow-lg"
          >
            <CheckCircle className="h-6 w-6" />
          </Button>
        )}
        
        {recordingState !== "recording" && recordedAudioRef.current && (
          <Button
            onClick={playRecordedAudio}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-200 hover:bg-transparent"
            disabled={isPlayingRecorded}
          >
            {isPlayingRecorded ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
        )}
        
        {recordingState === "recording" && (
          <div className="text-xs text-red-400 font-medium animate-pulse flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            REC
          </div>
        )}
      </div>
    )}
  </div>
);
}