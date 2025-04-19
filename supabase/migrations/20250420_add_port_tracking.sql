
-- Add columns to user_trunks table
ALTER TABLE public.user_trunks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.user_trunks ADD COLUMN IF NOT EXISTS current_campaign_id UUID NULL;
ALTER TABLE public.user_trunks ADD COLUMN IF NOT EXISTS current_call_id TEXT NULL;

-- Add columns to dialer_queue table
ALTER TABLE public.dialer_queue ADD COLUMN IF NOT EXISTS port_number INT NULL;

-- Add columns to dialer_jobs table
ALTER TABLE public.dialer_jobs ADD COLUMN IF NOT EXISTS max_concurrent_calls INT DEFAULT 1;
ALTER TABLE public.dialer_jobs ADD COLUMN IF NOT EXISTS available_ports INT DEFAULT 0;

-- Add columns to campaigns table
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS last_port_used INT DEFAULT 0;

-- Create table for port channel logs
CREATE TABLE IF NOT EXISTS public.channel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  port_number INT NOT NULL,
  event_type TEXT NOT NULL,
  channel_id TEXT NULL,
  call_details JSONB NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on channel_logs
CREATE INDEX IF NOT EXISTS idx_channel_logs_user_id ON public.channel_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_logs_port_number ON public.channel_logs(port_number);
