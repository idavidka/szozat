import { times } from 'lodash'
import { Reducer } from 'react'
import { MAX_NUMBER_OF_GUESSES } from '../constants/constants'
import {
  getDecodedHashParam,
  getHashParams,
  HASH_PARAM_KEY_DIFFICULTY,
  HASH_PARAM_KEY_ID,
} from '../lib/hashUtils'
import {
  createDifficulty,
  createId,
  gameKey,
  GameState,
  GameStats,
  getItem,
  idKey,
} from '../lib/localStorage'
import { Word } from '../lib/statuses'
import { ThemeValue } from '../lib/theme'
import { isLocalhost } from '../lib/utils'
import { getCurrentWord, getRandomWord } from '../lib/words'

export type Difficulty = 3 | 4 | 5 | 6 | 7 | 8 | 9
export type View = 'full' | 'compact'

export type State = {
  id: string
  difficulty: Difficulty
  theme: ThemeValue
  view: View
  info: Record<Difficulty, boolean>
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
  | {
      type: 'SET_INFO'
      difficulty: State['difficulty']
      seen: boolean
    }
  | { type: 'SET_DAY'; difficulty: State['difficulty']; day: number }
  | { type: 'SET_RANDOM'; difficulty: State['difficulty']; random: number }
  | {
      type: 'UPDATE_SOLUTION'
      difficulty: State['difficulty']
      solution: Word
    }
  | {
      type: 'UPDATE_GUESSES'
      difficulty: State['difficulty']
      guesses: Word[]
    }
  | {
      type: 'UPDATE_CURRENT_GUESS'
      difficulty: State['difficulty']
      currentGuess: Word
    }
  | {
      type: 'UPDATE_STATS'
      difficulty: State['difficulty']
      stats: GameStats
    }
  | {
      type: 'UPDATE_STATE'
      state: State
    }

export const getInitialState = (difficulty: Difficulty): GameState => {
  const { solution } = getCurrentWord(0, difficulty)
  return {
    day: 0,
    random: -1,
    solution,
    guesses: [],
    currentGuess: [],
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
  info: {
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
  },
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
  isLocalhost() && console.log('Action', action)
  switch (action.type) {
    case 'SET_THEME': {
      return { ...state, theme: action.theme }
    }
    case 'SET_VIEW': {
      return { ...state, view: action.view }
    }
    case 'SET_DIFFICULTY': {
      return {
        ...state,
        difficulty: action.difficulty,
      }
    }
    case 'SET_INFO': {
      return {
        ...state,
        info: {
          ...state.info,
          [action.difficulty]: action.seen,
        },
      }
    }
    case 'SET_DAY': {
      return {
        ...state,
        game: {
          ...state.game,
          [action.difficulty]: {
            ...(state.game[action.difficulty] ?? {}),
            solution: getCurrentWord(action.day, state.difficulty).solution,
            day: action.day,
          } as GameState,
        },
      }
    }
    case 'SET_RANDOM': {
      return {
        ...state,
        game: {
          ...state.game,
          [action.difficulty]: {
            ...(state.game[action.difficulty] ?? {}),
            ...(action.random > -1
              ? {
                  solution: getRandomWord(action.random, state.difficulty)
                    .solution,
                }
              : {}),
            random: action.random,
          } as GameState,
        },
      }
    }
    case 'UPDATE_GUESSES': {
      return {
        ...state,
        game: {
          ...state.game,
          [action.difficulty]: {
            ...(state.game[action.difficulty] ?? {}),
            guesses: action.guesses,
          } as GameState,
        },
      }
    }
    case 'UPDATE_SOLUTION': {
      return {
        ...state,
        game: {
          ...state.game,
          [action.difficulty]: {
            ...(state.game[action.difficulty] ?? {}),
            solution: action.solution,
          } as GameState,
        },
      }
    }
    case 'UPDATE_CURRENT_GUESS': {
      return {
        ...state,
        game: {
          ...state.game,
          [action.difficulty]: {
            ...(state.game[action.difficulty] ?? {}),
            currentGuess: action.currentGuess,
          } as GameState,
        },
      }
    }
    case 'UPDATE_STATS': {
      return {
        ...state,
        stats: {
          ...state.stats,
          [action.difficulty]: action.stats,
        },
      }
    }
    case 'UPDATE_STATE': {
      return {
        ...state,
        ...action.state,
        game: {
          ...state.game,
          ...(action.state.game ?? {}),
        },
        stats: {
          ...state.stats,
          ...(action.state.stats ?? {}),
        },
      }
    }
  }

  return state
}
