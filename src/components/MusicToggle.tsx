import { useEffect, useRef, useState } from 'react'
import { music } from '../content'

type Props = {
  /** 用户点击封面之后置为 true，此时才允许 play() */
  armed: boolean
}

export function MusicToggle({ armed }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [available, setAvailable] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!armed || !available) return
    const audio = audioRef.current
    if (!audio) return
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }, [armed, available])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={music.src}
        loop
        preload="auto"
        onError={() => setAvailable(false)}
      />
      {available && armed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? '暂停音乐' : '播放音乐'}
          className="fixed top-[max(14px,env(safe-area-inset-top))] right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper/80 backdrop-blur"
        >
          <span
            className="block h-5 w-5 rounded-full border-[3px] border-ink"
            style={{
              background:
                'repeating-radial-gradient(circle, #2b2a27 0 1px, transparent 1px 2.5px)',
              animation: playing ? 'spin 3s linear infinite' : 'none',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </button>
      )}
    </>
  )
}
