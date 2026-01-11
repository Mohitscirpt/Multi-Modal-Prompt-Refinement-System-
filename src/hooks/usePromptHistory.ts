import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PromptSubmission, RefinedPrompt, InputType, SubmissionStatus } from "@/types/prompt";

interface UsePromptHistoryOptions {
  limit?: number;
  statusFilter?: SubmissionStatus | null;
  inputTypeFilter?: InputType | null;
  searchQuery?: string;
}

export function usePromptHistory(options: UsePromptHistoryOptions = {}) {
  const { limit = 50, statusFilter, inputTypeFilter, searchQuery } = options;
  const [submissions, setSubmissions] = useState<PromptSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("prompt_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (inputTypeFilter) {
        query = query.eq("input_type", inputTypeFilter);
      }

      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,raw_text.ilike.%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedData: PromptSubmission[] = (data || []).map((item) => ({
        ...item,
        refined_prompt: item.refined_prompt as unknown as RefinedPrompt | null,
        validation_errors: (item.validation_errors as string[]) || [],
        file_urls: item.file_urls || [],
        file_names: item.file_names || [],
        file_types: item.file_types || [],
      }));

      setSubmissions(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submissions");
    } finally {
      setIsLoading(false);
    }
  }, [limit, statusFilter, inputTypeFilter, searchQuery]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const deleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase.from("prompt_submissions").delete().eq("id", id);

      if (error) throw error;

      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete submission");
      return false;
    }
  };

  const getSubmission = async (id: string): Promise<PromptSubmission | null> => {
    try {
      const { data, error } = await supabase
        .from("prompt_submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        ...data,
        refined_prompt: data.refined_prompt as unknown as RefinedPrompt | null,
        validation_errors: (data.validation_errors as string[]) || [],
        file_urls: data.file_urls || [],
        file_names: data.file_names || [],
        file_types: data.file_types || [],
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submission");
      return null;
    }
  };

  return {
    submissions,
    isLoading,
    error,
    refresh: fetchSubmissions,
    deleteSubmission,
    getSubmission,
  };
}
