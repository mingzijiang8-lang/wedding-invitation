import { closing, paper } from '../content'
import { Couple } from '../pixel/Character'
import { Section } from './Section'

type Props = { edition: number }

export function Closing({ edition }: Props) {
  return (
    <Section page="末版 · Last Page" title={closing.title} className="pb-[max(40px,env(safe-area-inset-bottom))]">
      <div className="space-y-4">
        {closing.body.map((p, i) => (
          <p key={i} className={`text-justify font-serif text-[13px] leading-[1.95] ${i === 0 ? 'dropcap' : ''}`}>
            {p}
          </p>
        ))}
      </div>
      <div className="mt-6 flex items-end justify-between">
        <Couple height={80} pose="raise" />
        <div className="text-right">
          <div className="font-serif text-[15px] tracking-[0.2em]">{closing.sign}</div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.3em] text-ink-faint">敬上</div>
        </div>
      </div>

      <div className="mt-8 border border-ink p-4">
        <div className="font-mono text-[10px] tracking-[0.3em] text-accent">{closing.replyTitle}</div>
        <p className="mt-2 font-serif text-[13px] leading-relaxed">{closing.replyText}</p>
      </div>

      <footer className="rule-double mt-10 pt-3 text-center font-mono text-[9px] leading-loose tracking-[0.2em] text-ink-faint">
        <div>{paper.footer}</div>
        <div>
          {paper.nameEn} · NO. {String(edition).padStart(3, '0')}
        </div>
      </footer>
    </Section>
  )
}
