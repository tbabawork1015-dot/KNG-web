'use client'

import { useState } from 'react'
import { AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const MIN_PASSWORD_LENGTH = 8

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || !confirm) {
      setError('新しいパスワードを入力してください')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`)
      return
    }
    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // app_metadata の変更をセッションに反映
      await supabase.auth.refreshSession()
      window.location.href = '/'
    } catch (err) {
      const ja: Record<string, string> = {
        same_password: '仮パスワードとは異なるパスワードを設定してください',
        weak_password: 'パスワードが弱すぎます。より長く複雑なパスワードを設定してください',
        reauthentication_needed: '再ログインが必要です。一度ログアウトしてからやり直してください',
      }
      const code = err instanceof AuthError ? err.code : undefined
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      setError((code && ja[code]) ?? msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
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
          <h2 className="text-base font-semibold text-stone-800 mb-2">パスワードの設定</h2>
          <p className="text-xs text-stone-500 mb-5">
            初回ログインのため、新しいパスワードを設定してください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">
                新しいパスワード（{MIN_PASSWORD_LENGTH}文字以上）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
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
              {loading ? '設定中...' : 'パスワードを設定'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-5">
          <button onClick={handleLogout} className="underline hover:text-stone-600 transition-colors">
            ログアウト
          </button>
        </p>
      </div>
    </div>
  )
}
