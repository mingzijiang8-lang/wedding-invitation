import { useEffect, useState } from 'react'
import { frameSrc, WALK_FPS, type Pose, type Who } from './characters'

type Props = {
  who: Who
  pose?: Pose
  /** 显示高度（CSS px） */
  height: number
  flip?: boolean
  className?: string
  style?: React.CSSProperties
}

/** 页面里（非 canvas）显示的角色，walk 姿态会自动循环四帧 */
export function Character({ who, pose = 'idle', height, flip = false, className = '', style }: Props) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (pose !== 'walk') return
    const id = window.setInterval(() => setFrame((f) => (f + 1) % 4), 1000 / WALK_FPS)
    return () => window.clearInterval(id)
  }, [pose])

  const src = pose === 'walk' ? frameSrc(who, 'walk', frame) : frameSrc(who, pose)

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={`block select-none ${className}`}
      style={{ height, width: 'auto', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    />
  )
}

/** 新郎新娘并排站立 */
export function Couple({ height, pose = 'idle', className = '' }: { height: number; pose?: Pose; className?: string }) {
  return (
    <div className={`flex items-end gap-1 ${className}`}>
      <Character who="groom" pose={pose} height={height} style={{ animation: 'breathe 3.4s ease-in-out infinite' }} />
      <Character
        who="bride"
        pose={pose}
        height={height * 0.94}
        style={{ animation: 'breathe 3.4s ease-in-out infinite', animationDelay: '0.8s' }}
      />
    </div>
  )
}
