// /components/RestaurantCard.tsx
'use client'

import Image from 'next/image'
import type { Restaurant } from '@/types'

interface Props {
  restaurant: Restaurant
  onEdit: (r: Restaurant) => void
  onDelete: (r: Restaurant) => void
}

function avgRating(r: Restaurant): number | null {
  const vals = [r.rating_a, r.rating_b, r.rating_c, r.rating_d].filter(
    (v): v is number => v !== null
  )
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function StarsBar({ avg }: { avg: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xs ${
            i <= avg
              ? 'text-amber-600'
              : i - 0.5 <= avg
              ? 'text-amber-400'
              : 'text-stone-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function RatingBox({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="bg-stone-50 rounded-lg p-1.5 text-center">
      <div className="text-[10px] text-stone-400 mb-0.5">{label}</div>
      {value !== null ? (
        <div className={`text-sm font-bold ${value >= 4 ? 'text-orange-600' : 'text-stone-800'}`}>
          {value.toFixed(1)}
        </div>
      ) : (
        <div className="text-xs text-stone-300">-</div>
      )}
    </div>
  )
}

function MealBadge({ meal }: { meal: string | null }) {
  if (!meal) return null
  const styles: Record<string, string> = {
    ランチ: 'bg-green-50 text-green-700',
    ディナー: 'bg-orange-50 text-orange-700',
    両方: 'bg-stone-100 text-stone-600',
  }
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${styles[meal] ?? 'bg-stone-100 text-stone-600'}`}>
      {meal}
    </span>
  )
}

export default function RestaurantCard({ restaurant: r, onEdit, onDelete }: Props) {
  const avg = avgRating(r)

  return (
    <article className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
      {/* 画像 */}
      {r.image_url ? (
        <div className="relative w-full h-56">
          <Image
            src={r.image_url}
            alt={`${r.name}の写真`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      ) : (
        <div className="w-full h-56 bg-stone-100 flex flex-col items-center justify-center gap-2 text-stone-400">
          <span className="text-4xl opacity-40">🍽</span>
          <span className="text-xs">写真未設定</span>
        </div>
      )}

      {/* 本文 */}
      <div className="p-4">
        {/* 店名 */}
        <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight mb-2">
          {r.name}
        </h2>

        {/* タグ */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {r.station && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              📍 {r.station}
            </span>
          )}
          {r.genre && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              🍴 {r.genre}
            </span>
          )}
          <MealBadge meal={r.meal_type} />
          {r.budget && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              💴 {r.budget}
            </span>
          )}
        </div>

        <div className="h-px bg-stone-100 my-3" />

        {/* 評価 */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          <RatingBox label="A" value={r.rating_a} />
          <RatingBox label="B" value={r.rating_b} />
          <RatingBox label="C" value={r.rating_c} />
          <RatingBox label="D" value={r.rating_d} />
        </div>

        {avg !== null && (
          <div className="flex items-center justify-end gap-2 mb-3">
            <span className="text-[11px] text-stone-400">平均</span>
            <StarsBar avg={avg} />
            <span className="text-base font-bold text-amber-700">{avg.toFixed(1)}</span>
          </div>
        )}

        {/* 詳細 */}
        {(r.visited_at || r.url || r.note) && (
          <>
            <div className="h-px bg-stone-100 my-3" />
            <div className="space-y-1">
              {r.visited_at && (
                <div className="flex gap-2 text-xs">
                  <span className="text-stone-400 w-12 shrink-0">来訪日</span>
                  <span className="text-stone-600">{r.visited_at}</span>
                </div>
              )}
              {r.url && (
                <div className="flex gap-2 text-xs">
                  <span className="text-stone-400 w-12 shrink-0">URL</span>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline"
                  >
                    お店のページ ↗
                  </a>
                </div>
              )}
              {r.note && (
                <div className="flex gap-2 text-xs">
                  <span className="text-stone-400 w-12 shrink-0">補足</span>
                  <span className="text-stone-600 break-all">{r.note}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* アクション */}
        {/* <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-stone-100">
          <button
            onClick={() => onEdit(r)}
            className="text-xs px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
          >
            ✏️ 編集
          </button>
          <button
            onClick={() => onDelete(r)}
            className="text-xs px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
          >
            削除
          </button>
        </div> */}
      </div>
    </article>
  )
}