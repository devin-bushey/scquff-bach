import { computeStandings } from '../lib/data'
import type { League } from '../lib/data'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Scoreboard({ league }: { league: League }) {
  const { teams, games, results } = league
  const { totals, byGame, ranked } = computeStandings(teams, games, results)
  const leaderPts = ranked.length ? (totals.get(ranked[0].id) ?? 0) : 0

  return (
    <div>
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-black tracking-tight">SCQUFF BACH</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {results.length} of {games.length} events played
        </p>
      </header>

      <div className="space-y-3">
        {ranked.map((team, i) => {
          const pts = totals.get(team.id) ?? 0
          return (
            <div
              key={team.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              style={{ borderLeft: `5px solid ${team.color}` }}
            >
              <span className="text-3xl">{MEDALS[i] ?? '🏅'}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold">{team.name}</p>
                <p className="truncate text-xs text-zinc-400">
                  {team.players.filter(Boolean).join(' · ') || 'No players yet'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black tabular-nums">{pts}</p>
                <p className="text-xs text-zinc-500">
                  {i === 0 ? (results.length ? 'leading' : '—') : `-${leaderPts - pts}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
        Breakdown
      </h2>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900 text-zinc-400">
              <th className="px-3 py-2 text-left font-medium">Event</th>
              {teams.map((t) => (
                <th
                  key={t.id}
                  className="px-2 py-2 text-center font-medium"
                  style={{ color: t.color }}
                >
                  {t.name.length > 8 ? `${t.name.slice(0, 7)}…` : t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              const pts = byGame.get(game.id)
              return (
                <tr key={game.id} className="border-t border-zinc-800">
                  <td className="px-3 py-2 text-zinc-300">{game.name}</td>
                  {teams.map((t) => (
                    <td key={t.id} className="px-2 py-2 text-center tabular-nums">
                      {pts ? (
                        pts.has(t.id) ? (
                          <span className="font-semibold text-zinc-100">{pts.get(t.id)}</span>
                        ) : (
                          <span className="text-zinc-500">0</span>
                        )
                      ) : (
                        <span className="text-zinc-600">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
