import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Closing } from './components/Closing'
import { Cover } from './components/Cover'
import { FrontPage } from './components/FrontPage'
import { Guide } from './components/Guide'
import { Interview } from './components/Interview'
import { JourneyMap } from './components/JourneyMap'
import { Masthead } from './components/Masthead'
import { MusicToggle } from './components/MusicToggle'

// 每次打开随机一个"限量编号"，让每位宾客拿到的都不一样
const edition = 1 + Math.floor(Math.random() * 999)

export default function App() {
  const [opened, setOpened] = useState(false)

  return (
    <div className="paper-grain mx-auto min-h-dvh max-w-[480px]">
      <AnimatePresence>{!opened && <Cover edition={edition} onOpen={() => setOpened(true)} />}</AnimatePresence>

      <MusicToggle armed={opened} />

      <main className={`pt-[max(16px,env(safe-area-inset-top))] ${opened ? '' : 'h-dvh overflow-hidden'}`}>
        <Masthead edition={edition} compact />
        <FrontPage />
        <Interview />
        <JourneyMap />
        <Guide />
        <Closing edition={edition} />
      </main>
    </div>
  )
}
