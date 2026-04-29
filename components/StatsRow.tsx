import type { Restaurant } from '@/types'

function avg(r: Restaurant) {
  const v = [r.rating_a, r.rating_b, r.rating_c, r.rating_d].filter((x): x is number => x !== null)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

export default function StatsRow({ restaurants, shown }: { restaurants: Restaurant[]; shown: number }) {
  const total = restaurants.length
  const genres = new Set(restaurants.map((r) => r.genre).filter(Boolean)).size
  const stations = new Set(restaurants.map((r) => r.station).filter(Boolean)).size
  const avgs = restaurants.map(avg).filter((v): v is number => v !== null)
  const overall = avgs.length ? (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1) : '-'

  const chips = [
    { n: total, l: '総来訪件数' },
    { n: genres, l: 'ジャンル数' },
    { n: stations, l: 'エリア数' },
    { n: overall, l: '平均評価' },
    { n: shown, l: '表示中' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none px-4 sm:px-0">
      {chips.map((c) => (
        <div key={c.l} className="shrink-0 bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-center min-w-[80px]">
          <div className="text-xl font-bold text-orange-600">{c.n}</div>
          <div className="text-[11px] text-stone-400 mt-0.5 whitespace-nowrap">{c.l}</div>
        </div>
      ))}
    </div>
  )
}