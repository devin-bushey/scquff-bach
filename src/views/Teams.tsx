import { useState } from 'react'
import { updateTeam } from '../lib/data'
import type { League } from '../lib/data'
import type { Team } from '../lib/types'
import { PHOTO_KEYS, PHOTOS, photoUrl } from '../lib/photos'
import Lede from '../components/Lede'

// Editorial palette: lime + ink plus muted tones that sit well on paper
const COLORS = ['#d6f24b', '#111110', '#b1502e', '#c99a2e', '#6b7d3f', '#3f7d5d', '#5a6e8c', '#7d5a78']

function TeamCard({ team, last, refresh }: { team: Team; last: boolean; refresh: () => Promise<void> }) {
  const [name, setName] = useState(team.name)
  const [color, setColor] = useState(team.color)
  const [players, setPlayers] = useState<string[]>(
    Array.from({ length: 4 }, (_, i) => team.players[i] ?? ''),
  )
  const [photo, setPhoto] = useState<string | null>(team.photo)
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    try {
      await updateTeam(team.id, {
        name: name.trim() || team.name,
        color,
        players: players.map((p) => p.trim()).filter(Boolean),
        photo,
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
      className={`border-b border-hair px-1 py-6 ${last ? 'border-b-[1.5px] border-b-rule' : ''}`}
    >
      <div className="flex items-center gap-3">
        {photoUrl(photo) ? (
          <img
            src={photoUrl(photo)!}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full border-[1.5px] border-ink object-cover"
            style={{ boxShadow: `0 0 0 2.5px ${color}` }}
          />
        ) : (
          <span
            className="size-3 shrink-0 rounded-full border-[1.5px] border-ink"
            style={{ backgroundColor: color }}
          />
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-[1.5px] border-ink bg-transparent px-3 py-2 text-lg font-black tracking-[-0.01em] focus:outline-none"
          placeholder="Team name"
        />
      </div>
      <div className="mt-4 flex gap-2.5">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`size-7 rounded-full border-[1.5px] border-ink ${
              color === c ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''
            }`}
            style={{ backgroundColor: c }}
            aria-label={`Pick color ${c}`}
          />
        ))}
      </div>
      <div className="mt-5">
        <p className="kicker mb-2.5">Team photo</p>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setPhoto(null)}
            aria-label="No photo"
            className={`flex size-20 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-ink font-mono text-[9px] tracking-[0.1em] uppercase ${
              photo === null ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : 'text-dim opacity-60'
            }`}
          >
            None
          </button>
          {PHOTO_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setPhoto(key)}
              aria-label={`Pick photo ${key}`}
              className={`size-20 shrink-0 rounded-full ${
                photo === key
                  ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper'
                  : 'opacity-75'
              }`}
            >
              <img
                src={PHOTOS[key]}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                className="size-20 rounded-full border-[1.5px] border-ink object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {players.map((p, i) => (
          <input
            key={i}
            value={p}
            onChange={(e) =>
              setPlayers((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
            }
            placeholder={`Player ${i + 1}`}
            className="border-[1.5px] border-ink bg-transparent px-3 py-2 font-mono text-sm placeholder:text-dim focus:outline-none"
          />
        ))}
      </div>
      <button
        disabled={busy}
        onClick={save}
        className="mt-4 w-full border-[1.5px] border-ink bg-ink py-2.5 font-mono text-xs tracking-[0.14em] text-paper uppercase disabled:opacity-40"
      >
        {busy ? 'Saving…' : 'Save team'}
      </button>
    </div>
  )
}

export default function Teams({ league }: { league: League }) {
  return (
    <div>
      <header className="border-b-[1.5px] border-rule pt-12 pb-8">
        <p className="kicker mb-5">Three squads · Twelve degenerates</p>
        <h1 className="text-[clamp(44px,9vw,90px)] leading-[0.86] font-black tracking-[-0.03em]">
          <span className="outlined">Te</span>ams
        </h1>
        <p className="mt-6 font-mono text-xs tracking-[0.02em] text-dim">
          Name your squads and assign the 12 degenerates
        </p>
      </header>
      <section>
        <Lede num="/01" title="The Rosters" right="Edit anytime" />
        <div className="border-t-[1.5px] border-rule">
          {league.teams.map((team, i) => (
            <TeamCard
              key={team.id}
              team={team}
              last={i === league.teams.length - 1}
              refresh={league.refresh}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
