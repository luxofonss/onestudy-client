"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Star,
  BookOpen,
  Volume2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  id: string;
  type:
    | "multiple-choice"
    | "pronunciation"
    | "fill-in-the-blank"
    | "essay"
    | "listening";
  text: string;
  options?: { text: string; isCorrect: boolean }[];
  pronunciationText?: string;
  fillInBlanks?: {
    text: string;
    blanks: { position: number; answer: string }[];
  };
  trueFalseAnswer?: boolean;
  audioUrl?: string;
  imageUrl?: string;
  maxListeningTime?: number;
  points: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];
  createdAt: string;
  usageCount: number;
  rating: number;
}

export default function QuestionLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      type: "multiple-choice",
      text: "What is the past tense of 'go'?",
      options: [
        { text: "went", isCorrect: true },
        { text: "goed", isCorrect: false },
        { text: "gone", isCorrect: false },
        { text: "going", isCorrect: false },
      ],
      points: 1,
      difficulty: "beginner",
      category: "Grammar",
      tags: ["past-tense", "irregular-verbs"],
      createdAt: "2024-01-15",
      usageCount: 45,
      rating: 4.8,
    },
    {
      id: "2",
      type: "fill-in-the-blank",
      text: "Complete the sentence: I _____ to the store yesterday.",
      fillInBlanks: {
        text: "I _____ to the store yesterday.",
        blanks: [{ position: 2, answer: "went" }],
      },
      points: 2,
      difficulty: "intermediate",
      category: "Grammar",
      tags: ["past-tense", "sentence-completion"],
      createdAt: "2024-01-14",
      usageCount: 32,
      rating: 4.6,
    },
    {
      id: "3",
      type: "pronunciation",
      text: "Pronounce the following word correctly:",
      pronunciationText: "Worcestershire",
      points: 3,
      difficulty: "advanced",
      category: "Pronunciation",
      tags: ["difficult-words", "british-english"],
      createdAt: "2024-01-13",
      usageCount: 28,
      rating: 4.9,
    },
    {
      id: "5",
      type: "listening",
      text: "Listen to the audio and choose the correct answer:",
      options: [
        { text: "The cat is sleeping", isCorrect: true },
        { text: "The cat is eating", isCorrect: false },
        { text: "The cat is playing", isCorrect: false },
        { text: "The cat is running", isCorrect: false },
      ],
      audioUrl: "/audio/cat-sleeping.mp3",
      maxListeningTime: 30,
      points: 2,
      difficulty: "intermediate",
      category: "Listening",
      tags: ["comprehension", "animals"],
      createdAt: "2024-01-11",
      usageCount: 41,
      rating: 4.5,
    },
  ]);

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: "multiple-choice",
    text: "",
    points: 1,
    difficulty: "beginner",
    category: "General",
    tags: [],
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "MC";
      case "pronunciation":
        return "🎤";
      case "fill-in-the-blank":
        return "___";
      case "listening":
        return "🎧";
      default:
        return "?";
    }
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      question.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || question.category === filterCategory;
    const matchesDifficulty =
      filterDifficulty === "all" || question.difficulty === filterDifficulty;
    const matchesType = filterType === "all" || question.type === filterType;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const categories = [
    "Grammar",
    "Vocabulary",
    "Pronunciation",
    "Listening",
    "Reading",
    "Writing",
  ];
  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "pronunciation", label: "Pronunciation" },
    { value: "fill-in-the-blank", label: "Fill in the Blank" },
    { value: "essay", label: "Essay" },
    { value: "listening", label: "Listening" },
  ];

  const duplicateQuestion = (question: Question) => {
    const newQuestion = {
      ...question,
      id: Date.now().toString(),
      text: `${question.text} (Copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Question Library
        </h1>
        <p className="text-gray-600">
          Manage and organize your question collection
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search questions, tags, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value: Question["type"]) =>
                        setNewQuestion({ ...newQuestion, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newQuestion.category}
                      onValueChange={(value) =>
                        setNewQuestion({ ...newQuestion, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={newQuestion.difficulty}
                      onValueChange={(value: Question["difficulty"]) =>
                        setNewQuestion({ ...newQuestion, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Points</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newQuestion.points}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          points: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter your question here..."
                    value={newQuestion.text}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, text: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const question: Question = {
                        ...(newQuestion as Question),
                        id: Date.now().toString(),
                        tags: [],
                        createdAt: new Date().toISOString().split("T")[0],
                        usageCount: 0,
                        rating: 0,
                      };
                      setQuestions((prev) => [question, ...prev]);
                      setIsCreateModalOpen(false);
                      setNewQuestion({
                        type: "multiple-choice",
                        text: "",
                        points: 1,
                        difficulty: "beginner",
                        category: "General",
                        tags: [],
                      });
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Create Question
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Question Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {questionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-teal-100">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-teal-600">
              {questions.length}
            </p>
            <p className="text-xs text-gray-600">Total Questions</p>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-4 text-center">
            <div className="w-6 h-6 bg-green-100 rounded text-xs flex items-center justify-center mx-auto mb-2 text-green-600 font-bold">
              B
            </div>
            <p className="text-lg font-bold text-green-600">
              {questions.filter((q) => q.difficulty === "beginner").length}
            </p>
            <p className="text-xs text-gray-600">Beginner</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-100">
          <CardContent className="p-4 text-center">
            <div className="w-6 h-6 bg-yellow-100 rounded text-xs flex items-center justify-center mx-auto mb-2 text-yellow-600 font-bold">
              I
            </div>
            <p className="text-lg font-bold text-yellow-600">
              {questions.filter((q) => q.difficulty === "intermediate").length}
            </p>
            <p className="text-xs text-gray-600">Intermediate</p>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardContent className="p-4 text-center">
            <div className="w-6 h-6 bg-red-100 rounded text-xs flex items-center justify-center mx-auto mb-2 text-red-600 font-bold">
              A
            </div>
            <p className="text-lg font-bold text-red-600">
              {questions.filter((q) => q.difficulty === "advanced").length}
            </p>
            <p className="text-xs text-gray-600">Advanced</p>
          </CardContent>
        </Card>
      </div>

      {/* Questions Grid */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ||
                filterCategory !== "all" ||
                filterDifficulty !== "all" ||
                filterType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start by creating your first question"}
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card
              key={question.id}
              className="border-teal-100 hover:border-teal-300 transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-teal-100 rounded text-sm flex items-center justify-center text-teal-600 font-medium">
                        {getQuestionTypeIcon(question.type)}
                      </div>
                      <Badge
                        className={getDifficultyColor(question.difficulty)}
                      >
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline">{question.category}</Badge>
                      <Badge variant="outline">{question.points} pts</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {question.rating.toFixed(1)}
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                      {question.text}
                    </h3>

                    {question.imageUrl && (
                      <div className="mb-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <ImageIcon className="h-4 w-4 mr-1" />
                          Image attached
                        </div>
                      </div>
                    )}

                    {question.audioUrl && (
                      <div className="mb-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Volume2 className="h-4 w-4 mr-1" />
                          Audio attached
                        </div>
                      </div>
                    )}

                    {question.type === "multiple-choice" &&
                      question.options && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Options:</p>
                          <div className="text-sm text-gray-500">
                            {question.options.map((opt, idx) => (
                              <span
                                key={idx}
                                className={
                                  opt.isCorrect
                                    ? "font-medium text-green-600"
                                    : ""
                                }
                              >
                                {opt.text}
                                {idx < question.options!.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {question.type === "pronunciation" && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          Pronounce:
                          <span className="font-medium text-blue-600 ml-1">
                            "{question.pronunciationText}"
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Used {question.usageCount} times</span>
                      <span>Created {question.createdAt}</span>
                    </div>

                    {question.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {question.tags.map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateQuestion(question)}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteQuestion(question.id)}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredQuestions.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>
        </div>
      )}
    </div>
  );
}
