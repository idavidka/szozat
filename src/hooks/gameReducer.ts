import { times } from 'lodash'
import { Reducer } from 'react'
import { MAX_NUMBER_OF_GUESSES } from '../constants/constants'
import {
  getDecodedHashParam,
  getHashParams,
  HASH_PARAM_KEY_DIFFICULTY,
  HASH_PARAM_KEY_ID,
} from '../lib/hashUtils'
import { GameState, GameStats } from '../lib/localStorage'
import { ThemeValue } from '../lib/theme'
import { getCurrentWord } from '../lib/words'

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
export type View = 'full' | 'compact'

export type State = {
  id: string
  difficulty: Difficulty
  theme: ThemeValue
  view: View
  stats: Record<Difficulty, GameStats>
  game: Record<Difficulty, GameState>
}

export type Action =
  | { type: 'SET_THEME'; theme: ThemeValue }
  | { type: 'SET_VIEW'; view: View }
  | {
      type: 'SET_DIFFICULTY'
      difficulty: State['difficulty']
    }

export const getInitialState = (difficulty: Difficulty): GameState => {
  const { solution } = getCurrentWord(0, difficulty)
  return {
    day: 0,
    random: -1,
    solution,
    guesses: [],
  }
}

export const getInitialStats = (difficulty: Difficulty): GameStats => {
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
  view: 'full',
  stats: {
    3: getInitialStats(3),
    4: getInitialStats(4),
    5: getInitialStats(5),
    6: getInitialStats(6),
    7: getInitialStats(7),
    8: getInitialStats(8),
    9: getInitialStats(9),
  },
  game: {
    3: getInitialState(3),
    4: getInitialState(4),
    5: getInitialState(5),
    6: getInitialState(6),
    7: getInitialState(7),
    8: getInitialState(8),
    9: getInitialState(9),
  },
}

export const gameReducer: Reducer<State, Action> = (state, action): State => {
  switch (action.type) {
    case 'SET_THEME': {
      return { ...state, theme: action.theme }
    }
    case 'SET_VIEW': {
      console.log('ASD', { ...state, view: action.view })
      return { ...state, view: action.view }
    }
    case 'SET_DIFFICULTY': {
      return {
        ...state,
        difficulty: action.difficulty,
      }
    }
  }

  return state
}
