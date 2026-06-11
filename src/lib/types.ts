export interface Team {
  id: number
  name: string
  color: string
  players: string[]
  // key into PHOTOS (src/lib/photos.ts), null = color dot only
  photo: string | null
}

export interface Game {
  id: number
  name: string
  category: 'mini' | 'golf'
  kind: 'placement' | 'winner' | 'matchup'
  // placement: [pts for 1st, 2nd, 3rd]; winner: flat points; matchup: flat pts per match win
  points: number[] | number
  sort_order: number
}

export interface GameResult {
  id: number
  game_id: number
  placements: number[] | null
  winner_team_id: number | null
  winner_player: string | null
  // matchup: winner team id (or null) per match, aligned to matchupPairs() order
  matchup_winners: (number | null)[] | null
  updated_at: string
}
