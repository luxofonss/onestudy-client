"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Eye, Loader2, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface TestHeaderProps {
  testName: string;
  testDescription: string;
  questionsCount: number;
  isSaving: boolean;
  onPreview: () => void;
  onSave: () => void;
  onPublish: () => void;
}

export default function TestHeader({
  testName,
  testDescription,
  questionsCount,
  isSaving,
  onPreview,
  onSave,
  onPublish,
}: TestHeaderProps) {
  const router = useRouter();
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePreview = async () => {
    if (questionsCount === 0) return;

    try {
      setIsPreviewLoading(true);
      await onPreview();
    } catch (error) {
      console.error("Preview error:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!testName.trim() || isSaving) return;

    try {
      await onSave();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handlePublish = async () => {
    if (questionsCount === 0 || !testName.trim() || isSaving || isPublishing)
      return;

    try {
      setIsPublishing(true);
      await onPublish();
    } catch (error) {
      console.error("Publish error:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <div className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10 mb-2">
          <Edit className="h-3.5 w-3.5 mr-2 text-teal-400" />
          <span className="text-gray-200">Quiz Editor</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {testName || "Untitled Quiz"}
        </h1>
        <p className="text-gray-300 mt-1">
          {testDescription || "No description provided"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/create")}
          className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handlePreview}
          disabled={questionsCount === 0 || isPreviewLoading}
          className="bg-gray-800/70 hover:bg-gray-800 text-white border border-gray-700"
        >
          {isPreviewLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          )}
        </Button>

        <Button
          onClick={handleSave}
          disabled={!testName.trim() || isSaving}
          className="gradient-button"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>

        <Button
          onClick={handlePublish}
          disabled={
            questionsCount === 0 || !testName.trim() || isSaving || isPublishing
          }
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Publish
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
