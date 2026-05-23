import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ReviewerNames {
  id: string
  label_a: string
  label_b: string
  label_c: string
  label_d: string
}

// 表示用に a/b/c/d のキーに変換したビュー型
export interface ReviewerLabels {
  a: string
  b: string
  c: string
  d: string
}

const DEFAULT_LABELS: ReviewerLabels = {
  a: 'Aさん', b: 'Bさん', c: 'Cさん', d: 'Dさん',
}

export function useReviewerNames() {
  const [record, setRecord] = useState<ReviewerNames | null>(null)
  const [loading, setLoading] = useState(true)

  // DB からレビュアー名を取得
  const load = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reviewer_names')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (!error && data) setRecord(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // DB を更新
  const updateNames = useCallback(async (labels: ReviewerLabels) => {
    if (!record) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reviewer_names')
      .update({
        label_a: labels.a,
        label_b: labels.b,
        label_c: labels.c,
        label_d: labels.d,
      })
      .eq('id', record.id)
      .select()
      .single()

    if (!error && data) setRecord(data)
  }, [record])

  // コンポーネントが使いやすい a/b/c/d 形式に変換
  const names: ReviewerLabels = record
    ? { a: record.label_a, b: record.label_b, c: record.label_c, d: record.label_d }
    : DEFAULT_LABELS

  return { names, loading, updateNames }
}
