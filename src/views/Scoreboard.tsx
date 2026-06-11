import { computeStandings, isGameComplete } from '../lib/data'
import type { League } from '../lib/data'
import { photoUrl } from '../lib/photos'
import Lede from '../components/Lede'

function shortName(name: string) {
  return name
    .replace('Golf — Team Match', 'Golf')
    .replace('Closest to the Pin', 'CTP')
    .replace('Long Drive', 'LD')
    .replace('Table Tennis', 'Pong')
    .replace('Beer Pong', 'BP')
}

export default function Scoreboard({
  league,
  onGoToGames,
  onGoToTeams,
}: {
  league: League
  onGoToGames: () => void
  onGoToTeams: () => void
}) {
  const { teams, games, results } = league
  const { totals, byGame, ranked } = computeStandings(teams, games, results)

  const playerCount = 12

  return (
    <div>
      {/* hero */}
      <section className="border-b-[1.5px] border-rule pt-12 pb-8">
        <h1 className="text-[clamp(52px,12vw,140px)] leading-[0.86] font-black tracking-[-0.03em]">
          Scquff's
          <br />
          <span className="outlined">Bach</span>
        </h1>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 font-mono text-xs tracking-[0.02em] text-dim">
          <span>
            <b className="font-medium text-ink">{teams.length}</b> teams
          </span>
          <span>
            <b className="font-medium text-ink">{playerCount}</b> players
          </span>
          <span>
            <b className="font-medium text-ink">{games.length}</b> events
          </span>
          <span>
            <b className="font-medium text-ink">1</b> winner
          </span>
          <span>
            <b className="font-medium text-ink">
              {games.filter((g) => isGameComplete(g, results.find((r) => r.game_id === g.id))).length}
            </b>{' '}
            of <b className="font-medium text-ink">{games.length}</b> played
          </span>
        </div>
      </section>

      {/* standings */}
      <section>
        <Lede num="/01" title="Standings" right="Live" />
        <div className="border-t-[1.5px] border-rule">
          {ranked.map((team, i) => {
            const pts = totals.get(team.id) ?? 0
            const lead = i === 0 && results.length > 0
            return (
              <div
                key={team.id}
                className={`relative grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-hair px-1 py-5 sm:gap-[18px] ${
                  i === ranked.length - 1 ? 'border-b-[1.5px] border-b-rule' : ''
                }`}
              >
                {lead && <span className="absolute top-0 -left-6 -bottom-px w-1.5 bg-lime" />}
                <span className="self-start pt-2 font-mono text-[13px] text-dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-[clamp(28px,5.2vw,46px)] leading-none font-black tracking-[-0.02em]">
                    {photoUrl(team.photo) ? (
                      <img
                        src={photoUrl(team.photo)!}
                        alt=""
                        width={44}
                        height={44}
                        loading="lazy"
                        className="mr-3 inline-block size-11 rounded-full border-[1.5px] border-ink object-cover align-[-0.18em]"
                        style={{ boxShadow: `0 0 0 2.5px ${team.color}` }}
                      />
                    ) : (
                      <span
                        className="mr-3 inline-block size-3 rounded-full border-[1.5px] border-ink align-baseline"
                        style={{ backgroundColor: team.color }}
                      />
                    )}
                    {team.name}
                    {lead && (
                      <span className="ml-3.5 rounded-[2px] bg-lime px-[7px] py-[3px] align-middle font-mono text-[10px] font-normal tracking-[0.14em]">
                        ★ LEADER
                      </span>
                    )}
                  </span>
                  <span className="mt-[9px] block font-mono text-[11px] tracking-[0.02em] text-dim">
                    {team.players.filter(Boolean).join(' · ') || 'No players yet'}
                  </span>
                </span>
                <span className="text-right font-mono text-[clamp(30px,6vw,52px)] leading-none font-medium tracking-[-0.03em] tabular-nums">
                  {pts}
                  <span className="mt-1.5 block text-[10px] tracking-[0.16em] text-dim uppercase">
                    pts
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* breakdown */}
      <section>
        <Lede num="/02" title="The Breakdown" right="Per event" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse border-t-[1.5px] border-b-[1.5px] border-rule font-mono">
            <thead>
              <tr>
                <th className="border-b border-hair px-2 py-3 text-left text-[10px] font-normal tracking-[0.12em] whitespace-nowrap text-dim uppercase">
                  Team
                </th>
                {games.map((g) => (
                  <th
                    key={g.id}
                    className="border-b border-hair px-2 py-3 text-center text-[10px] font-normal tracking-[0.12em] whitespace-nowrap text-dim uppercase"
                  >
                    {shortName(g.name)}
                  </th>
                ))}
                <th className="border-b border-hair px-2 py-3 text-center text-[10px] font-normal tracking-[0.12em] whitespace-nowrap text-dim uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((team) => (
                <tr key={team.id}>
                  <td className="border-b border-hair px-2 py-3 text-left font-serif text-base font-black whitespace-nowrap">
                    {team.name}
                  </td>
                  {games.map((g) => {
                    const pts = byGame.get(g.id)
                    return (
                      <td
                        key={g.id}
                        className="border-b border-hair px-2 py-3 text-center text-[13px] tabular-nums"
                      >
                        {pts ? (
                          (pts.get(team.id) ?? <span className="text-dim">0</span>)
                        ) : (
                          <span className="text-dim">—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="border-b border-hair bg-ink px-2 py-3 text-center text-base font-medium text-paper tabular-nums">
                    {totals.get(team.id) ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* points → games link */}
      <section>
        <button
          onClick={onGoToGames}
          className="group flex w-full items-center justify-between gap-3 border-t-[1.5px] border-rule py-6 text-left"
        >
          <span>
            <span className="kicker">How to score</span>
            <span className="mt-1.5 block text-xl font-black tracking-[-0.01em]">
              See games & points
            </span>
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-sky/40 text-lg leading-none transition-colors group-hover:bg-sky">
            →
          </span>
        </button>
      </section>

      {/* teams link */}
      <section>
        <button
          onClick={onGoToTeams}
          className="group flex w-full items-center justify-between gap-3 border-t-[1.5px] border-rule py-6 text-left"
        >
          <span>
            <span className="kicker">The foursomes</span>
            <span className="mt-1.5 block text-xl font-black tracking-[-0.01em]">
              Create & edit teams
            </span>
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-sky/40 text-lg leading-none transition-colors group-hover:bg-sky">
            →
          </span>
        </button>
      </section>
    </div>
  )
}
