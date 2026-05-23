import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ReviewerNames {
  a: string
  b: string
  c: string
  d: string
}

const DEFAULT_NAMES: ReviewerNames = { a: 'Aさん', b: 'Bさん', c: 'Cさん', d: 'Dさん' }

export function useReviewerNames() {
  const [names, setNames] = useState<ReviewerNames>(DEFAULT_NAMES)
  const [loading, setLoading] = useState(true)

  // Supabase から読み込み
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('reviewer_names')
      .select('name_a, name_b, name_c, name_d')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setNames({ a: data.name_a, b: data.name_b, c: data.name_c, d: data.name_d })
        }
        setLoading(false)
      })
  }, [])

  // Supabase に保存
  const updateNames = useCallback(async (next: ReviewerNames) => {
    setNames(next) // 楽観的更新（即時反映）
    const supabase = createClient()
    const { error } = await supabase
      .from('reviewer_names')
      .upsert({
        id: 1,
        name_a: next.a,
        name_b: next.b,
        name_c: next.c,
        name_d: next.d,
        updated_at: new Date().toISOString(),
      })
    if (error) {
      console.error('レビュアー名の保存に失敗しました:', error)
      throw error
    }
  }, [])

  return { names, loading, updateNames }
}
