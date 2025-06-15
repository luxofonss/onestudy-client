"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AudioPreviewProps {
  audioUrl: string;
  className?: string;
  compact?: boolean;
}

export function AudioPreview({
  audioUrl,
  className,
  compact = false,
}: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.volume = volume;
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const replay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 p-2 bg-gray-800/70 rounded border border-gray-700/50 ${className}`}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="h-8 w-8 p-0 text-blue-400 hover:bg-gray-700/50"
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
        <Volume2 className="h-3 w-3 text-blue-400" />
        <span className="text-xs text-gray-300 flex-1 truncate">
          Audio file
        </span>
        <span className="text-xs text-gray-400">{formatTime(duration)}</span>
        <audio ref={audioRef} src={audioUrl} className="hidden" />
      </div>
    );
  }

  return (
    <Card className={`p-3 bg-purple-50 border-purple-200 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlay}
            className="h-8 w-8 p-0 border-purple-300 text-purple-600 hover:bg-purple-100"
          >
            {isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={replay}
            className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-100"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="h-3 w-3 text-purple-600" />
              <span className="text-xs text-purple-700 font-medium">
                Audio Preview
              </span>
            </div>
          </div>
          <div className="text-xs text-purple-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSliderChange}
            className="w-full"
          />
        </div>

        <audio ref={audioRef} src={audioUrl} className="hidden" />
      </div>
    </Card>
  );
}
