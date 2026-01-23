-- Supabase Storage Policies for admin-uploads bucket
-- Run this in Supabase SQL Editor after creating the bucket

-- Make bucket public for easier access (adjust based on your security needs)
-- Or use authenticated policies if you have Supabase Auth enabled

-- Policy 1: Allow Public Read Access (for displaying images)
CREATE POLICY "Public read access for admin-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-uploads');

-- Policy 2: Allow Public Upload (for admin panel)
-- WARNING: This allows anyone to upload. For production, use authenticated policies.
CREATE POLICY "Public upload access for admin-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'admin-uploads');

-- Policy 3: Allow Public Update
CREATE POLICY "Public update access for admin-uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'admin-uploads');

-- Policy 4: Allow Public Delete
CREATE POLICY "Public delete access for admin-uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'admin-uploads');

-- Alternative: If you want authenticated-only access (requires Supabase Auth)
-- Uncomment these and comment out the public policies above:

-- CREATE POLICY "Authenticated read access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'admin-uploads' AND auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated upload access"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'admin-uploads' AND auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated update access"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'admin-uploads' AND auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated delete access"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'admin-uploads' AND auth.role() = 'authenticated');

