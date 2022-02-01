import { GameStats, generateSessionId } from './localStorage'

export const sendStatsToAPI = (gameStats: GameStats, difficulty: number) => {
  if (!process.env.REACT_APP_API_URL) {
    return Promise.reject()
  }

  const sessionId = generateSessionId()
  const url = `${window.location.protocol}//${process.env.REACT_APP_API_URL}`

  const data = new FormData()
  data.append('id', sessionId.id)
  data.append('difficult', difficulty.toString())
  data.append('totalCount', gameStats.totalGames.toString())
  data.append('failedCount', gameStats.gamesFailed.toString())
  data.append('distributions', gameStats.winDistribution.toString())
  return fetch(url, {
    method: 'POST',
    body: data,
  }).then((response) => response.json())
}

export const getStatsFromApi = () => {
  if (!process.env.REACT_APP_API_URL) {
    return Promise.reject()
  }

  const url = `${window.location.protocol}//${process.env.REACT_APP_API_URL}`
  const params = new URLSearchParams()
  params.append('stat', 'true')
  params.append('id', generateSessionId().id)

  params.toString()
  return fetch(`${url}?${params.toString()}`, {
    method: 'GET',
  }).then((response) => response.json())
}
