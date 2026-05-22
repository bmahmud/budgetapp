import { purgeUserBudgetData } from '@/lib/budget-remote';
import { removeAllProfileAvatars, removeProfileAvatar } from '@/lib/profile-avatar-storage';
import { supabase } from '@/lib/supabase';

export async function deleteUserAccount(password: string, email: string): Promise<void> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    throw new Error('Enter your password to confirm account deletion.');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('You are not signed in.');

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });
  if (reauthError) {
    throw new Error('Incorrect password. Account was not deleted.');
  }

  const avatarPath = user.user_metadata?.avatar_path as string | undefined;
  if (avatarPath) {
    await removeProfileAvatar(avatarPath).catch(() => undefined);
  }
  await removeAllProfileAvatars(user.id).catch(() => undefined);

  await purgeUserBudgetData(user.id);

  const { error: rpcError } = await supabase.rpc('delete_own_account');
  if (rpcError) {
    throw new Error(
      'Could not remove your login account. Ask support to run supabase/delete-account.sql in the Supabase SQL Editor.',
    );
  }

  await supabase.auth.signOut({ scope: 'local' });
}
