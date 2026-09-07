import { useState } from 'react'
import type { CaptionStyle } from '../content'
import { CAPTION_OPTIONS, isCaptionPreview } from './captionStyle'

/** 只在开发预览（或链接带 ?pick）时出现的小面板：切换照片配文的四种样式，定了就把选中的写进 content.ts 的 journey.captionStyle */
export function CaptionStylePicker({ value, onChange }: { value: CaptionStyle; onChange: (s: CaptionStyle) => void }) {
  const [open, setOpen] = useState(true)
  if (!isCaptionPreview) return null
  return (
    <div className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 z-40 font-mono text-[9px] tracking-[0.1em]">
      {open ? (
        <div className="flex flex-col gap-1 border border-ink bg-paper/95 p-1.5 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between px-1 text-ink-faint">
            <span>配文样式</span>
            <button type="button" onClick={() => setOpen(false)} className="px-1">
              ✕
            </button>
          </div>
          {CAPTION_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`px-2 py-1 text-left ${o.id === value ? 'bg-ink text-paper' : 'text-ink'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="border border-ink bg-paper/95 px-2 py-1 backdrop-blur">
          配文 {CAPTION_OPTIONS.find((o) => o.id === value)?.label.slice(0, 1)}
        </button>
      )}
    </div>
  )
}
