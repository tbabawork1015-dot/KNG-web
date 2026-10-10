import type { User } from '@supabase/supabase-js'

// 閲覧用ユーザーのロール名（auth.users の app_metadata.role に設定する）
// app_metadata は管理者だけが変更でき、ユーザー自身は書き換えられない
export const VIEWER_ROLE = 'viewer'

export function isViewer(user: User | null): boolean {
  return user?.app_metadata?.role === VIEWER_ROLE
}

// データ（レストラン・レビュアー名）の追加・更新・削除ができるかどうか
// ログインしていて、閲覧用ユーザーでなければ許可する。
// ※ 画面の表示を切り替えるだけなので、実際の制限は Supabase の RLS で行う
export function canEditRestaurants(user: User | null): boolean {
  return user !== null && !isViewer(user)
}
