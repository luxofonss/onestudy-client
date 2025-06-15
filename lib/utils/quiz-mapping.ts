import { Question, TestData } from "../types/quiz-types";
import { quizService } from "../services/quiz-service";

export const convertQuestionType = (apiType: string): Question["type"] => {
     switch (apiType.toUpperCase()) {
          case "MULTIPLE_CHOICE":
               return "multiple-choice";
          case "PRONUNCIATION":
               return "pronunciation";
          case "FILL_IN_THE_BLANK":
               return "fill-in-the-blank";
          case "ESSAY":
               return "essay";
          case "LISTENING":
               return "listening";
          default:
               return "multiple-choice";
     }
};

export const convertDifficulty = (apiDifficulty: string): Question["difficulty"] => {
     switch (apiDifficulty.toUpperCase()) {
          case "BEGINNER":
               return "beginner";
          case "INTERMEDIATE":
               return "intermediate";
          case "ADVANCED":
               return "advanced";
          default:
               return "beginner";
     }
};

export const convertNavigationMode = (apiMode: string): TestData["navigationMode"] => {
     switch (apiMode.toUpperCase()) {
          case "SEQUENTIAL":
               return "sequential";
          case "BACK_ONLY":
               return "back-only";
          case "FREE_NAVIGATION":
               return "free-navigation";
          default:
               return "free-navigation";
     }
};

export const mapApiQuestions = (apiQuestions: any[]): Question[] => {
     return apiQuestions.map((q) => {
          const questionType = convertQuestionType(q.type);

          // Base question object
          const question: Question = {
               id: q.id || null,
               type: questionType,
               text: q.text || "",
               points: q.points || 1,
               difficulty: convertDifficulty(q.difficulty || "BEGINNER"),
               category: q.category || "General",
               createdAt: q.createdAt || new Date().toISOString(),
               updatedAt: q.updatedAt || new Date().toISOString(),
          };

          // Add type-specific properties
          if (questionType === "multiple-choice" && q.options) {
               question.options = q.options.map((opt: any) => ({
                    id: opt.id || undefined,
                    text: opt.text || "",
                    isCorrect: opt.isCorrect || false,
               }));
          } else if (questionType === "fill-in-the-blank") {
               question.correctAnswers = q.correctAnswers || [];
          } else if (questionType === "pronunciation") {
               question.pronunciationText = q.pronunciationText || "";
               question.acceptRate = q.acceptRate || 70;
          }

          // Add media if present
          if (q.audioUrl) question.audioUrl = q.audioUrl;
          if (q.imageUrl) question.imageUrl = q.imageUrl;
          if (q.explanation) question.explanation = q.explanation;
          if (q.timeLimit) question.timeLimit = q.timeLimit;
          if (q.maxListeningTime) question.maxListeningTime = q.maxListeningTime;

          return question;
     });
};

export const convertToApiQuestionType = (componentType: string): string => {
     switch (componentType) {
          case "multiple-choice":
               return "MULTIPLE_CHOICE";
          case "pronunciation":
               return "PRONUNCIATION";
          case "fill-in-the-blank":
               return "FILL_IN_THE_BLANK";
          case "essay":
               return "ESSAY";
          case "listening":
               return "LISTENING";
          default:
               return "MULTIPLE_CHOICE";
     }
};

export const convertToApiDifficulty = (componentDifficulty: string): string => {
     switch (componentDifficulty) {
          case "beginner":
               return "BEGINNER";
          case "intermediate":
               return "INTERMEDIATE";
          case "advanced":
               return "ADVANCED";
          default:
               return "BEGINNER";
     }
};

export const convertToApiNavigationMode = (componentMode: string): string => {
     switch (componentMode) {
          case "sequential":
               return "SEQUENTIAL";
          case "back-only":
               return "BACK_ONLY";
          case "free-navigation":
               return "FREE_NAVIGATION";
          default:
               return "FREE_NAVIGATION";
     }
};

export const mapToApiQuestions = (componentQuestions: Question[]): any[] => {
     return componentQuestions.map((q) => {
          // Generate a unique ID if the question doesn't have one
          // If ID starts with NEW_, set it to null for API
          const questionId = q.id && q.id.startsWith("NEW_") ? null : q.id;

          const apiQuestion: any = {
               id: questionId,
               text: q.text,
               type: convertToApiQuestionType(q.type),
               points: q.points,
               difficulty: convertToApiDifficulty(q.difficulty),
               category: q.category,
          };

          // Add type-specific properties
          if (q.type === "multiple-choice" && q.options) {
               apiQuestion.options = q.options.map((opt) => ({
                    id: opt.id || null,
                    text: opt.text,
                    isCorrect: opt.isCorrect,
               }));
          } else if (q.type === "fill-in-the-blank") {
               apiQuestion.correctAnswers = q.correctAnswers;
          } else if (q.type === "pronunciation") {
               apiQuestion.pronunciationText = q.pronunciationText;
               apiQuestion.acceptRate = q.acceptRate || 70;
          }

          // Add media if present
          if (q.audioUrl) apiQuestion.audioUrl = q.audioUrl;
          if (q.imageUrl) apiQuestion.imageUrl = q.imageUrl;
          if (q.explanation) apiQuestion.explanation = q.explanation;
          if (q.timeLimit) apiQuestion.timeLimit = q.timeLimit;
          if (q.maxListeningTime) apiQuestion.maxListeningTime = q.maxListeningTime;

          return apiQuestion;
     });
};

export const updateQuiz = async (quizData: TestData): Promise<any> => {
     try {
          const apiQuizData = {
               id: quizData.id,
               title: quizData.name,
               description: quizData.description,
               questions: mapToApiQuestions(quizData.questions),
               status: quizData.status.toUpperCase(),
               tags: quizData.tags,
               duration: quizData.estimatedDuration,
               difficulty: quizData.difficulty ? convertToApiDifficulty(quizData.difficulty) : undefined,
               // Enhanced quiz settings
               navigationMode: convertToApiNavigationMode(quizData.navigationMode),
               hasTimer: quizData.hasTimer,
               timeLimit: quizData.timeLimit,
               warningTime: quizData.warningTime,
               allowQuestionPicker: quizData.allowQuestionPicker,
               shuffleQuestions: quizData.shuffleQuestions,
               shuffleAnswers: quizData.shuffleAnswers,
               showProgress: quizData.showProgress,
               allowPause: quizData.allowPause,
               maxAttempts: quizData.maxAttempts,
               passingScore: quizData.passingScore,
               isPublic: quizData.isPublic
          };

          console.log("Updating quiz with data:", apiQuizData);

          const response = await quizService.updateQuiz(apiQuizData);

          // Check for failure response from the service
          if (
               response &&
               (response.success === false ||
                    (response.meta && response.meta.code !== 200000))
          ) {
               const errorMessage =
                    response.error ||
                    response.meta?.message ||
                    "An unknown error occurred while updating the quiz.";
               throw new Error(errorMessage);
          }

          return response;
     } catch (error) {
          console.error("Error updating quiz:", error);
          throw error;
     }
};