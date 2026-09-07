import { useState } from 'react'
import { journey, type CaptionStyle } from '../content'

export const CAPTION_OPTIONS: { id: CaptionStyle; label: string }[] = [
  { id: 'lcd-bar', label: 'A 机内信息条' },
  { id: 'subtitle', label: 'B 电影字幕' },
  { id: 'cutline', label: 'C 报纸图说' },
  { id: 'print', label: 'D 相纸手记' },
]

const KEY = 'captionStyle'
/** 开发预览，或链接带 ?pick 时，允许在页面上切换样式对比 */
export const isCaptionPreview = import.meta.env.DEV || new URLSearchParams(location.search).has('pick')

export function useCaptionStyle(): [CaptionStyle, (s: CaptionStyle) => void] {
  const [style, setStyle] = useState<CaptionStyle>(() => {
    if (!isCaptionPreview) return journey.captionStyle
    const saved = localStorage.getItem(KEY) as CaptionStyle | null
    return saved && CAPTION_OPTIONS.some((o) => o.id === saved) ? saved : journey.captionStyle
  })
  return [
    style,
    (s) => {
      localStorage.setItem(KEY, s)
      setStyle(s)
    },
  ]
}
