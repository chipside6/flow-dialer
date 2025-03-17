
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('greetings', 'greetings', true, false);

-- Set up storage policies for the greetings bucket
-- Allow users to read their own greeting files
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Users can read their own greeting files',
  '(bucket_id = ''greetings'' AND auth.uid()::text = SUBSTRING(name, 0, POSITION(''/'''' IN name)))',
  'greetings'
);

-- Allow users to insert their own greeting files
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Users can upload greeting files into their own folder',
  '(bucket_id = ''greetings'' AND auth.uid()::text = SUBSTRING(name, 0, POSITION(''/'''' IN name)))',
  'greetings'
);

-- Allow users to update their own greeting files
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Users can update their own greeting files',
  '(bucket_id = ''greetings'' AND auth.uid()::text = SUBSTRING(name, 0, POSITION(''/'''' IN name)))',
  'greetings'
);

-- Allow users to delete their own greeting files
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Users can delete their own greeting files',
  '(bucket_id = ''greetings'' AND auth.uid()::text = SUBSTRING(name, 0, POSITION(''/'''' IN name)))',
  'greetings'
);
