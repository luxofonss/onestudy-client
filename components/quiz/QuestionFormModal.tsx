"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Loader2,
  PlusCircle,
  Trash2,
  Upload,
  X,
  Info,
} from "lucide-react";

interface Question {
  id?: string | null;
  type:
    | "multiple-choice"
    | "pronunciation"
    | "fill-in-the-blank"
    | "essay"
    | "listening";
  text: string;
  options?: { id?: string; text: string; isCorrect: boolean }[];
  pronunciationText?: string;
  correctAnswers?: string[];
  trueFalseAnswer?: boolean;
  audioUrl?: string;
  imageUrl?: string;
  maxListeningTime?: number;
  explanation?: string;
  points: number;
  timeLimit?: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion: Partial<Question>;
  setCurrentQuestion: (question: Partial<Question>) => void;
  editingQuestion: Question | null;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  uploadedFiles: { [key: string]: File };
  setUploadedFiles: (files: { [key: string]: File }) => void;
  isUploadingImage: boolean;
  isUploadingAudio: boolean;
  onSave: () => void;
}

export default function QuestionFormModal({
  isOpen,
  onClose,
  currentQuestion,
  setCurrentQuestion,
  editingQuestion,
  errors,
  setErrors,
  uploadedFiles,
  setUploadedFiles,
  isUploadingImage,
  isUploadingAudio,
  onSave,
}: QuestionFormModalProps) {
  const updateOption = (index: number, text: string) => {
    if (!currentQuestion.options) return;

    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = { ...updatedOptions[index], text };

    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const setCorrectAnswer = (index: number) => {
    if (!currentQuestion.options) return;

    const updatedOptions = currentQuestion.options.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));

    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const addOption = () => {
    if (!currentQuestion.options) return;

    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: "", isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    if (!currentQuestion.options || currentQuestion.options.length <= 2) return;

    const updatedOptions = currentQuestion.options.filter(
      (_, i) => i !== index
    );

    // If we removed the correct answer, set the first option as correct
    if (currentQuestion.options[index].isCorrect && updatedOptions.length > 0) {
      updatedOptions[0].isCorrect = true;
    }

    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const handleFileUpload = (type: "image" | "audio") => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = type === "image" ? "image/*" : "audio/*";
    fileInput.click();

    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        setUploadedFiles({ ...uploadedFiles, [type]: file });

        setCurrentQuestion({
          ...currentQuestion,
          [`${type}Url`]: URL.createObjectURL(file),
        });
      }
    };
  };

  const removeUploadedFile = (type: "image" | "audio") => {
    const updatedFiles = { ...uploadedFiles };
    delete updatedFiles[type];
    setUploadedFiles(updatedFiles);

    setCurrentQuestion({
      ...currentQuestion,
      [`${type}Url`]: undefined,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-900/30 text-green-300 border-green-700/50";
      case "intermediate":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-700/50";
      case "advanced":
        return "bg-red-900/30 text-red-300 border-red-700/50";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "bg-blue-900/30 text-blue-300 border-blue-700/50";
      case "fill-in-the-blank":
        return "bg-green-900/30 text-green-300 border-green-700/50";
      case "pronunciation":
        return "bg-purple-900/30 text-purple-300 border-purple-700/50";
      case "listening":
        return "bg-orange-900/30 text-orange-300 border-orange-700/50";
      case "essay":
        return "bg-teal-900/30 text-teal-300 border-teal-700/50";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-white">
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge
                className={getTypeColor(
                  currentQuestion.type || "multiple-choice"
                )}
              >
                {currentQuestion.type?.replace("-", " ") || "Multiple Choice"}
              </Badge>
              {currentQuestion.difficulty && (
                <Badge
                  className={getDifficultyColor(currentQuestion.difficulty)}
                >
                  {currentQuestion.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Left column - Main question info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Info Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="questionType" className="text-xs text-gray-400">
                  Type
                </Label>
                <Select
                  value={currentQuestion.type}
                  onValueChange={(value) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      type: value as Question["type"],
                      ...(value === "multiple-choice" &&
                        !currentQuestion.options && {
                          options: [
                            { text: "", isCorrect: true },
                            { text: "", isCorrect: false },
                          ],
                        }),
                    })
                  }
                >
                  <SelectTrigger
                    id="questionType"
                    className="h-8 text-sm bg-gray-800 border-gray-700"
                  >
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="multiple-choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="fill-in-the-blank">
                      Fill in Blank
                    </SelectItem>
                    <SelectItem value="pronunciation">Pronunciation</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="listening">Listening</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-red-400 text-xs mt-1">{errors.type}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="questionPoints"
                  className="text-xs text-gray-400"
                >
                  Points
                </Label>
                <Select
                  value={currentQuestion.points?.toString()}
                  onValueChange={(value) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      points: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger
                    id="questionPoints"
                    className="h-8 text-sm bg-gray-800 border-gray-700"
                  >
                    <SelectValue placeholder="Points" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {[1, 2, 3, 5, 10].map((point) => (
                      <SelectItem key={point} value={point.toString()}>
                        {point} point{point !== 1 && "s"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.points && (
                  <p className="text-red-400 text-xs mt-1">{errors.points}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="questionDifficulty"
                  className="text-xs text-gray-400"
                >
                  Difficulty
                </Label>
                <Select
                  value={currentQuestion.difficulty}
                  onValueChange={(value) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      difficulty: value as Question["difficulty"],
                    })
                  }
                >
                  <SelectTrigger
                    id="questionDifficulty"
                    className="h-8 text-sm bg-gray-800 border-gray-700"
                  >
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                {errors.difficulty && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.difficulty}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="questionCategory"
                  className="text-xs text-gray-400"
                >
                  Category
                </Label>
                <Input
                  id="questionCategory"
                  value={currentQuestion.category || ""}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      category: e.target.value,
                    })
                  }
                  placeholder="Category"
                  className="h-8 text-sm bg-gray-800 border-gray-700"
                />
                {errors.category && (
                  <p className="text-red-400 text-xs mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div>
              <Label htmlFor="questionText" className="text-xs text-gray-400">
                Question Text
              </Label>
              <Textarea
                id="questionText"
                value={currentQuestion.text || ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    text: e.target.value,
                  })
                }
                placeholder="Enter the question text"
                className="bg-gray-800 border-gray-700 min-h-[80px] text-sm"
              />
              {errors.text && (
                <p className="text-red-400 text-xs mt-1">{errors.text}</p>
              )}
            </div>

            {/* Type-specific content */}
            <div
              className={`p-3 rounded-md ${getTypeColor(
                currentQuestion.type || "multiple-choice"
              )
                .replace("text-", "bg-")
                .replace("300", "900/30")}`}
            >
              {/* Multiple Choice Options */}
              {currentQuestion.type === "multiple-choice" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">
                      Answer Options
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addOption}
                      className="h-7 px-2 text-xs border-blue-700/50 text-blue-300 hover:bg-blue-900/30"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add Option
                    </Button>
                  </div>

                  {currentQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-gray-800/60 p-2 rounded-md"
                    >
                      <RadioGroup
                        value={option.isCorrect ? "correct" : ""}
                        onValueChange={(value) => {
                          if (value === "correct") {
                            setCorrectAnswer(index);
                          }
                        }}
                        className="flex items-center"
                      >
                        <RadioGroupItem
                          value="correct"
                          id={`option-${index}`}
                          className="text-blue-500 border-gray-600"
                        />
                      </RadioGroup>

                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 h-8 text-sm bg-gray-800 border-gray-700"
                      />

                      {currentQuestion.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {errors.options && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.options}
                    </p>
                  )}
                </div>
              )}

              {/* Fill in the Blank */}
              {currentQuestion.type === "fill-in-the-blank" && (
                <div>
                  <Label
                    htmlFor="correctAnswers"
                    className="text-xs font-medium"
                  >
                    Correct Answer(s)
                  </Label>
                  <Textarea
                    id="correctAnswers"
                    value={currentQuestion.correctAnswers?.join(", ") || ""}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        correctAnswers: e.target.value
                          .split(",")
                          .map((answer) => answer.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Enter correct answers separated by commas"
                    className="mt-1 bg-gray-800 border-gray-700 min-h-[60px] text-sm"
                  />
                  {errors.correctAnswers && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.correctAnswers}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Separate multiple acceptable answers with commas
                  </p>
                </div>
              )}

              {/* Pronunciation */}
              {currentQuestion.type === "pronunciation" && (
                <div>
                  <Label
                    htmlFor="pronunciationText"
                    className="text-xs font-medium"
                  >
                    Text to Pronounce
                  </Label>
                  <Input
                    id="pronunciationText"
                    value={currentQuestion.pronunciationText || ""}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        pronunciationText: e.target.value,
                      })
                    }
                    placeholder="Text that the student needs to pronounce"
                    className="mt-1 bg-gray-800 border-gray-700 text-sm"
                  />
                  {errors.pronunciationText && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.pronunciationText}
                    </p>
                  )}
                </div>
              )}

              {/* Listening */}
              {currentQuestion.type === "listening" && (
                <div>
                  <Label
                    htmlFor="maxListeningTime"
                    className="text-xs font-medium"
                  >
                    Maximum Listening Time (seconds)
                  </Label>
                  <Input
                    id="maxListeningTime"
                    type="number"
                    min="1"
                    max="300"
                    value={currentQuestion.maxListeningTime || ""}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        maxListeningTime: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="e.g., 30"
                    className="mt-1 bg-gray-800 border-gray-700 text-sm"
                  />
                  {errors.maxListeningTime && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.maxListeningTime}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Explanation */}
            <div>
              <Label
                htmlFor="explanation"
                className="text-xs text-gray-400 flex items-center"
              >
                <Info className="h-3 w-3 mr-1" />
                Explanation (Optional)
              </Label>
              <Textarea
                id="explanation"
                value={currentQuestion.explanation || ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    explanation: e.target.value,
                  })
                }
                placeholder="Provide an explanation for the correct answer"
                className="bg-gray-800 border-gray-700 min-h-[60px] text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                This will be shown to students after they answer the question
              </p>
            </div>
          </div>

          {/* Right column - Media & Settings */}
          <div className="space-y-4">
            {/* Media Uploads */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Media Files
              </h3>

              {/* Image Upload */}
              <div className="mb-4">
                <Label className="text-xs text-gray-400">Question Image</Label>
                <div className="mt-1 border border-dashed border-gray-600 rounded-md overflow-hidden">
                  {currentQuestion.imageUrl ? (
                    <div className="relative">
                      <img
                        src={currentQuestion.imageUrl}
                        alt="Question"
                        className="w-full h-24 object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadedFile("image")}
                        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full bg-gray-900/60 text-red-400 hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleFileUpload("image")}
                      className="w-full h-16 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50"
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mb-1" />
                          <span className="text-xs">Upload Image</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Audio Upload */}
              <div>
                <Label className="text-xs text-gray-400">Question Audio</Label>
                <div className="mt-1 border border-dashed border-gray-600 rounded-md overflow-hidden">
                  {currentQuestion.audioUrl ? (
                    <div className="p-2 bg-gray-800">
                      <div className="flex items-center justify-between">
                        <audio
                          controls
                          src={currentQuestion.audioUrl}
                          className="h-8 w-full"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile("audio")}
                          className="ml-2 h-6 w-6 p-0 rounded-full bg-gray-700 text-red-400 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleFileUpload("audio")}
                      className="w-full h-16 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50"
                      disabled={isUploadingAudio}
                    >
                      {isUploadingAudio ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mb-1" />
                          <span className="text-xs">Upload Audio</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Additional Settings
              </h3>

              <div>
                <Label htmlFor="timeLimit" className="text-xs text-gray-400">
                  Time Limit (seconds)
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  max="300"
                  value={currentQuestion.timeLimit || ""}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      timeLimit: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="No limit"
                  className="mt-1 h-8 text-sm bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Set a time limit for this specific question
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4 bg-gray-700" />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {editingQuestion ? "Update Question" : "Add Question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
