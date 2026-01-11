import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload, RefinedPrompt, PromptSubmission, InputType } from "@/types/prompt";
import { toast } from "sonner";

interface SubmitPromptParams {
  text: string;
  files: FileUpload[];
}

export function usePromptSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PromptSubmission | null>(null);

  const uploadFiles = async (files: FileUpload[]): Promise<{ urls: string[]; names: string[]; types: string[] }> => {
    const urls: string[] = [];
    const names: string[] = [];
    const types: string[] = [];

    for (const fileUpload of files) {
      const fileName = `${Date.now()}-${fileUpload.file.name}`;
      const { data, error } = await supabase.storage
        .from("prompt-files")
        .upload(fileName, fileUpload.file);

      if (error) {
        throw new Error(`Failed to upload ${fileUpload.file.name}: ${error.message}`);
      }

      const { data: publicUrl } = supabase.storage
        .from("prompt-files")
        .getPublicUrl(data.path);

      urls.push(publicUrl.publicUrl);
      names.push(fileUpload.file.name);
      types.push(fileUpload.file.type);
    }

    return { urls, names, types };
  };

  const determineInputType = (text: string, files: FileUpload[]): InputType => {
    const hasText = text.trim().length > 0;
    const hasImages = files.some((f) => f.type === "image");
    const hasDocuments = files.some((f) => f.type === "document");

    if (hasText && (hasImages || hasDocuments)) return "mixed";
    if (hasImages) return "image";
    if (hasDocuments) return "document";
    return "text";
  };

  const submitPrompt = async ({ text, files }: SubmitPromptParams) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      // Upload files first
      let fileData = { urls: [] as string[], names: [] as string[], types: [] as string[] };
      if (files.length > 0) {
        fileData = await uploadFiles(files);
      }

      const inputType = determineInputType(text, files);

      // Create initial submission record
      const { data: submission, error: insertError } = await supabase
        .from("prompt_submissions")
        .insert({
          status: "processing",
          input_type: inputType,
          raw_text: text || null,
          file_urls: fileData.urls,
          file_names: fileData.names,
          file_types: fileData.types,
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      // Call the AI processing edge function
      const startTime = Date.now();
      const { data: refinedData, error: functionError } = await supabase.functions.invoke(
        "refine-prompt",
        {
          body: {
            text,
            fileUrls: fileData.urls,
            fileNames: fileData.names,
            fileTypes: fileData.types,
          },
        }
      );

      const processingTime = Date.now() - startTime;

      if (functionError) {
        // Update submission with error
        await supabase
          .from("prompt_submissions")
          .update({
            status: "failed",
            error_message: functionError.message,
          })
          .eq("id", submission.id);

        throw new Error(functionError.message);
      }

      // Check if input was rejected
      if (refinedData.rejected) {
        await supabase
          .from("prompt_submissions")
          .update({
            status: "rejected",
            error_message: refinedData.reason,
            validation_errors: [refinedData.reason],
          })
          .eq("id", submission.id);

        toast.error("Input Rejected", {
          description: refinedData.reason,
        });

        const rejectedSubmission: PromptSubmission = {
          ...submission,
          status: "rejected",
          error_message: refinedData.reason,
          validation_errors: [refinedData.reason],
          refined_prompt: null,
          completeness_score: 0,
          validation_passed: false,
          file_urls: fileData.urls,
          file_names: fileData.names,
          file_types: fileData.types,
        };
        setResult(rejectedSubmission);
        return rejectedSubmission;
      }

      // Update submission with refined prompt
      const refinedPrompt = refinedData.refinedPrompt as RefinedPrompt;
      const validationPassed =
        refinedPrompt.validation_flags.missing_sections.length === 0 &&
        refinedPrompt.validation_flags.ambiguous_items.length === 0;

      const { data: updatedSubmission, error: updateError } = await supabase
        .from("prompt_submissions")
        .update({
          status: "completed",
          title: refinedPrompt.product_overview.title || "Untitled Prompt",
          refined_prompt: refinedPrompt as any,
          completeness_score: refinedPrompt.metadata.confidence_score,
          validation_passed: validationPassed,
          processing_time_ms: processingTime,
        })
        .eq("id", submission.id)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);

      const resultSubmission: PromptSubmission = {
        ...updatedSubmission,
        refined_prompt: updatedSubmission.refined_prompt as unknown as RefinedPrompt,
        validation_errors: updatedSubmission.validation_errors as string[] || [],
        file_urls: updatedSubmission.file_urls || [],
        file_names: updatedSubmission.file_names || [],
        file_types: updatedSubmission.file_types || [],
      };

      setResult(resultSubmission);
      toast.success("Prompt refined successfully!");
      return resultSubmission;
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Refinement Failed", { description: message });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
  };

  return {
    submitPrompt,
    isSubmitting,
    result,
    reset,
  };
}
