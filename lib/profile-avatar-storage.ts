import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let index = 0; index < length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }
  return bytes;
}

function guessFileExtension(contentType?: string | null) {
  if (!contentType) return 'jpg';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  return 'jpg';
}

function guessContentTypeFromUri(uri: string) {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

async function readBlobFromLocalUri(localUri: string): Promise<Blob> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  if (blob.size === 0) throw new Error('Selected image has zero bytes from local URI.');
  return blob;
}

export async function uploadProfileAvatar(userId: string, localUri: string): Promise<{
  path: string;
  publicUrl: string;
}> {
  const blob = await readBlobFromLocalUri(localUri);
  const contentType = blob.type || guessContentTypeFromUri(localUri);
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

export async function uploadProfileAvatarFromBase64(
  userId: string,
  base64: string,
  contentType = 'image/jpeg',
): Promise<{
  path: string;
  publicUrl: string;
}> {
  const extension = guessFileExtension(contentType);
  const path = `${userId}/avatar-${Date.now()}.${extension}`;
  const sanitized = base64.replace(/\s/g, '');
  const bytes = base64ToUint8Array(sanitized);
  if (bytes.byteLength === 0) throw new Error('Selected image has zero bytes after base64 conversion.');

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, bytes, {
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
