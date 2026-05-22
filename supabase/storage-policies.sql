-- Fringe: recommended Storage policies for the `avatars` bucket.
-- Run in Supabase SQL Editor after creating bucket `avatars`.

-- Ensure bucket exists and is public (direct object URLs)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Remove broad list policy if present (not needed; exposes file listing)
drop policy if exists "Clients can list all files in this bucket" on storage.objects;
drop policy if exists "Public can list avatars" on storage.objects;

-- Public read of objects only (not bucket listing)
drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

-- Authenticated users: write only in own folder (<uid>/...)
drop policy if exists "Users can upload own avatar files" on storage.objects;
create policy "Users can upload own avatar files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own avatar files" on storage.objects;
create policy "Users can update own avatar files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own avatar files" on storage.objects;
create policy "Users can delete own avatar files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
