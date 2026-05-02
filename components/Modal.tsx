'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Restaurant, RestaurantInsert } from '@/types'
import { uploadImage, deleteImage } from '@/lib/restaurants'
import { compressImage, formatFileSize } from '@/lib/imageUtils'

interface Props {
  open: boolean
  restaurant?: Restaurant | null
  onClose: () => void
  onSave: (data: RestaurantInsert) => Promise<void>
}

const EMPTY: RestaurantInsert = {
  visited_at: null,
  name: '',
  station: null,
  genre: null,
  meal_type: null,
  budget: null,
  rating_a: null,
  rating_b: null,
  rating_c: null,
  rating_d: null,
  url: null,
  note: null,
  image_url: null,
}

export default function RestaurantModal({ open, restaurant, onClose, onSave }: Props) {
  const [form, setForm] = useState<RestaurantInsert>(EMPTY)
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [imgInfo, setImgInfo] = useState<{ before: string; after: string } | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (restaurant) {
        setForm({
          visited_at: restaurant.visited_at,
          name: restaurant.name,
          station: restaurant.station,
          genre: restaurant.genre,
          meal_type: restaurant.meal_type,
          budget: restaurant.budget,
          rating_a: restaurant.rating_a,
          rating_b: restaurant.rating_b,
          rating_c: restaurant.rating_c,
          rating_d: restaurant.rating_d,
          url: restaurant.url,
          note: restaurant.note,
          image_url: restaurant.image_url,
        })
        setImgPreview(restaurant.image_url)
      } else {
        setForm(EMPTY)
        setImgPreview(null)
      }
      setImgFile(null)
      setImgInfo(null)
      setError('')
    }
  }, [open, restaurant])

  function set<K extends keyof RestaurantInsert>(key: K, value: RestaurantInsert[K]) {
    setForm((f) => ({ ...f, [key]: value || null }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setCompressing(true)
    setImgInfo(null)
    setError('')

    try {
      const beforeSize = formatFileSize(file.size)

      // アップロード前に圧縮（最大1280px・WebP変換）
      const compressed = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.82,
      })

      const afterSize = formatFileSize(compressed.size)
      setImgInfo({ before: beforeSize, after: afterSize })
      setImgFile(compressed)
      setImgPreview(URL.createObjectURL(compressed))
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像の処理に失敗しました')
    } finally {
      setCompressing(false)
    }
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError('店名は必須です'); return }
    setSaving(true)
    setError('')
    try {
      let image_url = form.image_url

      if (imgFile) {
        // 古い画像を削除
        if (restaurant?.image_url) await deleteImage(restaurant.image_url)
        image_url = await uploadImage(imgFile)
      }

      await onSave({ ...form, image_url })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-5">
        {/* ハンドル（スマホ） */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-3 sm:hidden" />

        <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">
          {restaurant ? 'お店を編集' : 'お店を追加'}
        </h2>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}

        {/* 写真 */}
        <div className="mb-4">
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">写真</label>
          {compressing ? (
            <div className="w-full h-24 border-2 border-dashed border-orange-300 rounded-xl flex items-center justify-center gap-2 text-orange-500 text-sm bg-orange-50">
              <span className="animate-spin text-lg">⏳</span>
              <span>圧縮中...</span>
            </div>
          ) : imgPreview ? (
            <div>
              <div className="relative w-full h-44 rounded-xl overflow-hidden mb-2">
                <Image src={imgPreview} alt="プレビュー" fill className="object-cover" />
                <button
                  onClick={() => {
                    setImgPreview(null)
                    setImgFile(null)
                    setImgInfo(null)
                    set('image_url', null)
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/70"
                >
                  削除
                </button>
              </div>
              {/* 圧縮前後のサイズ表示 */}
              {imgInfo && (
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 px-1">
                  <span>📦 圧縮:</span>
                  <span className="line-through text-stone-300">{imgInfo.before}</span>
                  <span>→</span>
                  <span className="text-green-600 font-medium">{imgInfo.after}</span>
                  <span className="text-green-500">✓ WebP変換済み</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center gap-2 text-stone-400 text-sm hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
            >
              <span className="text-xl">📷</span>
              <span>タップして写真を追加</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* 店名 */}
        <Field label="店名 *">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="例: 鮨 〇〇"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="来訪日">
            <input
              type="date"
              value={form.visited_at ?? ''}
              onChange={(e) => set('visited_at', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="ランチ/ディナー">
            <select value={form.meal_type ?? ''} onChange={(e) => set('meal_type', e.target.value as any)} className={inputCls}>
              <option value="">-</option>
              <option value="ランチ">ランチ</option>
              <option value="ディナー">ディナー</option>
              <option value="両方">両方</option>
            </select>
          </Field>
          <Field label="最寄り駅">
            <input type="text" value={form.station ?? ''} onChange={(e) => set('station', e.target.value)} placeholder="例: 銀座" className={inputCls} />
          </Field>
          <Field label="ジャンル">
            <input type="text" value={form.genre ?? ''} onChange={(e) => set('genre', e.target.value)} placeholder="例: 和食" className={inputCls} />
          </Field>
        </div>

        <Field label="予算">
          <input type="text" value={form.budget ?? ''} onChange={(e) => set('budget', e.target.value)} placeholder="例: ~3,000円" className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {(['a', 'b', 'c', 'd'] as const).map((p) => {
            const key = `rating_${p}` as keyof RestaurantInsert
            return (
              <Field key={p} label={`${p.toUpperCase()}さん評価 (1〜5)`}>
                <input
                  type="number" min="1" max="5" step="0.5"
                  value={(form[key] as number | null) ?? ''}
                  onChange={(e) => set(key, e.target.value ? Number(e.target.value) : null)}
                  placeholder="-"
                  className={inputCls}
                />
              </Field>
            )
          })}
        </div>

        <Field label="お店URL">
          <input type="url" value={form.url ?? ''} onChange={(e) => set('url', e.target.value)} placeholder="https://..." className={inputCls} />
        </Field>

        <Field label="補足">
          <textarea
            value={form.note ?? ''}
            onChange={(e) => set('note', e.target.value)}
            placeholder="自由記述..."
            rows={3}
            className={`${inputCls} resize-y`}
          />
        </Field>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || compressing}
            className="px-5 py-2 text-sm rounded-full bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {saving ? '保存中...' : compressing ? '圧縮中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 outline-none focus:border-orange-400 focus:bg-white transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-stone-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}
