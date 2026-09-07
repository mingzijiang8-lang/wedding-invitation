import { photoStyle } from '../content'
import { Couple } from './Character'
import { PixelImage } from './PixelImage'

type Props = {
  src?: string
  size?: 'large' | 'small'
  alt?: string
  className?: string
  /** 占位框的宽高比，默认大图 4/5、小图 4/3 */
  ratio?: string
}

/**
 * 统一的照片入口：没有路径时显示像素当事人占位，
 * 有路径时按 content.ts 里的 photoStyle 决定像素化还是原图。
 */
export function Photo({ src, size = 'large', alt = '', className = '', ratio }: Props) {
  if (!src) {
    return (
      <div
        className={`relative flex items-end justify-center overflow-hidden border border-dashed border-rule bg-paper-deep ${className}`}
        style={{ aspectRatio: ratio ?? (size === 'large' ? '4 / 5' : '4 / 3') }}
      >
        <div className="absolute inset-x-0 bottom-[22%] h-px bg-rule" />
        <Couple height={size === 'large' ? 150 : 64} className="relative mb-[14%]" />
        <span className="absolute top-2 right-2 font-mono text-[8px] tracking-[0.2em] text-ink-faint">
          照片位
        </span>
      </div>
    )
  }

  if (!photoStyle.pixelate) {
    return <img src={src} alt={alt} className={`block max-w-full ${className}`} draggable={false} />
  }

  return (
    <PixelImage
      src={src}
      alt={alt}
      cols={size === 'large' ? photoStyle.colsLarge : photoStyle.colsSmall}
      tapToReveal
      className={className}
    />
  )
}
