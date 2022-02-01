import { times } from 'lodash'
import { MAX_NUMBER_OF_GUESSES } from '../constants/constants'
import {
  GameStats,
  loadStatsFromLocalStorage,
  saveStatsToLocalStorage,
  sendStatsToAPI,
} from './localStorage'

// In stats array elements 0-(N-1) are successes in 1-N trys

export const addStatsForCompletedGame = (
  gameStats: GameStats,
  count: number,
  difficulty: number
) => {
  // Count is number of incorrect guesses before end.
  const stats = { ...gameStats }

  stats.totalGames += 1

  if (count > MAX_NUMBER_OF_GUESSES[difficulty] - 1) {
    // A fail situation
    stats.currentStreak = 0
    stats.gamesFailed += 1
  } else {
    stats.winDistribution[count] += 1
    stats.currentStreak += 1

    if (stats.bestStreak < stats.currentStreak) {
      stats.bestStreak = stats.currentStreak
    }
  }

  stats.successRate = getSuccessRate(stats)

  saveStatsToLocalStorage(stats, difficulty)
  sendStatsToAPI(stats, difficulty)

  return stats
}

export const getDefaultStats = (difficulty: number): GameStats => {
  return {
    winDistribution: times(difficulty, () => 0),
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0,
  }
}

export const loadStats = (difficulty: number) => {
  return loadStatsFromLocalStorage(difficulty) || getDefaultStats(difficulty)
}

const getSuccessRate = (gameStats: GameStats) => {
  const { totalGames, gamesFailed } = gameStats

  return Math.round(
    (100 * (totalGames - gamesFailed)) / Math.max(totalGames, 1)
  )
}
