import { useState } from 'react'
import { clearResult, saveResult } from '../lib/data'
import type { League } from '../lib/data'
import type { Game, GameResult, Team } from '../lib/types'

const PLACE_LABELS = ['1st', '2nd', '3rd']

function pointsLabel(game: Game) {
  return game.kind === 'placement'
    ? `${(game.points as number[]).join(' / ')} pts`
    : `${game.points} pts`
}

function resultSummary(game: Game, result: GameResult, teams: Team[]) {
  const teamName = (id: number | null) => teams.find((t) => t.id === id)?.name ?? '?'
  if (game.kind === 'placement') {
    return (result.placements ?? [])
      .map((id, i) => `${PLACE_LABELS[i]}: ${teamName(id)}`)
      .join('  ·  ')
  }
  const player = result.winner_player ? ` (${result.winner_player})` : ''
  return `Winner: ${teamName(result.winner_team_id)}${player}`
}

function TeamButton({
  team,
  selected,
  onClick,
}: {
  team: Team
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 truncate rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
        selected
          ? 'border-transparent text-zinc-950'
          : 'border-zinc-700 bg-zinc-800 text-zinc-300'
      }`}
      style={selected ? { backgroundColor: team.color } : undefined}
    >
      {team.name}
    </button>
  )
}

function ResultForm({
  game,
  teams,
  result,
  onDone,
  refresh,
}: {
  game: Game
  teams: Team[]
  result: GameResult | undefined
  onDone: () => void
  refresh: () => Promise<void>
}) {
  const [placements, setPlacements] = useState<(number | null)[]>(
    result?.placements ?? [null, null, null],
  )
  const [winnerTeam, setWinnerTeam] = useState<number | null>(result?.winner_team_id ?? null)
  const [winnerPlayer, setWinnerPlayer] = useState(result?.winner_player ?? '')
  const [busy, setBusy] = useState(false)

  const isPlacement = game.kind === 'placement'
  const canSave = isPlacement
    ? placements.every((p) => p != null)
    : winnerTeam != null

  function pick(place: number, teamId: number) {
    setPlacements((prev) =>
      prev.map((p, i) => (i === place ? teamId : p === teamId ? null : p)),
    )
  }

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
      await refresh()
      onDone()
    } catch (e) {
      alert(`Save failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 space-y-3 border-t border-zinc-800 pt-3">
      {isPlacement ? (
        PLACE_LABELS.map((label, place) => (
          <div key={label}>
            <p className="mb-1 text-xs font-semibold text-zinc-400">
              {label} — {(game.points as number[])[place]} pts
            </p>
            <div className="flex gap-2">
              {teams.map((t) => (
                <TeamButton
                  key={t.id}
                  team={t}
                  selected={placements[place] === t.id}
                  onClick={() => pick(place, t.id)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <>
          <div>
            <p className="mb-1 text-xs font-semibold text-zinc-400">
              Winning team — {game.points as number} pts
            </p>
            <div className="flex gap-2">
              {teams.map((t) => (
                <TeamButton
                  key={t.id}
                  team={t}
                  selected={winnerTeam === t.id}
                  onClick={() => setWinnerTeam(t.id)}
                />
              ))}
            </div>
          </div>
          <input
            value={winnerPlayer}
            onChange={(e) => setWinnerPlayer(e.target.value)}
            placeholder="Who hit it? (optional)"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
          />
        </>
      )}

      <div className="flex gap-2 pt-1">
        <button
          disabled={!canSave || busy}
          onClick={() =>
            run(() =>
              isPlacement
                ? saveResult(game.id, { placements: placements as number[] })
                : saveResult(game.id, {
                    winner_team_id: winnerTeam!,
                    winner_player: winnerPlayer.trim() || null,
                  }),
            )
          }
          className="flex-1 rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-40"
        >
          {busy ? 'Saving…' : 'Save result'}
        </button>
        {result && (
          <button
            disabled={busy}
            onClick={() => run(() => clearResult(game.id))}
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 disabled:opacity-40"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default function Games({ league }: { league: League }) {
  const { games, teams, results, refresh } = league
  const [openId, setOpenId] = useState<number | null>(null)

  const renderSection = (title: string, list: Game[]) => (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
        {title}
      </h2>
      <div className="space-y-2">
        {list.map((game) => {
          const result = results.find((r) => r.game_id === game.id)
          const open = openId === game.id
          return (
            <div key={game.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <button
                onClick={() => setOpenId(open ? null : game.id)}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <div className="min-w-0">
                  <p className="font-bold">{game.name}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    {result ? resultSummary(game, result, teams) : 'Not played yet'}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                  {result ? '✅' : pointsLabel(game)}
                </span>
              </button>
              {open && (
                <ResultForm
                  game={game}
                  teams={teams}
                  result={result}
                  onDone={() => setOpenId(null)}
                  refresh={refresh}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )

  return (
    <div>
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-tight">GAMES</h1>
        <p className="mt-1 text-sm text-zinc-400">Tap a game to enter or edit its result</p>
      </header>
      {renderSection('Mini Games', games.filter((g) => g.category === 'mini'))}
      {renderSection('Golf ⛳ (Main Event)', games.filter((g) => g.category === 'golf'))}
    </div>
  )
}
