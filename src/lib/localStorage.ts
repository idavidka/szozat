import { shuffle } from 'lodash'
import { isLocalhost } from './utils'
import { Word } from './statuses'
import { ThemeValue } from './theme'
import {
  getDecodedHashParam,
  getHashParams,
  HASH_PARAM_KEY_DIFFICULTY,
  HASH_PARAM_KEY_ID,
} from './hashUtils'
import PKG from '../../package.json'
import { Difficulty, State } from '../hooks/gameReducer'

export const gameKey = 'game'
export const idKey = 'id'
export const gameStateKey = 'gameState'
export const difficultyKey = 'difficulty'
export const gridFullKey = 'gridFull'
export const themeKey = 'colorTheme'

export type GameState = {
  guesses: Word[]
  currentGuess: Word
  solution: Word
  day: number
  random: number
}

const encrypt = (value: string): string => {
  const buffer = window.btoa(encodeURIComponent(value)).split('')
  const reverseBuffer = buffer.reverse()

  return window.btoa(
    shuffle(buffer).join('') + reverseBuffer.join('') + shuffle(buffer).join('')
  )
}

const decrypt = (value: string): string => {
  const buffer = window.atob(value)
  const length = buffer.length / 3
  const reverseBuffer = buffer.substring(length, length * 2)

  return decodeURIComponent(
    window.atob(reverseBuffer.split('').reverse().join(''))
  )
}

export const getKey = (key: string) => {
  return key === 'id' ? key : `${key}-${PKG.version}`
}

export const setItem: typeof localStorage.setItem = (
  key: string,
  value: string
) => {
  // localStorage.setItem(key, value)
  localStorage.setItem(getKey(key), isLocalhost() ? value : encrypt(value))
}

export const getItem: typeof localStorage.getItem = (key: string) => {
  const value = localStorage.getItem(getKey(key))

  try {
    if (value) {
      JSON.parse(value)
      return value
    }
  } catch (err) {}

  return value && value !== 'NaN' ? decrypt(value) : null
}

export const saveGridFullToLocalStorage = (full: boolean) => {
  setItem(gridFullKey, JSON.stringify({ full }))
}

export const loadGridFullToLocalStorage = (): boolean => {
  const value = getItem(gridFullKey)

  const full = value && value !== 'NaN' ? JSON.parse(value)?.full : false
  return full ? !!full : false
}

export const saveDifficultyToLocalStorage = (difficulty: Difficulty) => {
  setItem(difficultyKey, JSON.stringify({ difficulty: difficulty.toString() }))
}

export const loadDifficultyToLocalStorage = (): number => {
  const value = getItem(difficultyKey)

  const difficulty = parseInt(
    (value && value !== 'NaN' ? JSON.parse(value)?.difficulty : null) ?? '5',
    10
  )
  return difficulty ?? 5
}

export const saveGameStateToLocalStorage = (
  gameState: GameState,
  difficulty: Difficulty
) => {
  setItem(`${gameStateKey}-${difficulty}`, JSON.stringify(gameState))
}

export const loadGameStateFromLocalStorage = (difficulty: Difficulty) => {
  const state =
    getItem(`${gameStateKey}-${difficulty}`) ??
    (difficulty === 5 ? localStorage.getItem(gameStateKey) : undefined)
  return state ? (JSON.parse(state) as GameState) : null
}

const gameStatKey = 'gameStats'

export type GameStats = {
  winDistribution: number[]
  gamesFailed: number
  currentStreak: number
  bestStreak: number
  totalGames: number
  successRate: number
}

export const createId = () => {
  const hashId = getDecodedHashParam(HASH_PARAM_KEY_ID)

  const current = JSON.parse(getItem(idKey) ?? getItem(gameKey) ?? '{}')?.id

  const id = hashId || current || Math.random().toString(36).substr(2, 10)

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

export const saveStatsToLocalStorage = (
  gameStats: GameStats,
  difficulty: Difficulty
) => {
  setItem(`${gameStatKey}-${difficulty}`, JSON.stringify(gameStats))
}

export const loadStatsFromLocalStorage = (difficulty: Difficulty) => {
  const stats =
    getItem(`${gameStatKey}-${difficulty}`) ??
    (difficulty === 5 ? getItem(gameStatKey) : undefined)
  return stats ? (JSON.parse(stats) as GameStats) : null
}

export const loadInitialTheme = (): ThemeValue => {
  const gameState = getItem(gameKey)
  if (gameState) {
    const savedTheme = (JSON.parse(gameState) as State)?.theme

    if (savedTheme) {
      return savedTheme as ThemeValue
    }
  }

  const userMedia = window.matchMedia('(prefers-color-scheme: dark)')
  if (userMedia.matches) {
    return 'dark'
  }

  return 'light' // light theme as the default
}

export const saveTheme = (theme: ThemeValue) => setItem(themeKey, theme)
