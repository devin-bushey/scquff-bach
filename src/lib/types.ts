export interface Team {
  id: number
  name: string
  color: string
  players: string[]
}

export interface Game {
  id: number
  name: string
  category: 'mini' | 'golf'
  kind: 'placement' | 'winner'
  // placement: [pts for 1st, 2nd, 3rd]; winner: flat points
  points: number[] | number
  sort_order: number
}

export interface GameResult {
  id: number
  game_id: number
  placements: number[] | null
  winner_team_id: number | null
  winner_player: string | null
  updated_at: string
}
