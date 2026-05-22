# Fringe security checklist

## Already in the app

- Supabase Row Level Security on `categories`, `transactions`, `goals` (see `schema.sql`)
- Client uses **anon key only** (never put `service_role` in the mobile/web app)
- Password rules: min 6 chars, 1 uppercase, 1 special character
- 60-minute max session + 15-minute idle timeout (app-enforced sign out)
- Sign-out clears local budget cache and profile preferences
- Password reset uses a generic success message (reduces email enumeration)
- Avatar uploads scoped to `avatars/<user-id>/...` via Storage policies

## Supabase Dashboard (do these manually)

### Authentication

1. **Authentication → Providers → Email**
   - Enable email confirmation for new signups (recommended)
   - Set minimum password length to **6** (match app rules; stricter is fine)
2. **Authentication → URL Configuration**
   - Site URL: your Vercel production URL
   - Redirect URLs: `https://<vercel-domain>/reset-password`, `fringe://reset-password`, Expo dev URLs if needed
3. **Authentication → Rate limits**
   - Keep defaults or tighten sign-in / reset-password limits

### Storage

1. Run `storage-policies.sql` in SQL Editor
2. **Do not** keep a policy that lets clients **list all files** in `avatars`
3. Confirm uploads land under `<user-id>/avatar-....jpg` and are non-zero bytes

### API keys

- **Project Settings → API**: use `anon` key in `EXPO_PUBLIC_SUPABASE_ANON_KEY` only
- **Never** commit or ship `service_role` in the Expo/Vercel app
- Rotate keys if they were ever exposed in git or screenshots

### Vercel

- Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in Vercel env (not in repo)
- Use Production + Preview envs consistently

## Optional hardening (later)

- Private `avatars` bucket + signed URLs only (more private, more code)
- Supabase Auth hook + Edge Function for password-change email (see `functions/README.md`)
- App PIN / biometric lock (local device layer, from PRD)
- Export/delete account flows for GDPR-style requests
