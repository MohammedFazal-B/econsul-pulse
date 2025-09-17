-- Create table for user submissions
CREATE TABLE public.user_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  subject TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for sentiment analysis results
CREATE TABLE public.sentiment_analysis (
  comment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_comment TEXT NOT NULL,
  summary TEXT NOT NULL,
  sentiment_analysis TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public consultation system)
CREATE POLICY "Enable read access for all users" ON public.user_submissions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.user_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.sentiment_analysis FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.sentiment_analysis FOR INSERT WITH CHECK (true);