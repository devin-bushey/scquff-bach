import { useState } from 'react'
import { useLeague } from './lib/data'
import Scoreboard from './views/Scoreboard'
import Games from './views/Games'
import Teams from './views/Teams'

type Tab = 'scoreboard' | 'games' | 'teams'

const TABS: { id: Tab; label: string }[] = [
  { id: 'scoreboard', label: 'Scoreboard' },
  { id: 'games', label: 'Games' },
  { id: 'teams', label: 'Teams' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('scoreboard')
  const league = useLeague()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b-[1.5px] border-rule">
        <div className="mx-auto flex max-w-[940px] items-end justify-between px-6 pt-[18px] pb-3.5">
          <button
            onClick={() => setTab('scoreboard')}
            className="flex items-center gap-[9px] text-[19px] font-black tracking-[-0.01em]"
          >
            <span className="inline-block size-[11px] rounded-full border-[1.5px] border-ink bg-lime" />
            Scquff's Bach
          </button>
          <span className="kicker hidden sm:block">Bachelor Weekend · Kelowna BC</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[940px] flex-1 px-6 pb-32">
        {league.error && (
          <div className="mt-6 border-[1.5px] border-rule p-3 font-mono text-xs">
            Can't reach the database: {league.error}
          </div>
        )}
        {league.loading ? (
          <p className="pt-24 text-center text-lg text-dim italic">Loading the weekend…</p>
        ) : tab === 'scoreboard' ? (
          <Scoreboard league={league} />
        ) : tab === 'games' ? (
          <Games league={league} />
        ) : (
          <Teams league={league} />
        )}
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t-[1.5px] border-rule bg-paper pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-[940px]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex flex-1 justify-center py-2.5 font-mono text-xs tracking-[0.04em]"
            >
              <span
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 transition-colors ${
                  tab === t.id
                    ? 'border-ink bg-lime text-ink shadow-[2px_2px_0_0_#111110]'
                    : 'border-transparent text-dim'
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
