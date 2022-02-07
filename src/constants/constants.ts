import { Difficulty } from '../hooks/gameReducer'

export const MAX_NUMBER_OF_GUESSES: Record<Difficulty, number> = {
  3: 7,
  4: 8,
  5: 8,
  6: 10,
  7: 12,
  8: 14,
  9: 18,
}

export const DIFFICULTIES: Difficulty[] = [3, 4, 5, 6, 7, 8, 9]
