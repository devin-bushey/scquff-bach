import { useState } from 'react'
import { updateTeam } from '../lib/data'
import type { League } from '../lib/data'
import type { Team } from '../lib/types'

const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#ec4899', '#14b8a6', '#f97316']

function TeamCard({ team, refresh }: { team: Team; refresh: () => Promise<void> }) {
  const [name, setName] = useState(team.name)
  const [color, setColor] = useState(team.color)
  const [players, setPlayers] = useState<string[]>(
    Array.from({ length: 4 }, (_, i) => team.players[i] ?? ''),
  )
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    try {
      await updateTeam(team.id, {
        name: name.trim() || team.name,
        color,
        players: players.map((p) => p.trim()).filter(Boolean),
      })
      await refresh()
    } catch (e) {
      alert(`Save failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
      style={{ borderLeft: `5px solid ${color}` }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base font-bold"
        placeholder="Team name"
      />
      <div className="mt-3 flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`h-7 w-7 rounded-full ${color === c ? 'ring-2 ring-white' : ''}`}
            style={{ backgroundColor: c }}
            aria-label={`Pick color ${c}`}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {players.map((p, i) => (
          <input
            key={i}
            value={p}
            onChange={(e) =>
              setPlayers((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
            }
            placeholder={`Player ${i + 1}`}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
          />
        ))}
      </div>
      <button
        disabled={busy}
        onClick={save}
        className="mt-3 w-full rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-40"
      >
        {busy ? 'Saving…' : 'Save team'}
      </button>
    </div>
  )
}

export default function Teams({ league }: { league: League }) {
  return (
    <div>
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-tight">TEAMS</h1>
        <p className="mt-1 text-sm text-zinc-400">Name your squads and assign the 12 degenerates</p>
      </header>
      <div className="space-y-4">
        {league.teams.map((team) => (
          <TeamCard key={team.id} team={team} refresh={league.refresh} />
        ))}
      </div>
    </div>
  )
}
