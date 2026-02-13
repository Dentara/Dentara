// src/lib/passwordPolicy.ts

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter and one number.";

export function validatePassword(password: string | null | undefined) {
  const pwd = (password || "").trim();

  if (pwd.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, message: PASSWORD_POLICY_MESSAGE };
  }

  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);

  if (!hasLower || !hasUpper || !hasDigit) {
    return { ok: false, message: PASSWORD_POLICY_MESSAGE };
  }

  return { ok: true };
}

// ==== Strength indicator (frontend üçün) ====

export type PasswordStrengthLevel = "empty" | "very-weak" | "weak" | "medium" | "strong";

export function getPasswordStrength(password: string | null | undefined): {
  level: PasswordStrengthLevel;
  score: 0 | 1 | 2 | 3 | 4;
} {
  const pwd = (password || "").trim();
  if (!pwd) return { level: "empty", score: 0 };

  let points = 0;

  if (pwd.length >= 8) points += 1;
  if (pwd.length >= 12) points += 1;
  if (/[a-z]/.test(pwd)) points += 1;
  if (/[A-Z]/.test(pwd)) points += 1;
  if (/[0-9]/.test(pwd)) points += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) points += 1;

  // 0–6 arası point → 0–4 score
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (points <= 1) score = 1;
  else if (points === 2 || points === 3) score = 2;
  else if (points === 4 || points === 5) score = 3;
  else score = 4;

  let level: PasswordStrengthLevel = "very-weak";
  if (score === 1) level = "very-weak";
  else if (score === 2) level = "weak";
  else if (score === 3) level = "medium";
  else if (score === 4) level = "strong";

  return { level, score };
}
