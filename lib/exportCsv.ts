import type { Restaurant } from '@/types'
import type { ReviewerLabels } from '@/lib/useReviewerNames'

// Google スプレッドシート「孤独じゃないグルメ記録帳」と同じレイアウトで出力する
// A 列は空、B1 にタイトル、2〜3 行目は空行、4 行目に見出し、5 行目からデータ
const TITLE = '孤独じゃないグルメ記録帳'
const BLANK_ROWS_AFTER_TITLE = 2

// 来訪日 'YYYY-MM-DD' → 'YYYY/M'（シートと同じ年/月の形式）
function formatVisited(v: string | null): string {
  if (!v) return ''
  const m = v.match(/^(\d{4})-(\d{2})/)
  return m ? `${m[1]}/${Number(m[2])}` : v
}

// 評価 4 → '★★★★'、3.5 → '★★★ (3.5)'
function formatRating(v: number | null): string {
  if (v === null) return ''
  const stars = '★'.repeat(Math.floor(v))
  return Number.isInteger(v) ? stars : `${stars} (${v})`
}

// 表計算ソフトで数式として解釈されないようにする（CSV インジェクション対策）
function escapeCell(value: string): string {
  const v = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

function toRow(cells: string[]): string {
  return ['', ...cells].map(escapeCell).join(',')
}

export function buildRestaurantsCsv(restaurants: Restaurant[], names: ReviewerLabels): string {
  const header = [
    '来訪日', '店名', '最寄り駅', 'ざっくりジャンル', 'ランチ/ディナー', 'ざっくり予算',
    `${names.a}評価`, `${names.b}評価`, `${names.c}評価`, `${names.d}評価`,
    'お店URL', '補足',
  ]

  // シートと同じく来訪日の古い順（来訪日なしは最後）
  const sorted = [...restaurants].sort((a, b) => {
    if (!a.visited_at) return b.visited_at ? 1 : 0
    if (!b.visited_at) return -1
    return a.visited_at.localeCompare(b.visited_at)
  })

  const rows = sorted.map((r) => toRow([
    formatVisited(r.visited_at),
    r.name,
    r.station ?? '',
    r.genre ?? '',
    r.meal_type ?? '',
    r.budget ?? '',
    formatRating(r.rating_a),
    formatRating(r.rating_b),
    formatRating(r.rating_c),
    formatRating(r.rating_d),
    r.url ?? '',
    r.note ?? '',
  ]))

  return [
    toRow([TITLE]),
    ...Array.from({ length: BLANK_ROWS_AFTER_TITLE }, () => toRow([])),
    toRow(header),
    ...rows,
  ].join('\r\n')
}

// CSV をファイルとしてダウンロードさせる
// Excel で文字化けしないよう UTF-8 の BOM を付ける
export function downloadCsv(fileName: string, csv: string) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
