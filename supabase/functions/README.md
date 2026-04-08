# Supabase Auth Hook: Password Change Confirmation Email

This function sends a confirmation email whenever a user's password is updated.

## Function

- Name: `auth-password-updated`
- Runtime: Supabase Edge Functions (Deno)
- Provider: [Resend](https://resend.com)

## 1) Deploy the function

From project root:

```bash
supabase functions deploy auth-password-updated
```

## 2) Set required secrets

Set these in your Supabase project:

```bash
supabase secrets set \
  SUPABASE_AUTH_HOOK_SECRET=your_random_hook_secret \
  RESEND_API_KEY=your_resend_api_key \
  RESEND_FROM_EMAIL="Fringe Security <security@yourdomain.com>"
```

Notes:
- `RESEND_FROM_EMAIL` must be a sender verified in Resend.
- `SUPABASE_AUTH_HOOK_SECRET` is shared between Supabase Auth hook and this function for JWT verification.

## 3) Configure the Supabase Auth hook

In Supabase Dashboard:

1. Go to **Authentication → Hooks**
2. Enable the hook for password/user updates (password change event)
3. URL:
   - `https://<project-ref>.functions.supabase.co/auth-password-updated`
4. Secret:
   - Use the same value as `SUPABASE_AUTH_HOOK_SECRET`

The function verifies the JWT signature in the `Authorization: Bearer <token>` header.

## 4) Test

1. Run password reset in the app.
2. Update password successfully.
3. Confirm:
   - In-app success alert appears.
   - Confirmation email arrives.
4. Check logs if needed:

```bash
supabase functions logs auth-password-updated --follow
```

