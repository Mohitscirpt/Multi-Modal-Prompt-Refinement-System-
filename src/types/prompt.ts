// Core types for the prompt refinement system

export type SubmissionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
export type InputType = 'text' | 'image' | 'document' | 'mixed';

export interface ProductOverview {
  title: string;
  description: string;
  target_users: string;
  problem_statement: string;
}

export interface Requirements {
  functional: string[];
  non_functional: string[];
  priority_ranked: boolean;
}

export interface Constraints {
  technical: string[];
  business: string[];
  timeline: string;
}

export interface Deliverables {
  expected_outputs: string[];
  success_criteria: string[];
}

export interface ValidationFlags {
  missing_sections: string[];
  ambiguous_items: string[];
  confidence_notes: string;
}

export interface RefinedPromptMetadata {
  id: string;
  timestamp: string;
  source_types: InputType[];
  confidence_score: number;
}

export interface RefinedPrompt {
  metadata: RefinedPromptMetadata;
  product_overview: ProductOverview;
  requirements: Requirements;
  constraints: Constraints;
  deliverables: Deliverables;
  validation_flags: ValidationFlags;
}

export interface PromptSubmission {
  id: string;
  title: string | null;
  status: SubmissionStatus;
  input_type: InputType;
  raw_text: string | null;
  file_urls: string[];
  file_names: string[];
  file_types: string[];
  refined_prompt: RefinedPrompt | null;
  completeness_score: number | null;
  validation_passed: boolean;
  validation_errors: string[];
  processing_time_ms: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileUpload {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
