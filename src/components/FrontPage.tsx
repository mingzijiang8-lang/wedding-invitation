import { couple, frontPage, wedding } from '../content'
import { Couple } from '../pixel/Character'
import { Photo } from '../pixel/Photo'
import { Caption, Rule } from './Section'

export function FrontPage() {
  return (
    <section className="px-5 pt-6">
      <div className="font-mono text-[10px] tracking-[0.3em] text-accent">{frontPage.kicker}</div>
      <h2 className="mt-2 font-serif text-[34px] leading-[1.15] font-semibold tracking-[0.02em]">
        {frontPage.headline}
      </h2>
      <p className="mt-3 font-serif text-[14px] leading-relaxed text-ink-soft">{frontPage.subhead}</p>

      <Rule className="my-4" />

      <div className="flex gap-4">
        <p className="dropcap flex-1 text-justify font-serif text-[13px] leading-[1.9] text-ink">
          {frontPage.deck}
        </p>
        <div className="flex shrink-0 flex-col items-center justify-end gap-1 pb-1">
          <Couple height={72} />
          <span className="font-mono text-[8px] tracking-[0.2em] text-ink-faint">当事人</span>
        </div>
      </div>

      <figure className="mt-5">
        <Photo src={frontPage.photo} size="large" alt="婚纱照" className="w-full border border-rule" />
        <Caption>{frontPage.photoCaption}</Caption>
      </figure>

      <div className="rule mt-6 grid grid-cols-3 border-t border-b py-3 text-center">
        <div>
          <div className="font-mono text-[9px] tracking-[0.25em] text-ink-faint">新郎</div>
          <div className="mt-1 font-serif text-[16px] tracking-[0.2em]">{couple.groom}</div>
        </div>
        <div className="rule border-l border-r">
          <div className="font-mono text-[9px] tracking-[0.25em] text-ink-faint">日期</div>
          <div className="mt-1 font-serif text-[13px] leading-snug">
            {wedding.dateLabel.replace('年', '年\n').split('\n').map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.25em] text-ink-faint">新娘</div>
          <div className="mt-1 font-serif text-[16px] tracking-[0.2em]">{couple.bride}</div>
        </div>
      </div>
    </section>
  )
}
