"use client";

import type React from "react";

import Link from "next/link";
import { Star, Users, Clock, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface LessonCardProps {
  id: string | number;
  title: string;
  description: string;
  creator: string;
  participants: number;
  rating: number;
  timeLimit: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  type: string;
  icon: LucideIcon;
  href?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  showSaveButton?: boolean;
  isPublic?: boolean;
}

export function LessonCard({
  id,
  title,
  description,
  creator,
  participants,
  rating,
  timeLimit,
  level,
  type,
  icon: IconComponent,
  href = `/content/${id}`,
  buttonText = "Start Quiz",
  onButtonClick,
  className = "",
  isSaved = false,
  onSave,
  showSaveButton = false,
}: LessonCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-950/50 text-green-400 border-green-700/30";
      case "Intermediate":
        return "bg-amber-950/50 text-amber-400 border-amber-700/30";
      case "Advanced":
        return "bg-red-950/50 text-red-400 border-red-700/30";
      case "All Levels":
        return "bg-blue-950/50 text-blue-400 border-blue-700/30";
      default:
        return "bg-gray-950/50 text-gray-400 border-gray-700/30";
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave && typeof id === "string") {
      onSave(id);
    }
  };

  return (
    <Card
      className={`bg-gray-900/90 border-gray-800 shadow-md hover:shadow-lg hover:border-gray-700/60 transition-all duration-300 group ${className}`}
    >
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-12 h-12 bg-gray-800 border border-gray-700/50 rounded-lg flex items-center justify-center group-hover:bg-gray-750 transition-colors shadow-inner">
              <IconComponent className="h-6 w-6 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl mb-1.5 text-white font-semibold group-hover:text-teal-400 transition-colors truncate pr-2">
                  {title}
                </CardTitle>

                {showSaveButton && onSave && typeof id === "string" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="shrink-0 h-8 w-8 p-0 hover:bg-gray-800 hover:text-teal-400 ml-2 rounded-md"
                    aria-label={isSaved ? "Remove from saved" : "Save lesson"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-6 w-6 text-teal-400" />
                    ) : (
                      <Bookmark className="h-6 w-6 text-gray-400" />
                    )}
                  </Button>
                )}
              </div>
              <CardDescription className="text-gray-300 mb-2 line-clamp-2 text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Badge
              variant="outline"
              className="border-teal-700/40 text-teal-400 bg-teal-900/20"
            >
              {type}
            </Badge>
            <Badge variant="outline" className={`${getLevelColor(level)}`}>
              {level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3 pb-2 border-b border-gray-800">
          <div className="flex items-center">
            <span className="font-medium text-gray-200 mr-1">Created by:</span>
            <span className="text-gray-300 truncate">{creator}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-blue-400 mr-1.5" />
            <span className="text-gray-300 font-medium">
              {participants?.toLocaleString()}
            </span>
            <span className="text-gray-400 ml-1 text-xs">participants</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {timeLimit && (
            <div className="bg-gray-800/60 rounded-md p-2.5 flex items-center justify-between border border-gray-700/30">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-teal-400 mr-2" />
                <span className="font-medium text-gray-200 text-sm">
                  Time Limit
                </span>
              </div>
              <div className="text-gray-300 font-semibold">{timeLimit}</div>
            </div>
          )}

          <div className={`${timeLimit ? "" : "col-span-2"} flex justify-end`}>
            {onButtonClick ? (
              <Button
                onClick={handleButtonClick}
                className="bg-teal-700 hover:bg-teal-600 text-white w-full"
              >
                {buttonText}
              </Button>
            ) : (
              <Link href={href} className="w-full">
                <Button className="bg-teal-700 hover:bg-teal-600 text-white w-full">
                  {buttonText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
