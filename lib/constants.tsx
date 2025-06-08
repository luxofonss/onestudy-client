import {
  BookOpen,
  MessageSquare,
  Mic,
  Headphones,
  PenTool,
  FileText,
} from "lucide-react";

export const FEATURED_LESSONS = [
  {
    id: 1,
    title: "English Grammar Fundamentals",
    description:
      "Master essential grammar rules with interactive exercises and real-world examples",
    creator: "Sarah Johnson",
    participants: 2834,
    rating: 4.9,
    duration: "45 min",
    level: "Beginner" as const,
    type: "Grammar",
    icon: BookOpen,
  },
  {
    id: 2,
    title: "Business English Vocabulary",
    description:
      "Learn professional vocabulary for workplace communication and presentations",
    creator: "Michael Chen",
    participants: 1567,
    rating: 4.7,
    duration: "30 min",
    level: "Intermediate" as const,
    type: "Vocabulary",
    icon: MessageSquare,
  },
  {
    id: 3,
    title: "Pronunciation Practice",
    description:
      "Improve your pronunciation with guided exercises and speech recognition",
    creator: "Emma Rodriguez",
    participants: 3421,
    rating: 4.8,
    duration: "25 min",
    level: "All Levels" as const,
    type: "Pronunciation",
    icon: Mic,
  },
  {
    id: 4,
    title: "Listening Comprehension",
    description:
      "Enhance your listening skills with authentic conversations and dialogues",
    creator: "David Thompson",
    participants: 2156,
    rating: 4.6,
    duration: "35 min",
    level: "Intermediate" as const,
    type: "Listening",
    icon: Headphones,
  },
];

export const COMMUNITY_STATS = [
  { label: "Active Learners", value: "50K+" },
  { label: "Lessons Completed", value: "1M+" },
  { label: "Success Rate", value: "95%" },
  { label: "Average Rating", value: "4.8★" },
];

export const NAVIGATION_ITEMS = [
  { href: "/", label: "Learn" },
  { href: "/create", label: "Create" },
  { href: "/library", label: "My Content" },
  { href: "/profile", label: "Profile" },
];

export const MOBILE_NAV_ITEMS = [
  { href: "/", icon: BookOpen, label: "Learn" },
  { href: "/create", icon: PenTool, label: "Create" },
  { href: "/library", icon: FileText, label: "Content" },
  { href: "/profile", icon: MessageSquare, label: "Profile" },
];

export const SUCCESS_CODE = 200000;
