'use client'

import { useState, useEffect } from 'react'

// この位置より下までスクロールしたらボタンを表示する
const SHOW_AFTER_PX = 400

// 一番上に戻るボタン（スマホ用・右下）
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="一番上に戻る"
      className={`sm:hidden fixed bottom-7 right-5 w-11 h-11 bg-white/90 text-stone-600 text-lg rounded-full border border-stone-200 shadow-md hover:bg-stone-50 active:scale-95 transition-all z-40 flex items-center justify-center
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      ↑
    </button>
  )
}
