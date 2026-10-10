import type { User } from '@supabase/supabase-js'

// レストランの追加・削除ができるかどうか
// 現在はログインしているユーザー全員に許可する。
// 制限ユーザーを作るときは、管理者だけが変更できる app_metadata（例: role: 'viewer'）で判定する想定。
// ※ 画面の表示を切り替えるだけなので、実際の制限は Supabase の RLS でも行う必要がある
export function canEditRestaurants(user: User | null): boolean {
  return user !== null
}
