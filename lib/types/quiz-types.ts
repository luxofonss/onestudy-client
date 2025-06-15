export interface Question {
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
     acceptRate?: number; // Pronunciation acceptance rate (0-100)
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

export interface TestData {
     id: string;
     name: string;
     description: string;
     questions: Question[];
     createdAt: string;
     updatedAt: string;
     totalPoints: number;
     estimatedDuration: number;
     tags: string[];
     isPublic: boolean;
     authorId?: string;
     version: number;
     status: "draft" | "published";
     difficulty?: "beginner" | "intermediate" | "advanced";
     // Enhanced quiz settings
     navigationMode: "sequential" | "back-only" | "free-navigation";
     hasTimer: boolean;
     timeLimit: number; // in minutes
     warningTime: number; // minutes before end to show warning
     allowQuestionPicker: boolean;
     shuffleQuestions: boolean;
     shuffleAnswers: boolean;
     showProgress: boolean;
     allowPause: boolean;
     maxAttempts: number;
     passingScore: number;
}

export interface SavedTestMetadata {
     testId: string;
     questionCount: number;
     totalPoints: number;
     categories: string[];
     difficulties: string[];
     questionTypes: string[];
     hasMultimedia: boolean;
     estimatedDuration: number;
     lastSaved: string;
}
