'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = '/'
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      const ja: Record<string, string> = {
        'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
        'Email not confirmed': 'メールアドレスの確認が完了していません',
      }
      setError(ja[msg] ?? msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full text-sm px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 outline-none focus:border-orange-400 focus:bg-white transition-colors placeholder:text-stone-400'

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <h1 className="font-serif italic text-4xl text-orange-700 mb-1">孤独じゃないグルメ</h1>
          <p className="text-sm text-stone-400">来訪レストラン記録アプリ</p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-base font-semibold text-stone-800 mb-5">ログイン</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
                autoComplete="email"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm rounded-xl px-3 py-2.5 bg-red-50 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-medium rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors mt-1"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-5">
          アカウントをお持ちでない方は管理者にお問い合わせください
        </p>
      </div>
    </div>
  )
}
