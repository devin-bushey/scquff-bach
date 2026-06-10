import { useState } from 'react'
import { useLeague } from './lib/data'
import Scoreboard from './views/Scoreboard'
import Games from './views/Games'
import Teams from './views/Teams'

type Tab = 'scoreboard' | 'games' | 'teams'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'scoreboard', label: 'Scoreboard', icon: '🏆' },
  { id: 'games', label: 'Games', icon: '🎯' },
  { id: 'teams', label: 'Teams', icon: '👥' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('scoreboard')
  const league = useLeague()

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <main className="flex-1 px-4 pt-6 pb-28">
        {league.error && (
          <div className="mb-4 rounded-lg border border-red-700 bg-red-950 p-3 text-sm text-red-200">
            Can't reach the database: {league.error}
          </div>
        )}
        {league.loading ? (
          <p className="pt-24 text-center text-zinc-400">Loading the weekend…</p>
        ) : tab === 'scoreboard' ? (
          <Scoreboard league={league} />
        ) : tab === 'games' ? (
          <Games league={league} />
        ) : (
          <Teams league={league} />
        )}
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                tab === t.id ? 'text-amber-400' : 'text-zinc-400'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
