import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileUploadZone } from "@/components/submit/FileUploadZone";
import { RefinedPromptView } from "@/components/submit/RefinedPromptView";
import { usePromptSubmission } from "@/hooks/usePromptSubmission";
import { FileUpload } from "@/types/prompt";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sparkles,
  Send,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 10000;

export default function SubmitPage() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { submitPrompt, isSubmitting, result, reset } = usePromptSubmission();

  const validate = (): boolean => {
    const errors: string[] = [];

    if (!text.trim() && files.length === 0) {
      errors.push("Please provide text input or upload at least one file.");
    }

    if (text.trim() && text.trim().length < MIN_TEXT_LENGTH) {
      errors.push(`Text must be at least ${MIN_TEXT_LENGTH} characters.`);
    }

    if (text.length > MAX_TEXT_LENGTH) {
      errors.push(`Text must be less than ${MAX_TEXT_LENGTH} characters.`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await submitPrompt({ text, files });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleReset = () => {
    setText("");
    setFiles([]);
    setValidationErrors([]);
    reset();
  };

  const isResultVisible = result !== null;
  const hasContent = text.trim().length > 0 || files.length > 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Submit New Prompt</h1>
          <p className="text-muted-foreground">
            Provide text, images, or documents to refine into a structured product development
            prompt.
          </p>
        </div>

        {/* Show result if available */}
        {isResultVisible ? (
          <div className="space-y-6">
            {/* Status Banner */}
            {result.status === "completed" && (
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle className="text-success">Refinement Complete</AlertTitle>
                <AlertDescription className="text-success/90">
                  Your input has been processed successfully. Review the structured prompt below.
                </AlertDescription>
              </Alert>
            )}

            {result.status === "rejected" && (
              <Alert className="border-destructive bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">Input Rejected</AlertTitle>
                <AlertDescription className="text-destructive/90">
                  {result.error_message ||
                    "The input does not appear to be related to product development."}
                </AlertDescription>
              </Alert>
            )}

            {result.status === "failed" && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">Processing Failed</AlertTitle>
                <AlertDescription className="text-destructive/90">
                  {result.error_message || "An error occurred while processing your input."}
                </AlertDescription>
              </Alert>
            )}

            {/* Refined Prompt View */}
            {result.refined_prompt && (
              <RefinedPromptView
                prompt={result.refined_prompt}
                processingTimeMs={result.processing_time_ms || undefined}
              />
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Start New Submission
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert className="border-destructive bg-destructive/10 animate-fade-in">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">Validation Failed</AlertTitle>
                <AlertDescription className="text-destructive/90">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Text Input */}
            <Card className="glass animate-slide-in-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Text Description
                </CardTitle>
                <CardDescription>
                  Describe your product idea, requirements, or paste any relevant text content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="E.g., I want to build a mobile app that helps users track their daily water intake. The app should have reminders, visual progress tracking, and sync with health apps..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] resize-y"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>
                    {text.length} / {MAX_TEXT_LENGTH} characters
                  </span>
                  <span
                    className={cn(
                      text.length > 0 && text.length < MIN_TEXT_LENGTH && "text-warning"
                    )}
                  >
                    Minimum {MIN_TEXT_LENGTH} characters
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="glass animate-slide-in-left" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle>File Attachments</CardTitle>
                <CardDescription>
                  Upload product sketches, reference designs, screenshots, or specification
                  documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  files={files}
                  onFilesChange={setFiles}
                  maxFiles={10}
                  maxSize={20}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!hasContent || isSubmitting}
                className="gap-2 gradient-primary shadow-glow"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Refine Prompt
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
