import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';

function guessFileExtension(contentType?: string | null) {
  if (!contentType) return 'jpg';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  return 'jpg';
}

export async function uploadProfileAvatar(userId: string, localUri: string): Promise<{
  path: string;
  publicUrl: string;
}> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const contentType = blob.type || 'image/jpeg';
  const extension = guessFileExtension(contentType);
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, blob, {
    contentType,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  return { path, publicUrl };
}

export async function removeProfileAvatar(path: string): Promise<void> {
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  if (error) throw error;
}

export async function resolveProfileAvatarUrl(
  avatarPath?: string | null,
  avatarUrl?: string | null,
): Promise<string | null> {
  if (avatarPath) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(avatarPath, 60 * 60);
    if (!signedError && signedData?.signedUrl) return signedData.signedUrl;

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath);
    if (publicUrl) return publicUrl;
  }

  if (avatarUrl) return avatarUrl;
  return null;
}
