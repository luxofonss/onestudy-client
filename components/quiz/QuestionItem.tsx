"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Edit, ImageIcon, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AudioPreview } from "@/components/ui/audio-preview";
import { Card, CardContent } from "@/components/ui/card";

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type:
    | "multiple-choice"
    | "pronunciation"
    | "fill-in-the-blank"
    | "essay"
    | "listening";
  text: string;
  options?: Option[];
  pronunciationText?: string;
  correctBlanks?: string[];
  trueFalseAnswer?: boolean;
  audioUrl?: string;
  imageUrl?: string;
  maxListeningTime?: number;
  explanation?: string;
  points: number;
  timeLimit?: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionItemProps {
  question: Question;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  getQuestionTypeIcon: (type: string) => string;
  getDifficultyColor: (difficulty: string) => string;
}

export default function QuestionItem({
  question,
  index,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMove,
  getQuestionTypeIcon,
  getDifficultyColor,
}: QuestionItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const renderQuestionPreview = () => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="mt-2 space-y-1">
            {question.options?.map((option, i) => (
              <div
                key={i}
                className={`flex items-center p-1.5 rounded-md ${
                  option.isCorrect
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-gray-700/30"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center text-xs ${
                    option.isCorrect ? "bg-green-500 text-white" : "bg-gray-600"
                  }`}
                >
                  {option.isCorrect && "✓"}
                </div>
                <span
                  className={
                    option.isCorrect ? "text-green-300" : "text-gray-300"
                  }
                >
                  {option.text}
                </span>
              </div>
            ))}
          </div>
        );
      case "fill-in-the-blank":
        return (
          <div className="mt-2">
            <div className="bg-gray-700/30 p-1.5 rounded-md">
              <span className="text-gray-300">
                Correct answer{question.correctBlanks?.length !== 1 ? "s" : ""}:{" "}
              </span>
              <span className="text-teal-300">
                {question.correctBlanks?.join(", ")}
              </span>
            </div>
          </div>
        );
      case "pronunciation":
        return (
          <div className="mt-2">
            <div className="bg-gray-700/30 p-1.5 rounded-md">
              <span className="text-gray-300">Pronunciation text: </span>
              <span className="text-teal-300">
                {question.pronunciationText}
              </span>
            </div>
          </div>
        );
      case "listening":
        return (
          <div className="mt-2 flex items-center">
            <div className="bg-gray-700/30 p-1.5 rounded-md flex items-center">
              <div className="h-6 w-6 bg-teal-500/20 rounded-full flex items-center justify-center mr-2">
                <div className="i-lucide-headphones h-3 w-3 text-teal-400" />
              </div>
              <span className="text-gray-300">Audio content</span>
            </div>
            {question.maxListeningTime && (
              <Badge
                variant="outline"
                className="ml-2 bg-gray-700/50 text-gray-300 border-gray-600"
              >
                {question.maxListeningTime}s max listening time
              </Badge>
            )}
          </div>
        );
      case "essay":
        return (
          <div className="mt-2">
            <div className="bg-gray-700/30 p-1.5 rounded-md">
              <span className="text-gray-300">Free-form essay response</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-colors">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-gray-700/70 text-gray-300 text-xs px-2 py-0.5 rounded">
                  #{index + 1}
                </span>
                <Badge
                  variant="outline"
                  className={`${getDifficultyColor(question.difficulty)}`}
                >
                  {question.difficulty}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gray-700/50 text-gray-300 border-gray-600"
                >
                  {question.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-teal-500/10 text-teal-300 border-teal-500/30"
                >
                  {question.points} {question.points === 1 ? "point" : "points"}
                </Badge>
                <div className="flex items-center bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded">
                  {getQuestionTypeIcon(question.type)}
                  <span className="ml-1">
                    {question.type.replace("-", " ")}
                  </span>
                </div>
              </div>

              <p className="text-white font-medium mb-1">{question.text}</p>

              {renderQuestionPreview()}

              {(question.imageUrl || question.audioUrl) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {question.imageUrl && (
                    <Badge
                      variant="outline"
                      className="bg-purple-500/10 text-purple-300 border-purple-500/30"
                    >
                      <div className="i-lucide-image h-3 w-3 mr-1" /> Has image
                    </Badge>
                  )}
                  {question.audioUrl && (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-300 border-blue-500/30"
                    >
                      <div className="i-lucide-volume-2 h-3 w-3 mr-1" /> Has
                      audio
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex md:flex-col items-center gap-2 self-end md:self-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMove(index, "up")}
                disabled={isFirst}
                className="h-8 w-8 rounded-full bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMove(index, "down")}
                disabled={isLast}
                className="h-8 w-8 rounded-full bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 self-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(question)}
                className="h-9 px-2.5 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="h-9 px-2.5 bg-red-900/20 text-red-300 hover:bg-red-900/30 hover:text-red-200"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Question
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this question? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(question.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
