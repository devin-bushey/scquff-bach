import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Game, GameResult, Team } from './types'

export function useLeague() {
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [results, setResults] = useState<GameResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [t, g, r] = await Promise.all([
      supabase.from('teams').select('*').order('id'),
      supabase.from('games').select('*').order('sort_order'),
      supabase.from('results').select('*'),
    ])
    const err = t.error ?? g.error ?? r.error
    if (err) {
      setError(err.message)
    } else {
      setTeams(t.data as Team[])
      setGames(g.data as Game[])
      setResults(r.data as GameResult[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  return { teams, games, results, error, loading, refresh }
}

export type League = ReturnType<typeof useLeague>

export function computeStandings(teams: Team[], games: Game[], results: GameResult[]) {
  const totals = new Map<number, number>(teams.map((t) => [t.id, 0]))
  // game_id -> (team_id -> points earned in that game)
  const byGame = new Map<number, Map<number, number>>()

  for (const result of results) {
    const game = games.find((g) => g.id === result.game_id)
    if (!game) continue
    const pts = new Map<number, number>()
    if (game.kind === 'placement' && result.placements) {
      ;(game.points as number[]).forEach((p, place) => {
        const teamId = result.placements![place]
        if (teamId != null) pts.set(teamId, p)
      })
    } else if (game.kind === 'winner' && result.winner_team_id != null) {
      pts.set(result.winner_team_id, game.points as number)
    }
    byGame.set(result.game_id, pts)
    for (const [teamId, p] of pts) {
      totals.set(teamId, (totals.get(teamId) ?? 0) + p)
    }
  }

  const ranked = [...teams].sort(
    (a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0),
  )
  return { totals, byGame, ranked }
}

export async function saveResult(
  gameId: number,
  data: {
    placements?: number[]
    winner_team_id?: number
    winner_player?: string | null
  },
) {
  const { error } = await supabase.from('results').upsert(
    {
      game_id: gameId,
      placements: null,
      winner_team_id: null,
      winner_player: null,
      ...data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'game_id' },
  )
  if (error) throw error
}

export async function clearResult(gameId: number) {
  const { error } = await supabase.from('results').delete().eq('game_id', gameId)
  if (error) throw error
}

export async function updateTeam(
  id: number,
  patch: { name?: string; color?: string; players?: string[] },
) {
  const { error } = await supabase.from('teams').update(patch).eq('id', id)
  if (error) throw error
}
