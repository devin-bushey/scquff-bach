import { useState } from 'react'
import { clearResult, decidedMatches, isGameComplete, matchupPairs, saveResult } from '../lib/data'
import type { League } from '../lib/data'
import type { Game, GameResult, Team } from '../lib/types'
import Lede from '../components/Lede'

const PLACE_LABELS = ['1st', '2nd', '3rd']

function pointsLabel(game: Game) {
  if (game.kind === 'placement') return `${(game.points as number[]).join(' / ')} pts`
  if (game.kind === 'matchup') return `${game.points} pts/win`
  return `${game.points} pts`
}

function resultSummary(game: Game, result: GameResult, teams: Team[]) {
  const teamName = (id: number | null) => teams.find((t) => t.id === id)?.name ?? '?'
  if (game.kind === 'placement') {
    return (result.placements ?? [])
      .map((id, i) => `${PLACE_LABELS[i]}: ${teamName(id)}`)
      .join('  ·  ')
  }
  if (game.kind === 'matchup') {
    const pairs = matchupPairs(teams)
    const decided = (result.matchup_winners ?? []).flatMap((w, i) => {
      if (w == null || !pairs[i]) return []
      const loser = pairs[i].find((t) => t.id !== w)
      return [`${teamName(w)} d. ${loser?.name ?? '?'}`]
    })
    return decided.length > 0
      ? `${decided.join('  ·  ')}${decided.length < 3 ? `  ·  ${3 - decided.length} left` : ''}`
      : 'Not played yet'
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
      className={`flex-1 truncate border-[1.5px] border-ink px-2 py-2 font-mono text-xs transition-colors ${
        selected ? 'bg-lime font-medium' : 'bg-transparent text-ink'
      }`}
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
  const [matchWinners, setMatchWinners] = useState<(number | null)[]>(
    result?.matchup_winners ?? [null, null, null],
  )
  const [busy, setBusy] = useState(false)

  const isPlacement = game.kind === 'placement'
  const isMatchup = game.kind === 'matchup'
  const pairs = matchupPairs(teams)
  const canSave = isPlacement
    ? placements.every((p) => p != null)
    : winnerTeam != null

  function pick(place: number, teamId: number) {
    setPlacements((prev) =>
      prev.map((p, i) => (i === place ? teamId : p === teamId ? null : p)),
    )
  }

  // Matchups happen ad hoc all weekend, so each tap saves immediately.
  // Tapping the current winner again clears that match.
  async function pickMatchWinner(match: number, teamId: number) {
    if (busy) return
    const prev = matchWinners
    const next = prev.map((w, i) => (i === match ? (w === teamId ? null : teamId) : w))
    setMatchWinners(next)
    setBusy(true)
    try {
      await saveResult(game.id, { matchup_winners: next })
      await refresh()
    } catch (e) {
      setMatchWinners(prev)
      alert(`Save failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
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
    <div className="mt-4 space-y-3 border-t border-hair pt-4">
      {game.name === 'Bowling' && (
        <p className="font-mono text-[11px] leading-relaxed text-dim">
          2 lanes, 6 a side — each team splits 2 bowlers per lane. Combined team
          pinfall decides 1st / 2nd / 3rd.
        </p>
      )}
      {isMatchup ? (
        <>
          {pairs.map(([a, b], match) => (
            <div key={match}>
              <p className="kicker mb-1.5">
                Match {match + 1} — {game.points as number} pts to the winner
              </p>
              <div className="flex items-center gap-2">
                <TeamButton
                  team={a}
                  selected={matchWinners[match] === a.id}
                  onClick={() => pickMatchWinner(match, a.id)}
                />
                <span className="shrink-0 font-mono text-[10px] text-dim">vs</span>
                <TeamButton
                  team={b}
                  selected={matchWinners[match] === b.id}
                  onClick={() => pickMatchWinner(match, b.id)}
                />
              </div>
            </div>
          ))}
          <p className="font-mono text-[10px] tracking-[0.04em] text-dim">
            Tap the winner — saves instantly. Tap again to undo.
          </p>
        </>
      ) : isPlacement ? (
        PLACE_LABELS.map((label, place) => (
          <div key={label}>
            <p className="kicker mb-1.5">
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
            <p className="kicker mb-1.5">Winning team — {game.points as number} pts</p>
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
            className="w-full border-[1.5px] border-ink bg-transparent px-3 py-2 font-mono text-sm placeholder:text-dim focus:outline-none"
          />
        </>
      )}

      <div className="flex gap-2 pt-1">
        {!isMatchup && (
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
            className="flex-1 border-[1.5px] border-ink bg-ink py-2.5 font-mono text-xs tracking-[0.14em] text-paper uppercase disabled:opacity-40"
          >
            {busy ? 'Saving…' : 'Save result'}
          </button>
        )}
        {result && (
          <button
            disabled={busy}
            onClick={() => run(() => clearResult(game.id))}
            className="border-[1.5px] border-ink px-4 py-2.5 font-mono text-xs tracking-[0.14em] uppercase disabled:opacity-40"
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

  const renderSection = (num: string, title: string, right: string, list: Game[]) => (
    <section>
      <Lede num={num} title={title} right={right} />
      <div className="border-t-[1.5px] border-rule">
        {list.map((game, i) => {
          const result = results.find((r) => r.game_id === game.id)
          const complete = isGameComplete(game, result)
          const decided = decidedMatches(result)
          const open = openId === game.id
          return (
            <div
              key={game.id}
              className={`border-b border-hair px-1 py-5 ${
                i === list.length - 1 ? 'border-b-[1.5px] border-b-rule' : ''
              }`}
            >
              <button
                onClick={() => setOpenId(open ? null : game.id)}
                className="group flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <p className="text-[21px] font-semibold tracking-[-0.01em]">{game.name}</p>
                  <p className="mt-[5px] truncate font-mono text-[11px] text-dim">
                    {result ? resultSummary(game, result, teams) : 'Not played yet'}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-3">
                  <span
                    className={`font-mono text-[10px] tracking-[0.1em] uppercase ${
                      complete ? 'font-medium text-ink' : 'text-dim'
                    }`}
                  >
                    {complete
                      ? '✓ Done'
                      : game.kind === 'matchup' && decided > 0
                        ? `${decided}/3 played`
                        : pointsLabel(game)}
                  </span>
                  <span
                    className={`flex size-7 items-center justify-center rounded-full border-[1.5px] border-ink text-[15px] leading-none transition-all group-hover:bg-sky ${
                      open ? 'rotate-45 bg-sky' : 'bg-sky/40'
                    }`}
                  >
                    +
                  </span>
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
      <header className="border-b-[1.5px] border-rule pt-12 pb-8">
        <p className="kicker mb-5">Enter results · Board updates live</p>
        <h1 className="text-[clamp(44px,9vw,90px)] leading-[0.86] font-black tracking-[-0.03em]">
          <span className="outlined">Ga</span>mes
        </h1>
        <p className="mt-6 font-mono text-xs tracking-[0.02em] text-dim">
          Tap a game to enter or edit its result
        </p>
      </header>
      {renderSection('/01', 'Mini Games', 'Warm-ups', games.filter((g) => g.category === 'mini'))}
      {renderSection('/02', 'Golf', 'Main event', games.filter((g) => g.category === 'golf'))}
    </div>
  )
}
