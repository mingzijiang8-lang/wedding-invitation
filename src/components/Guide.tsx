import { useState } from 'react'
import { couple, guide, wedding } from '../content'
import { Section } from './Section'

function icsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function buildIcs() {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//wedding//invitation//CN',
    'BEGIN:VEVENT',
    `UID:${wedding.start}@wedding`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(wedding.start)}`,
    `DTEND:${icsDate(wedding.end)}`,
    `SUMMARY:${couple.groom} & ${couple.bride} 婚礼`,
    `LOCATION:${wedding.venue} ${wedding.address}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'))
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

const amapUrl = `https://uri.amap.com/marker?position=${wedding.lng},${wedding.lat}&name=${encodeURIComponent(
  wedding.venue,
)}&src=wedding&coordinate=gaode&callnative=1`

const qqmapUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${wedding.lat},${wedding.lng};title:${encodeURIComponent(
  wedding.venue,
)};addr:${encodeURIComponent(wedding.address)}&referer=wedding`

const btn =
  'flex-1 border border-ink py-2.5 text-center font-serif text-[12px] tracking-[0.2em] active:bg-ink active:text-paper'

export function Guide() {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    const ok = await copyText(`${wedding.venue}，${wedding.address}`)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <Section page="第肆版 · Page 04" title={guide.title}>
      <div className="grid grid-cols-[3.5em_1fr]">
        {guide.sections.map((s, i) => (
          <div key={s.label} className="contents">
            <div className={`rule py-3 pr-3 font-mono text-[10px] tracking-[0.3em] text-ink-faint ${i > 0 ? 'border-t' : ''}`}>
              {s.label}
            </div>
            <div className={`rule py-3 ${i > 0 ? 'border-t' : ''}`}>
              <div className="font-serif text-[14px] leading-snug">{s.value}</div>
              {s.sub && <div className="mt-1 font-serif text-[12px] leading-relaxed text-ink-soft">{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onCopy} className={btn}>
          {copied ? '已复制' : '复制地址'}
        </button>
        <a href={buildIcs()} download="wedding.ics" className={btn}>
          加入日历
        </a>
      </div>
      <div className="mt-2 flex gap-2">
        <a href={amapUrl} target="_blank" rel="noreferrer" className={btn}>
          高德地图
        </a>
        <a href={qqmapUrl} target="_blank" rel="noreferrer" className={btn}>
          腾讯地图
        </a>
      </div>

      <div className="rule mt-5 border-t pt-3 font-mono text-[10px] leading-relaxed tracking-[0.15em] text-ink-faint">
        联络 · 新郎 {wedding.contactGroom} · 新娘 {wedding.contactBride}
      </div>
    </Section>
  )
}
