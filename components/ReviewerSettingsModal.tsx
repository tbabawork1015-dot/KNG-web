'use client'

import { useState, useEffect } from 'react'
import type { ReviewerNames } from '@/lib/useReviewerNames'

interface Props {
  open: boolean
  current: ReviewerNames
  onClose: () => void
  onSave: (names: ReviewerNames) => Promise<void>
}

const KEYS = ['a', 'b', 'c', 'd'] as const
const DEFAULTS = { a: 'Aさん', b: 'Bさん', c: 'Cさん', d: 'Dさん' }

export default function ReviewerSettingsModal({ open, current, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<ReviewerNames>(current)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setDraft(current); setError('') }
  }, [open, current])

  if (!open) return null

  async function handleSave() {
    const saved = Object.fromEntries(
      KEYS.map((k) => [k, draft[k].trim() || DEFAULTS[k]])
    ) as ReviewerNames
    setSaving(true)
    setError('')
    try {
      await onSave(saved)
      onClose()
    } catch {
      setError('保存に失敗しました。再度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full text-sm px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 outline-none focus:border-orange-400 focus:bg-white transition-colors'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5">
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-3 sm:hidden" />
        <h2 className="font-serif text-lg font-bold text-stone-900 mb-1">レビュアー名の設定</h2>
        <p className="text-xs text-stone-400 mb-4">評価者の表示名を変更できます（最大20文字）</p>

        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

        <div className="space-y-3">
          {KEYS.map((k) => (
            <div key={k}>
              <label className="text-xs font-medium text-stone-500 mb-1 block">
                {k.toUpperCase()}さん のラベル
              </label>
              <input
                type="text"
                value={draft[k]}
                onChange={(e) => setDraft((prev) => ({ ...prev, [k]: e.target.value }))}
                placeholder={DEFAULTS[k]}
                maxLength={20}
                className={inputCls}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
            キャンセル
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm rounded-full bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors">
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}
