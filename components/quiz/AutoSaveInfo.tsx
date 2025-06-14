"use client";

import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

interface AutoSaveInfoProps {
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  onToggleAutoSave: (enabled: boolean) => void;
}

export default function AutoSaveInfo({
  lastSaved,
  autoSaveEnabled,
  onToggleAutoSave,
}: AutoSaveInfoProps) {
  if (!lastSaved) return null;

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-md px-4 py-2 mb-6 flex items-center justify-between">
      <div className="flex items-center text-sm text-gray-300">
        <Clock className="h-4 w-4 mr-2 text-gray-400" />
        Last saved: {new Date(lastSaved).toLocaleTimeString()}
      </div>
      <div className="flex items-center">
        <Switch
          checked={autoSaveEnabled}
          onCheckedChange={onToggleAutoSave}
          className="mr-2"
        />
        <span className="text-sm text-gray-300">Auto-save</span>
      </div>
    </div>
  );
}
