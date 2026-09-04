import { useEffect, useRef, useState } from 'react'
import { nearest } from './palette'

type Props = {
  src: string
  /** 横向像素数，越小越"像素" */
  cols?: number
  alt?: string
  className?: string
  /** 点击在像素版和原图之间切换 */
  tapToReveal?: boolean
}

/**
 * 运行时把任意照片降采样并量化到调色板，再以 pixelated 方式放大。
 * 用户只需把原图丢进 public/photos，不需要预处理。
 */
export function PixelImage({ src, cols = 72, alt = '', className = '', tapToReveal = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ratio, setRatio] = useState(4 / 3)
  const [ready, setReady] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    let cancelled = false
    img.onload = () => {
      if (cancelled || !canvasRef.current) return
      const rows = Math.max(1, Math.round((cols * img.naturalHeight) / img.naturalWidth))
      setRatio(img.naturalWidth / img.naturalHeight)

      const canvas = canvasRef.current
      canvas.width = cols
      canvas.height = rows
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(img, 0, 0, cols, rows)

      const data = ctx.getImageData(0, 0, cols, rows)
      const px = data.data
      for (let i = 0; i < px.length; i += 4) {
        // 先轻微降饱和，再量化，避免照片里的高饱和色跳出来
        const r = px[i]
        const g = px[i + 1]
        const b = px[i + 2]
        const l = 0.3 * r + 0.59 * g + 0.11 * b
        const k = 0.65
        const [nr, ng, nb] = nearest(l + (r - l) * k, l + (g - l) * k, l + (b - l) * k)
        px[i] = nr
        px[i + 1] = ng
        px[i + 2] = nb
      }
      ctx.putImageData(data, 0, 0)
      setReady(true)
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src, cols])

  return (
    <div
      className={`relative overflow-hidden bg-paper-deep ${tapToReveal ? 'cursor-pointer' : ''} ${className}`}
      style={{ aspectRatio: String(ratio) }}
      onClick={tapToReveal ? () => setRevealed((v) => !v) : undefined}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className={`pixelated block h-full w-full transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      {tapToReveal && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}
          draggable={false}
        />
      )}
      {tapToReveal && ready && (
        <span className="absolute right-1 bottom-1 bg-paper/85 px-1 py-px font-mono text-[8px] tracking-[0.15em] text-ink-soft">
          {revealed ? '像素' : '原图'}
        </span>
      )}
    </div>
  )
}
