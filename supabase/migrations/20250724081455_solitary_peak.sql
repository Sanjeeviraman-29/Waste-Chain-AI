/*
  # WasteChain AI Storage Setup - Session WCAI_0723
  
  1. Storage Buckets
    - `waste-images` - Private bucket for waste pickup images
  
  2. Storage Policies
    - Users can upload to their own user_id folder
    - Assigned collectors can read pickup images
    - Secure folder-based access control
*/

-- Create waste-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'waste-images',
  'waste-images',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for waste-images bucket

-- Users can upload images to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'waste-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own images
CREATE POLICY "Users can view own images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'waste-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Collectors can view images of assigned pickups
CREATE POLICY "Collectors can view assigned pickup images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'waste-images' AND
    EXISTS (
      SELECT 1 FROM pickups p
      JOIN collectors c ON c.id = p.collector_id
      WHERE c.user_id = auth.uid()
      AND (storage.foldername(name))[1] = p.user_id::text
    )
  );

-- Users can update their own images
CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'waste-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'waste-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );