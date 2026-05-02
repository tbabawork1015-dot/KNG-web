/**
 * 画像圧縮・展開ユーティリティ
 *
 * アップロード前: File → Canvas でリサイズ → WebP に変換して圧縮
 * 表示前:        Supabase URL はそのまま Next.js Image が最適化
 *                Base64 の場合は decompress で Blob URL に展開
 */

/** 圧縮オプション */
export interface CompressOptions {
  maxWidth?: number   // 最大幅 px（デフォルト 1280）
  maxHeight?: number  // 最大高 px（デフォルト 1280）
  quality?: number    // 圧縮品質 0〜1（デフォルト 0.82）
  mimeType?: string   // 出力形式（デフォルト image/webp）
}

/**
 * アップロード前の画像圧縮
 * File を受け取り、リサイズ＋WebP変換した新しい File を返す
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options

  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // アスペクト比を保ちながらリサイズ
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas context unavailable')); return }

      // 背景を白で塗りつぶし（PNG透過 → WebP変換時の対策）
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('圧縮に失敗しました')); return }

          // 拡張子を .webp に変更
          const baseName = file.name.replace(/\.[^.]+$/, '')
          const compressed = new File([blob], `${baseName}.webp`, {
            type: mimeType,
            lastModified: Date.now(),
          })

          console.log(
            `[画像圧縮] ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB` +
            ` (${width}×${height}px)`
          )

          resolve(compressed)
        },
        mimeType,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('画像の読み込みに失敗しました'))
    }

    img.src = objectUrl
  })
}

/**
 * 表示前の展開（Base64 → Blob URL）
 * Supabase Storage の URL はそのまま返す（Next.js Image が最適化するため不要）
 */
export function decompressImageUrl(src: string | null): string | null {
  if (!src) return null

  // Supabase URL / 通常の https URL はそのまま返す
  if (src.startsWith('http')) return src

  // Base64 の場合は Blob URL に変換して返す
  // （localStorageから移行したデータへの後方互換対応）
  if (src.startsWith('data:')) {
    try {
      const [meta, base64] = src.split(',')
      const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
      const binary = atob(base64)
      const array = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([array], { type: mime })
      return URL.createObjectURL(blob)
    } catch {
      return src // 変換失敗時はそのまま返す
    }
  }

  return src
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
