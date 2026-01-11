-- Create enum for submission status
CREATE TYPE submission_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'rejected');

-- Create enum for input type
CREATE TYPE input_type AS ENUM ('text', 'image', 'document', 'mixed');

-- Create table for prompt submissions
CREATE TABLE public.prompt_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  input_type input_type NOT NULL DEFAULT 'text',
  
  -- Raw inputs
  raw_text TEXT,
  file_urls TEXT[] DEFAULT '{}',
  file_names TEXT[] DEFAULT '{}',
  file_types TEXT[] DEFAULT '{}',
  
  -- Refined output (JSONB for flexibility)
  refined_prompt JSONB,
  
  -- Validation results
  completeness_score INTEGER CHECK (completeness_score >= 0 AND completeness_score <= 100),
  validation_passed BOOLEAN DEFAULT false,
  validation_errors JSONB DEFAULT '[]',
  
  -- Metadata
  processing_time_ms INTEGER,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public) VALUES ('prompt-files', 'prompt-files', true);

-- Enable RLS on the table
ALTER TABLE public.prompt_submissions ENABLE ROW LEVEL SECURITY;

-- Create public access policies (no auth required for this demo)
CREATE POLICY "Anyone can view submissions"
  ON public.prompt_submissions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create submissions"
  ON public.prompt_submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update submissions"
  ON public.prompt_submissions
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete submissions"
  ON public.prompt_submissions
  FOR DELETE
  USING (true);

-- Storage policies for file uploads
CREATE POLICY "Anyone can upload files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'prompt-files');

CREATE POLICY "Anyone can view files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'prompt-files');

CREATE POLICY "Anyone can delete files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'prompt-files');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prompt_submissions_updated_at
  BEFORE UPDATE ON public.prompt_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();