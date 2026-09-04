import { interview } from '../content'
import { Photo } from '../pixel/Photo'
import { Caption, Section } from './Section'

export function Interview() {
  return (
    <Section page="第贰版 · Page 02" title={interview.title}>
      <p className="font-serif text-[12px] leading-relaxed text-ink-soft">{interview.intro}</p>

      <div className="mt-5 space-y-5">
        {interview.qa.map((item, i) => (
          <div key={i}>
            <div className="flex gap-3">
              <span className="font-display text-[22px] leading-none text-accent">Q</span>
              <p className="pt-0.5 font-serif text-[14px] leading-snug font-semibold">{item.q}</p>
            </div>
            <div className="mt-2 flex gap-3">
              <span className="font-display text-[22px] leading-none text-ink-faint">A</span>
              <div className="flex-1">
                <p className="text-justify font-serif text-[13px] leading-[1.9]">{item.a}</p>
                <div className="mt-1 text-right font-mono text-[9px] tracking-[0.25em] text-ink-faint">
                  —— {item.by}
                </div>
              </div>
            </div>
            {i === 1 && interview.photos.length > 0 && (
              <figure className="mt-5 grid grid-cols-2 gap-3">
                {interview.photos.map((src, k) => (
                  <div key={src}>
                    <Photo src={src} size="small" className="border border-rule" />
                    {interview.photoCaptions[k] && <Caption>{interview.photoCaptions[k]}</Caption>}
                  </div>
                ))}
              </figure>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}
