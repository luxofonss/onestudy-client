"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Shuffle, Timer } from "lucide-react";

interface TestData {
  id: string;
  name: string;
  description: string;
  questions: any[];
  navigationMode: "sequential" | "back-only" | "free-navigation";
  hasTimer: boolean;
  timeLimit: number;
  warningTime: number;
  allowQuestionPicker: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showProgress: boolean;
  allowPause: boolean;
  maxAttempts: number;
  passingScore: number;
  tags: string[];
  [key: string]: any;
}

interface TestSettingsProps {
  testData: TestData;
  onTestInfoChange: (
    field: keyof TestData,
    value: string | boolean | number
  ) => void;
}

export default function TestSettings({
  testData,
  onTestInfoChange,
}: TestSettingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content - Settings */}
      <div className="lg:col-span-2 space-y-8">
        {/* Test Information Section */}
        <Card className="bg-gray-800/50 border border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-100">
              Test Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testName" className="text-gray-300">
                Test Name
              </Label>
              <Input
                id="testName"
                placeholder="Enter test name"
                value={testData.name}
                onChange={(e) => onTestInfoChange("name", e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <Label htmlFor="testDescription" className="text-gray-300">
                Test Description
              </Label>
              <Textarea
                id="testDescription"
                placeholder="Enter test description (optional)"
                value={testData.description}
                onChange={(e) =>
                  onTestInfoChange("description", e.target.value)
                }
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <Label htmlFor="testTags" className="text-gray-300">
                Tags (comma separated)
              </Label>
              <Input
                id="testTags"
                placeholder="e.g. grammar, beginner, vocabulary"
                value={testData.tags.join(", ")}
                onChange={(e) => {
                  const tagsArray = e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);
                  onTestInfoChange("tags", tagsArray);
                }}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-teal-500 focus:ring-teal-500"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {testData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gray-700/50 text-gray-300 border-gray-600"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Settings */}
        <Card className="bg-gray-800/50 border border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-100">
              Navigation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="navigationMode" className="text-gray-300">
                Navigation Mode
              </Label>
              <Select
                value={testData.navigationMode}
                onValueChange={(value) =>
                  onTestInfoChange(
                    "navigationMode",
                    value as TestData["navigationMode"]
                  )
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select navigation mode" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="free-navigation">
                    Free Navigation (move between any questions)
                  </SelectItem>
                  <SelectItem value="back-only">
                    Back Only (can't skip forward)
                  </SelectItem>
                  <SelectItem value="sequential">
                    Sequential (can't go back)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                Controls how students can navigate between questions
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Allow Question Picker</Label>
                <p className="text-xs text-gray-400">
                  Let students jump to specific questions
                </p>
              </div>
              <Switch
                checked={testData.allowQuestionPicker}
                onCheckedChange={(checked) =>
                  onTestInfoChange("allowQuestionPicker", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Show Progress</Label>
                <p className="text-xs text-gray-400">
                  Display progress indicator to students
                </p>
              </div>
              <Switch
                checked={testData.showProgress}
                onCheckedChange={(checked) =>
                  onTestInfoChange("showProgress", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Enable Timer</Label>
                <p className="text-xs text-gray-400">
                  Set a time limit for the entire test
                </p>
              </div>
              <Switch
                checked={testData.hasTimer}
                onCheckedChange={(checked) =>
                  onTestInfoChange("hasTimer", checked)
                }
              />
            </div>

            {testData.hasTimer && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-300">
                      Time Limit (minutes)
                    </Label>
                    <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded">
                      {testData.timeLimit} min
                    </span>
                  </div>
                  <Slider
                    value={[testData.timeLimit]}
                    min={1}
                    max={180}
                    step={1}
                    onValueChange={(value) =>
                      onTestInfoChange("timeLimit", value[0])
                    }
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">1 min</span>
                    <span className="text-xs text-gray-400">3 hours</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-300">
                      Warning Time (minutes before end)
                    </Label>
                    <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded">
                      {testData.warningTime} min
                    </span>
                  </div>
                  <Slider
                    value={[testData.warningTime]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) =>
                      onTestInfoChange("warningTime", value[0])
                    }
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Allow Pause</Label>
                <p className="text-xs text-gray-400">
                  Let students pause the timer
                </p>
              </div>
              <Switch
                checked={testData.allowPause}
                onCheckedChange={(checked) =>
                  onTestInfoChange("allowPause", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Shuffle Questions</Label>
                <p className="text-xs text-gray-400">
                  Randomize question order for each attempt
                </p>
              </div>
              <Switch
                checked={testData.shuffleQuestions}
                onCheckedChange={(checked) =>
                  onTestInfoChange("shuffleQuestions", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Shuffle Answers</Label>
                <p className="text-xs text-gray-400">
                  Randomize answer options for multiple choice questions
                </p>
              </div>
              <Switch
                checked={testData.shuffleAnswers}
                onCheckedChange={(checked) =>
                  onTestInfoChange("shuffleAnswers", checked)
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-300">Maximum Attempts</Label>
                <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded">
                  {testData.maxAttempts === 0
                    ? "Unlimited"
                    : `${testData.maxAttempts} attempts`}
                </span>
              </div>
              <Slider
                value={[testData.maxAttempts]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) =>
                  onTestInfoChange("maxAttempts", value[0])
                }
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">Unlimited</span>
                <span className="text-xs text-gray-400">10 attempts</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-300">Passing Score (%)</Label>
                <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded">
                  {testData.passingScore}%
                </span>
              </div>
              <Slider
                value={[testData.passingScore]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) =>
                  onTestInfoChange("passingScore", value[0])
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Test Summary */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-100">
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Questions</span>
              <span className="font-semibold text-white">
                {testData.questions.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Points</span>
              <span className="font-semibold text-white">
                {testData.questions.reduce(
                  (sum, q) => sum + (q.points || 0),
                  0
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Estimated Duration</span>
              <span className="font-semibold text-white">
                {Math.max(testData.questions.length * 2, 5)} min
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Settings Summary */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-100">
              Settings Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-gray-300">
                {testData.hasTimer
                  ? `Timed: ${testData.timeLimit} minutes`
                  : "No time limit"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Shuffle className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-gray-300">
                {testData.shuffleQuestions
                  ? "Questions shuffled"
                  : "Fixed question order"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-gray-300">
                Passing score: {testData.passingScore}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gray-800/50 border border-teal-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              💡 Settings Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-300 space-y-2">
            <p>• Set a time limit for more challenging tests</p>
            <p>• Shuffle questions to prevent memorization</p>
            <p>• Allow multiple attempts for practice tests</p>
            <p>• Add descriptive tags to help students find your quiz</p>
            <p>• Sequential navigation is best for linear learning</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
