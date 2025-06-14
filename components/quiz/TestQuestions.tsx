"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Library } from "lucide-react";
import QuestionItem from "./QuestionItem";

interface Question {
  id: string | null;
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
  createdAt: string;
  updatedAt: string;
}

interface TestQuestionsProps {
  questions: Question[];
  onAddQuestion: () => void;
  onOpenLibrary: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onMoveQuestion: (index: number, direction: "up" | "down") => void;
  getDifficultyColor: (difficulty: string) => string;
  getQuestionTypeIcon: (type: string) => JSX.Element;
}

export default function TestQuestions({
  questions,
  onAddQuestion,
  onOpenLibrary,
  onEditQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  getDifficultyColor,
  getQuestionTypeIcon,
}: TestQuestionsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Questions</h2>
          <p className="text-gray-400 text-sm">
            {questions.length === 0
              ? "No questions added yet"
              : `${questions.length} question${
                  questions.length !== 1 ? "s" : ""
                } in this test`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onOpenLibrary}
            className="bg-gray-800/70 hover:bg-gray-800 text-white border border-gray-700"
          >
            <Library className="h-4 w-4 mr-2" />
            Question Library
          </Button>
          <Button onClick={onAddQuestion} className="gradient-button">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card className="bg-gray-800/50 border border-gray-700 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-700/50 p-4 rounded-full mb-4">
              <PlusCircle className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Questions Yet
            </h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">
              Start building your test by adding questions. You can create new
              ones or import from the question library.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={onOpenLibrary}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
              >
                <Library className="h-4 w-4 mr-2" />
                Browse Library
              </Button>
              <Button onClick={onAddQuestion} className="gradient-button">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Question
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionItem
              key={question.id || index}
              question={question}
              index={index}
              isFirst={index === 0}
              isLast={index === questions.length - 1}
              onEdit={() => onEditQuestion(question)}
              onDelete={() => question.id && onDeleteQuestion(question.id)}
              onMove={(direction) => onMoveQuestion(index, direction)}
              getDifficultyColor={getDifficultyColor}
              getQuestionTypeIcon={getQuestionTypeIcon}
            />
          ))}
        </div>
      )}

      {questions.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button onClick={onAddQuestion} className="gradient-button">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Another Question
          </Button>
        </div>
      )}

      {/* Tips Card */}
      <Card className="bg-gray-800/50 border border-teal-800/50 mt-8">
        <CardHeader>
          <CardTitle className="text-lg text-white">💡 Question Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-300 space-y-2">
          <p>• Mix different question types to test various skills</p>
          <p>• Use clear and concise language in your questions</p>
          <p>• Include explanations for difficult questions</p>
          <p>• Balance the difficulty level across the test</p>
          <p>• Add media elements to make questions more engaging</p>
        </CardContent>
      </Card>
    </div>
  );
}
