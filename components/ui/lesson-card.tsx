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
  duration: string;
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
  duration,
  level,
  type,
  icon: IconComponent,
  href = `/content/${id}`,
  buttonText = "Start Lesson",
  onButtonClick,
  className = "",
  isSaved = false,
  onSave,
  showSaveButton = false,
}: LessonCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      case "All Levels":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      className={`hover:shadow-lg transition-all duration-200 border-blue-100 hover:border-blue-300 group ${className}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <IconComponent className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                  {title}
                </CardTitle>
                {showSaveButton && onSave && typeof id === "string" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="shrink-0 h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-600 ml-2"
                    aria-label={isSaved ? "Remove from saved" : "Save lesson"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <CardDescription className="text-gray-600 mb-3">
                {description}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={getLevelColor(level)}>
            {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mb-3">
          <span className="font-medium text-gray-700">Created by:</span>{" "}
          {creator}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {participants?.toLocaleString()}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              {rating}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {duration}
            </div>
          </div>
          <Badge variant="outline" className="border-blue-300 text-blue-600">
            {type}
          </Badge>
        </div>
        {onButtonClick ? (
          <Button
            onClick={handleButtonClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 transition-all duration-200"
          >
            {buttonText}
          </Button>
        ) : (
          <Link href={href}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 transition-all duration-200">
              {buttonText}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
