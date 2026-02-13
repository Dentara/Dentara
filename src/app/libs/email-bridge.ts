// app/libs/email-bridge.ts
// Mövcud app/libs/email.ts faylını dəyişmirik; fərqli imzaları dəstəkləmək üçün körpü.

import * as EmailLib from "./email";

type SendArgs = { to: string; subject: string; html: string };

export async function sendMailViaProjectHelper({ to, subject, html }: SendArgs) {
  const anyLib = EmailLib as any;

  // 1) sendVerificationEmail(to, token, name?) tipli funksiyanı varsa uyğunlaşdırmaq mümkün deyil,
  //    amma bir çox layihədə sendEmail({to, subject, html}) və ya default(to, subject, html) olur.
  if (typeof anyLib.sendEmail === "function") {
    return await anyLib.sendEmail({ to, subject, html });
  }
  if (typeof anyLib.default === "function") {
    // default(to, subject, html) ola bilər
    try {
      return await anyLib.default(to, subject, html);
    } catch {
      return await anyLib.default({ to, subject, html });
    }
  }
  if (typeof anyLib.sendVerificationEmail === "function") {
    // Bəzən sendVerificationEmail({to, subject, html}) də ola bilər:
    try {
      return await anyLib.sendVerificationEmail({ to, subject, html });
    } catch {
      return await anyLib.sendVerificationEmail(to, subject, html);
    }
  }
  // 2) Resend instance export edilirsə:
  if (anyLib.resend?.emails?.send) {
    return await anyLib.resend.emails.send({
      from: "Dentara <no-reply@dentara.io>",
      to, subject, html,
    });
  }

  throw new Error("Email helperdə tanınan göndərmə funksiyası tapılmadı. (email.ts)");
}
