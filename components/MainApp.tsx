'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Restaurant, RestaurantInsert, FilterState } from '@/types'
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '@/lib/restaurants'
import { createClient } from '@/lib/supabase/client'
import RestaurantCard from '@/components/RestaurantCard'
import RestaurantModal from '@/components/Modal'
import DeleteModal from '@/components/DeleteModal'
import StatsRow from '@/components/StatsRow'

function avgRating(r: Restaurant): number | null {
  const v = [r.rating_a, r.rating_b, r.rating_c, r.rating_d].filter((x): x is number => x !== null)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    genre: '',
    meal_type: '',
    sort: 'date_desc',
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Restaurant | null>(null)
  const [deleting, setDeleting] = useState<Restaurant | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await getRestaurants()
      setRestaurants(data)
      console.log(data);
    } catch {
      setError('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // ここを追加：ログインユーザーのメールを取得
    createClient().auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [load])

  async function handleLogout() {
    await createClient().auth.signOut()  // Supabaseのセッションを破棄
    window.location.href = '/login'      // ログインページへ強制遷移
  }

  const genres = useMemo(
    () => [...new Set(restaurants.map((r) => r.genre).filter(Boolean))] as string[],
    [restaurants]
  )

  const filtered = useMemo(() => {
    let rows = restaurants.filter((r) => {
      const txt = `${r.name}${r.station ?? ''}${r.genre ?? ''}${r.note ?? ''}`.toLowerCase()
      return (
        (!filter.search || txt.includes(filter.search.toLowerCase())) &&
        (!filter.genre || r.genre === filter.genre) &&
        (!filter.meal_type || r.meal_type === filter.meal_type)
      )
    })
    if (filter.sort === 'date_desc') rows.sort((a, b) => (b.visited_at ?? '').localeCompare(a.visited_at ?? ''))
    else if (filter.sort === 'date_asc') rows.sort((a, b) => (a.visited_at ?? '').localeCompare(b.visited_at ?? ''))
    else if (filter.sort === 'rating_desc') rows.sort((a, b) => (avgRating(b) ?? 0) - (avgRating(a) ?? 0))
    else rows.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
    return rows
  }, [restaurants, filter])

  async function handleSave(data: RestaurantInsert) {
    if (editing) {
      const updated = await updateRestaurant(editing.id, data)
      setRestaurants((prev) => prev.map((r) => (r.id === editing.id ? updated : r)))
      showToast('✅ 更新しました')
    } else {
      const created = await createRestaurant(data)
      setRestaurants((prev) => [created, ...prev])
      showToast('✅ 追加しました')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteRestaurant(deleting.id)
    setRestaurants((prev) => prev.filter((r) => r.id !== deleting.id))
    setDeleting(null)
    showToast('🗑 削除しました')
  }

  function f(key: keyof FilterState, val: string) {
    setFilter((prev) => ({ ...prev, [key]: val }))
  }

  const selectCls = 'flex-1 min-w-[120px] text-sm px-3 py-2 rounded-full border border-stone-200 bg-white text-stone-700 outline-none cursor-pointer appearance-none'

  return (
    <div className="min-h-screen bg-stone-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <h1 className="font-serif italic text-2xl text-orange-700 shrink-0">孤独じゃないグルメ</h1>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => { setEditing(null); setModalOpen(true) }}
              className="hidden sm:block px-4 py-2 text-sm rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors shrink-0"
            >
              ＋ 追加
            </button> */}
            {/* ユーザーメニュー */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors text-sm font-medium"
                title={userEmail ?? ''}
              >
                {userEmail ? userEmail[0].toUpperCase() : '?'}
              </button>
              {showUserMenu && (
                <>
                  {/* オーバーレイ */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-11 z-50 bg-white border border-stone-200 rounded-xl shadow-lg py-1 w-56">
                    <div className="px-3 py-2 text-xs text-stone-400 border-b border-stone-100 truncate">
                      {userEmail}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      🚪 ログアウト
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        {/* 検索 & フィルター */}
        <div className="px-4 pt-4 pb-2 space-y-2.5">
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4">
            <span className="text-stone-400 text-base">🔍</span>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => f('search', e.target.value)}
              placeholder="店名・駅・ジャンルで検索..."
              className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none py-2.5"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filter.genre} onChange={(e) => f('genre', e.target.value)} className={selectCls}>
              <option value="">すべてのジャンル</option>
              {genres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={filter.meal_type} onChange={(e) => f('meal_type', e.target.value)} className={selectCls}>
              <option value="">ランチ/ディナー</option>
              <option value="ランチ">ランチ</option>
              <option value="ディナー">ディナー</option>
              <option value="両方">両方</option>
            </select>
            <select value={filter.sort} onChange={(e) => f('sort', e.target.value as FilterState['sort'])} className={selectCls}>
              <option value="date_desc">新しい順</option>
              <option value="date_asc">古い順</option>
              <option value="rating_desc">評価順</option>
              <option value="name">店名順</option>
            </select>
          </div>
        </div>

        {/* 統計 */}
        <div className="py-2">
          <StatsRow restaurants={restaurants} shown={filtered.length} />
        </div>

        {/* カード一覧 */}
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {loading && (
            <div className="col-span-full flex justify-center py-16 text-stone-400 text-sm">
              読み込み中...
            </div>
          )}
          {!loading && error && (
            <div className="col-span-full text-center py-10 text-red-500 text-sm">{error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl opacity-20 mb-3">🍽</div>
              <p className="text-stone-400 text-sm">該当するお店が見つかりません</p>
            </div>
          )}
          {filtered.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onEdit={(r) => { setEditing(r); setModalOpen(true) }}
              onDelete={(r) => setDeleting(r)}
            />
          ))}
        </div>
      </main>

      {/* FAB（スマホ用） */}
      <button
        onClick={() => { setEditing(null); setModalOpen(true) }}
        className="sm:hidden fixed bottom-6 right-5 w-14 h-14 bg-orange-600 text-white text-2xl rounded-full shadow-lg hover:bg-orange-700 active:scale-95 transition-all z-40 flex items-center justify-center"
      >
        ＋
      </button>

      {/* モーダル */}
      <RestaurantModal
        open={modalOpen}
        restaurant={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
      />
      {deleting && (
        <DeleteModal
          name={deleting.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {/* トースト */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg pointer-events-none transition-all duration-300 z-50 whitespace-nowrap
          ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        {toast}
      </div>
    </div>
  )
}