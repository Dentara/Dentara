//app/libs/email.ts
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
      from: process.env.EMAIL_FROM || 'Tagiza <noreply@tagiza.com>',
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
  const base = process.env.SITE_URL || "https://tagiza.com";
  const verifyUrl = `${base}/api/verify-email?token=${token}`;

  return await sendEmail({
    to,
    subject: "Verify your Tagiza account",
    html: `
      <p>Hello 👋,</p>
      <p>Thank you for registering at <b>Tagiza</b>. Please verify your email by clicking the button below:</p>
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
    subject: "Reset your Tagiza password",
    html: `
      <p>Hello 👋,</p>
      <p>You requested a password reset for your <b>Tagiza</b> account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#2563EB;color:#fff;border-radius:5px;text-decoration:none;">Reset Password</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${resetLink}</p>
      <p>This link is valid for 15 minutes.</p>
    `,
  });
}

/* =========================================================================
   ⬇️  Appointment notification helpers (YENİ)
   Qeyd: Yuxarıdakı mövcud verify/reset məzmununa toxunulmur.
   Bu funksiya(lar) yalnız görüş yaradılarkən və ya status dəyişəndə çağırılır.
   Hər alıcı üçün ayrıca sendEmail() çağırırıq (sənin imzan to: string-dir).
   ======================================================================== */

function fmtDateISO(d: string | Date): string {
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

/** Görüş yaradıldıqda göndərilən məktublar */
export async function sendAppointmentCreatedEmails(opts: {
  patientEmail?: string | null;
  doctorEmail?: string | null;
  clinicEmail?: string | null;
  clinicName?: string | null;
  doctorName?: string | null;
  date: string | Date;
  time?: string | null;
}) {
  const clinic = (opts.clinicName || "Clinic").toString();
  const doctor = (opts.doctorName || "Doctor").toString();
  const dateStr = fmtDateISO(opts.date);
  const timeStr = (opts.time || "").toString();

  const patientHtml = `
    <p>Your appointment was created at <b>${clinic}</b> with <b>${doctor}</b>.</p>
    <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${timeStr}</p>
  `;
  const doctorHtml = `
    <p>A new appointment was scheduled for you at <b>${clinic}</b>.</p>
    <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${timeStr}</p>
  `;
  const clinicHtml = `
    <p>An appointment was created in your clinic <b>${clinic}</b>.</p>
    <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${timeStr}</p>
  `;

  try {
    if (opts.patientEmail) await sendEmail({ to: opts.patientEmail, subject: "Tagiza — Appointment Created", html: patientHtml });
    if (opts.doctorEmail)  await sendEmail({ to: opts.doctorEmail,  subject: "Tagiza — New Appointment Assigned", html: doctorHtml });
    if (opts.clinicEmail)  await sendEmail({ to: opts.clinicEmail,  subject: "Tagiza — Appointment Created (Copy)", html: clinicHtml });
  } catch (e) {
    console.error("❌ Appointment created email error:", e);
  }
}

/** Görüş statusu dəyişəndə göndərilən məktublar */
export async function sendAppointmentStatusEmails(opts: {
  patientEmail?: string | null;
  doctorEmail?: string | null;
  clinicEmail?: string | null;
  clinicName?: string | null;
  doctorName?: string | null;
  date: string | Date;
  time?: string | null;
  status: string;
}) {
  const clinic = (opts.clinicName || "Clinic").toString();
  const doctor = (opts.doctorName || "Doctor").toString();
  const dateStr = fmtDateISO(opts.date);
  const timeStr = (opts.time || "").toString();
  const statusStr = (opts.status || "").replace(/_/g, " ");

  const patientHtml = `
    <p>Your appointment at <b>${clinic}</b> with <b>${doctor}</b> status changed to <b>${statusStr}</b>.</p>
    <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${timeStr}</p>
  `;
  const doctorHtml = `
    <p>An appointment in <b>${clinic}</b> assigned to you is now <b>${statusStr}</b>.</p>
    <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${timeStr}</p>
  `;
  const clinicHtml = `
    <p>An appointment in your clinic <b>${clinic}</b> changed status to <b>${statusStr}</b>.</p>
    <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${timeStr}</p>
  `;

  try {
    if (opts.patientEmail) await sendEmail({ to: opts.patientEmail, subject: "Tagiza — Appointment Status Updated", html: patientHtml });
    if (opts.doctorEmail)  await sendEmail({ to: opts.doctorEmail,  subject: "Tagiza — Appointment Status Updated", html: doctorHtml });
    if (opts.clinicEmail)  await sendEmail({ to: opts.clinicEmail,  subject: "Tagiza — Appointment Status Updated (Copy)", html: clinicHtml });
  } catch (e) {
    console.error("❌ Appointment status email error:", e);
  }
}
