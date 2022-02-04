import { times } from 'lodash'
import { Reducer } from 'react'
import { MAX_NUMBER_OF_GUESSES } from '../constants/constants'
import {
  getDecodedHashParam,
  getHashParams,
  HASH_PARAM_KEY_DIFFICULTY,
  HASH_PARAM_KEY_ID,
} from '../lib/hashUtils'
import { Word } from '../lib/statuses'
import { getDifficultyFromUrl } from '../lib/utils'
import { usePersistedReducer } from './usePersistedReducer'

export const createId = () => {
  const hashId = getDecodedHashParam(HASH_PARAM_KEY_ID)

  const id = hashId || Math.random().toString(36).substr(2, 10)

  return id
}

export const createDifficulty = (): Difficulty => {
  const difficulty = parseInt(getHashParams()[HASH_PARAM_KEY_DIFFICULTY] ?? '')

  return (
    difficulty && !isNaN(difficulty) && difficulty >= 3 && difficulty <= 9
      ? difficulty
      : 5
  ) as Difficulty
}

export type Difficulty = 3 | 4 | 5 | 6 | 7 | 8 | 9

export type State = {
  id: string
  difficulty: Difficulty
  theme: 'dark' | 'light'
  grid: 'full' | 'compact'
  stats: Record<Difficulty, GameStats>
  game: Record<Difficulty, GameState>
}

export type Action =
  | {
      type: 'ADD_GUESS'
      guess: Word
    }
  | {
      type: 'CHANGE_DIFFICULTY'
      difficulty: State['difficulty']
    }
  | ({
      type: 'NEW_GAME'
    } & (
      | {
          day: number
        }
      | { random: number }
    ))

export type GameState = {
  guesses: Word[]
  solution: Word | undefined
  day: number
  random: number
}

export type GameStats = {
  winDistribution: number[]
  gamesFailed: number
  currentStreak: number
  bestStreak: number
  totalGames: number
  successRate: number
}

const initialGame: GameState = {
  day: 0,
  random: -1,
  solution: undefined,
  guesses: [],
}

export const getInitialStat = (difficulty: Difficulty): GameStats => {
  return {
    winDistribution: times(MAX_NUMBER_OF_GUESSES[difficulty], () => 0),
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0,
  }
}

export const initialState: State = {
  id: createId(),
  difficulty: createDifficulty(),
  theme: 'light',
  grid: 'full',
  stats: {
    3: getInitialStat(3),
    4: getInitialStat(4),
    5: getInitialStat(5),
    6: getInitialStat(6),
    7: getInitialStat(7),
    8: getInitialStat(8),
    9: getInitialStat(9),
  },
  game: {
    3: initialGame,
    4: initialGame,
    5: initialGame,
    6: initialGame,
    7: initialGame,
    8: initialGame,
    9: initialGame,
  },
}

export const gameReducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'CHANGE_DIFFICULTY': {
      return {
        ...state,
        difficulty: action.difficulty,
      }
    }
  }

  return state
}
