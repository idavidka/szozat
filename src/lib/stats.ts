import { times } from 'lodash'
import { MAX_NUMBER_OF_GUESSES } from '../constants/constants'
import { Difficulty, GameStats } from '../hooks/gameReducer'

// In stats array elements 0-(N-1) are successes in 1-N trys

export const addStatsForCompletedGame = (
  gameStats: Record<Difficulty, GameStats>,
  count: number,
  difficulty: Difficulty
) => {
  // Count is number of incorrect guesses before end.
  const stats = { ...gameStats[difficulty] }

  stats.totalGames += 1

  if (count > MAX_NUMBER_OF_GUESSES[difficulty] - 1) {
    // A fail situation
    stats.currentStreak = 0
    stats.gamesFailed += 1
  } else {
    stats.winDistribution[count] += 1
    stats.currentStreak += 1

    if (!stats.bestStreak || stats.bestStreak < stats.currentStreak) {
      stats.bestStreak = stats.currentStreak
    }
  }

  stats.successRate = getSuccessRate(stats)

  return stats
}

export const getDefaultStats = (difficulty: Difficulty): GameStats => {
  return {
    winDistribution: times(MAX_NUMBER_OF_GUESSES[difficulty], () => 0),
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0,
  }
}

export const toStats = (
  difficulty: Difficulty,
  stats?: Record<Difficulty, GameStats>
): GameStats => {
  const stat = stats?.[difficulty]
  const defaultStat = getDefaultStats(difficulty)

  if (!stat) {
    return defaultStat
  }

  return {
    ...defaultStat,
    ...stat,
    successRate: getSuccessRate(stat),
  }
}

const getSuccessRate = (gameStats: GameStats) => {
  const { totalGames, gamesFailed } = gameStats

  return Math.round(
    (100 * (totalGames - gamesFailed)) / Math.max(totalGames, 1)
  )
}
