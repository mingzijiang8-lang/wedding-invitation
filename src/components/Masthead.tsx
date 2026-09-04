import { paper, wedding } from '../content'

type Props = {
  edition: number
  compact?: boolean
}

function daysUntil(iso: string) {
  const target = new Date(iso).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / 86400000)
}

export function Masthead({ edition, compact = false }: Props) {
  const days = daysUntil(wedding.start)
  const countdown =
    days > 0 ? `距婚礼尚有 ${days} 日` : days === 0 ? '今日举行' : `婚礼已举行 ${-days} 日`

  return (
    <div className="px-5">
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-ink-faint">
        <span>{paper.volume}</span>
        <span>NO. {String(edition).padStart(3, '0')}</span>
      </div>
      <div className="rule mt-1 border-t border-b py-3 text-center">
        <h1
          className={`font-display leading-none tracking-[0.18em] ${compact ? 'text-[36px]' : 'text-[52px]'}`}
        >
          {paper.name}
        </h1>
        <div className="mt-2 font-display text-[10px] tracking-[0.45em] text-ink-soft">
          {paper.nameEn}
        </div>
      </div>
      <div className="flex items-center justify-between py-1.5 font-mono text-[10px] tracking-[0.15em] text-ink-soft">
        <span>{wedding.dateLabel}</span>
        <span>
          {wedding.city} · {paper.weather}
        </span>
        <span>{countdown}</span>
      </div>
      <div className="rule border-t" />
    </div>
  )
}
