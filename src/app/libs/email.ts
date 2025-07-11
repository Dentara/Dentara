import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async (data: EmailPayload) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Dentara <noreply@dentara.io>',
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    console.log("✅ Email sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Failed to send email.");
  }
};

// ✅ Verification email
export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.SITE_URL}/api/verify-email?token=${token}`;

  return await sendEmail({
    to,
    subject: "Verify your Dentara account",
    html: `
      <p>Hello 👋,</p>
      <p>Thank you for registering at Dentara. Please verify your email by clicking the button below:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background-color:#2563EB;color:#fff;border-radius:5px;text-decoration:none;">Verify Email</a>
      <p>If the button doesn't work, copy and paste the link below:</p>
      <p>${verifyUrl}</p>
    `,
  });
}

// ✅ Password reset email
export async function sendResetPasswordEmail(to: string, resetLink: string) {
  return await sendEmail({
    to,
    subject: "Reset your Dentara password",
    html: `
      <p>Hello 👋,</p>
      <p>You requested a password reset for your Dentara account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#2563EB;color:#fff;border-radius:5px;text-decoration:none;">Reset Password</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${resetLink}</p>
      <p>This link is valid for 15 minutes.</p>
    `,
  });
}
