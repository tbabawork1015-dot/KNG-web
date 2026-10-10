// Supabase Auth はメールアドレスが必須のため、ユーザー名をダミーのメールアドレスに変換して扱う。
// .invalid は実在しないことが保証されたドメイン（RFC 2606）
export const USERNAME_EMAIL_DOMAIN = 'kng.invalid'

// ログイン画面の入力値 → Supabase に渡すメールアドレス
// '@' を含む場合は既存アカウント用にメールアドレスとしてそのまま扱う
export function toLoginEmail(input: string): string {
  const v = input.trim()
  return v.includes('@') ? v : `${v}@${USERNAME_EMAIL_DOMAIN}`
}

// Supabase のメールアドレス → 画面に表示する名前
export function toDisplayName(email: string): string {
  const suffix = `@${USERNAME_EMAIL_DOMAIN}`
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email
}
