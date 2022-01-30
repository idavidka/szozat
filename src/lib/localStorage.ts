import { Word } from './statuses'
import { ThemeValue } from './theme'

const gameStateKey = 'gameState'
const themeKey = 'colorTheme'

type StoredGameState = {
  guesses: Word[]
  solution: Word
  day: number
}

export const saveGameStateToLocalStorage = (gameState: StoredGameState) => {
  localStorage.setItem(gameStateKey, JSON.stringify(gameState))
}

export const loadGameStateFromLocalStorage = () => {
  const state = localStorage.getItem(gameStateKey)
  return state ? (JSON.parse(state) as StoredGameState) : null
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

export const saveStatsToLocalStorage = (gameStats: GameStats) => {
  localStorage.setItem(gameStatKey, JSON.stringify(gameStats))
}

export const loadStatsFromLocalStorage = () => {
  const stats = localStorage.getItem(gameStatKey)
  return stats ? (JSON.parse(stats) as GameStats) : null
}

export const loadInitialTheme = (): ThemeValue => {
  const savedTheme = localStorage.getItem(themeKey)
  if (typeof savedTheme === 'string') {
    return savedTheme as ThemeValue
  }

  const userMedia = window.matchMedia('(prefers-color-scheme: dark)')
  if (userMedia.matches) {
    return 'dark'
  }

  return 'light' // light theme as the default
}

export const saveTheme = (theme: ThemeValue) =>
  localStorage.setItem(themeKey, theme)
