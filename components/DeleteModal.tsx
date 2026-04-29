'use client'

interface Props {
  name: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteModal({ name, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
        <h2 className="font-serif text-lg font-bold text-stone-900 mb-2">削除の確認</h2>
        <p className="text-sm text-stone-500 mb-5">
          「{name}」を削除しますか？<br />この操作は取り消せません。
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  )
}