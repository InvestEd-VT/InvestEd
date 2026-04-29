import { Resend } from 'resend';
import { env } from '../config/env.js';
import logger from '../config/logger.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const FROM_EMAIL = env.EMAIL_FROM || 'InvestEd <onboarding@resend.dev>';

function emailTemplate(title: string, body: string, ctaText: string, ctaUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:#18181b;padding:24px 32px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">InvestEd</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">Investment Education Platform</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#18181b;">${title}</h2>
          <div style="font-size:14px;line-height:1.6;color:#52525b;">${body}</div>
          <div style="text-align:center;margin:28px 0;">
            <a href="${ctaUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">${ctaText}</a>
          </div>
          <p style="font-size:12px;color:#a1a1aa;margin-top:24px;">If the button doesn't work, copy this link:<br>
            <a href="${ctaUrl}" style="color:#2563eb;word-break:break-all;">${ctaUrl}</a>
          </p>
        </td></tr>
        <tr><td style="background:#fafafa;padding:16px 32px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:11px;color:#a1a1aa;">This is an automated message from InvestEd. Do not reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  if (!resend) {
    logger.info(`[DEV] Verification email skipped. Verify link: ${verificationUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your InvestEd account',
    html: emailTemplate(
      'Verify Your Email',
      '<p>Welcome to InvestEd! Click the button below to verify your email address and activate your account.</p><p style="color:#a1a1aa;font-size:12px;">This link expires in <strong>24 hours</strong>.</p>',
      'Verify Email',
      verificationUrl
    ),
  });

  if (error) {
    logger.error('Failed to send verification email', { error, to: email });
  } else {
    logger.info('Verification email sent', { to: email });
  }
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  if (!resend) {
    logger.info(`[DEV] Password reset email skipped. Reset link: ${resetUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your InvestEd password',
    html: emailTemplate(
      'Reset Your Password',
      '<p>We received a request to reset your password. Click the button below to choose a new one.</p><p style="color:#a1a1aa;font-size:12px;">This link expires in <strong>1 hour</strong>. If you didn\'t request this, you can safely ignore this email.</p>',
      'Reset Password',
      resetUrl
    ),
  });

  if (error) {
    logger.error('Failed to send password reset email', { error, to: email });
  } else {
    logger.info('Password reset email sent', { to: email });
  }
};
