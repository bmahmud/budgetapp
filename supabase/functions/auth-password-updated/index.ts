interface AuthHookPayload {
  type?: string;
  event?: string;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
  record?: {
    id?: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
}

interface ResendSendEmailBody {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function verifyJwt(token: string, secret: string) {
  const segments = token.split('.');
  if (segments.length !== 3) return false;

  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const signedContent = `${headerSegment}.${payloadSegment}`;
  const signatureBytes = decodeBase64Url(signatureSegment);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    new TextEncoder().encode(signedContent),
  );

  if (!isValid) return false;

  const payloadJson = new TextDecoder().decode(decodeBase64Url(payloadSegment));
  const payload = JSON.parse(payloadJson) as { exp?: number };
  if (!payload.exp) return true;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowInSeconds;
}

function extractUser(payload: AuthHookPayload) {
  const user = payload.user ?? payload.record;
  const email = user?.email ?? '';
  if (!email) return null;

  const displayNameCandidate = user?.user_metadata?.full_name;
  const displayName =
    typeof displayNameCandidate === 'string' && displayNameCandidate.trim().length > 0
      ? displayNameCandidate.trim()
      : email.split('@')[0];

  return { email, displayName };
}

function isPasswordUpdateEvent(payload: AuthHookPayload) {
  const marker = `${payload.type ?? ''} ${payload.event ?? ''}`.toLowerCase();
  if (marker.includes('password') && marker.includes('update')) return true;
  if (marker.includes('password') && marker.includes('changed')) return true;
  if (marker.includes('recovery')) return true;
  return true;
}

function buildEmailBody(displayName: string) {
  const appName = 'Fringe';
  return {
    subject: `${appName}: Password changed successfully`,
    text:
      `Hi ${displayName},\n\n` +
      `This is a confirmation that your ${appName} account password was changed.\n` +
      `If you did not make this change, reset your password immediately.\n\n` +
      `- ${appName} Security`,
    html:
      `<p>Hi ${displayName},</p>` +
      `<p>This is a confirmation that your <strong>${appName}</strong> account password was changed.</p>` +
      `<p>If you did not make this change, reset your password immediately.</p>` +
      `<p>- ${appName} Security</p>`,
  };
}

async function sendEmail({
  resendApiKey,
  fromEmail,
  toEmail,
  displayName,
}: {
  resendApiKey: string;
  fromEmail: string;
  toEmail: string;
  displayName: string;
}) {
  const emailBody = buildEmailBody(displayName);
  const payload: ResendSendEmailBody = {
    from: fromEmail,
    to: [toEmail],
    subject: emailBody.subject,
    html: emailBody.html,
    text: emailBody.text,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) return;

  const errorText = await response.text();
  throw new Error(`Resend API failed (${response.status}): ${errorText}`);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const webhookSecret = Deno.env.get('SUPABASE_AUTH_HOOK_SECRET') ?? '';
  const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? '';
  if (!webhookSecret || !resendApiKey || !fromEmail) {
    return jsonResponse(500, {
      error: 'Missing required environment variables',
      required: ['SUPABASE_AUTH_HOOK_SECRET', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
    });
  }

  const authHeader = request.headers.get('Authorization') ?? request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';
  if (!token) {
    return jsonResponse(401, { error: 'Missing bearer token' });
  }

  const isVerified = await verifyJwt(token, webhookSecret);
  if (!isVerified) {
    return jsonResponse(401, { error: 'Invalid webhook signature' });
  }

  let payload: AuthHookPayload;
  try {
    payload = (await request.json()) as AuthHookPayload;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON payload' });
  }

  if (!isPasswordUpdateEvent(payload)) {
    return jsonResponse(200, { ok: true, skipped: true, reason: 'not-password-update-event' });
  }

  const user = extractUser(payload);
  if (!user) {
    return jsonResponse(200, { ok: true, skipped: true, reason: 'missing-user-email' });
  }

  try {
    await sendEmail({
      resendApiKey,
      fromEmail,
      toEmail: user.email,
      displayName: user.displayName,
    });
    return jsonResponse(200, { ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return jsonResponse(500, { error: 'Failed to send confirmation email', details: message });
  }
});
