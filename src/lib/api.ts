import { debounce } from 'lodash'
import { State } from '../hooks/gameReducer'
import { createId } from './localStorage'

export const sendStateToAPI = (state: State) => {
  if (!process.env.REACT_APP_API_URL) {
    return Promise.reject()
  }

  const sessionId = createId()
  const url = `${window.location.protocol}//${process.env.REACT_APP_API_URL}`

  const data = new FormData()
  data.append('id', sessionId)
  data.append('state', JSON.stringify(state))
  return fetch(url, {
    method: 'POST',
    body: data,
  }).then((response) => response.json())
}

export const getStateFromAPI = () => {
  if (!process.env.REACT_APP_API_URL) {
    return Promise.reject()
  }

  const url = `${window.location.protocol}//${process.env.REACT_APP_API_URL}`
  const params = new URLSearchParams()
  params.append('state', 'true')
  params.append('id', createId())

  params.toString()
  return fetch(`${url}?${params.toString()}`, {
    method: 'GET',
  }).then((response) => response.json())
}

export const debouncingStateToAPI = debounce(
  (...params: Parameters<typeof sendStateToAPI>) => sendStateToAPI(...params),
  100,
  { trailing: true }
)

// export const sendStatsToAPI = (gameStats: GameStats, difficulty: Difficulty) => {
//   if (!process.env.REACT_APP_API_URL) {
//     return Promise.reject()
//   }

//   const sessionId = generateSessionId()
//   const url = `${window.location.protocol}//${process.env.REACT_APP_API_URL}`

//   const data = new FormData()
//   data.append('id', sessionId.id)
//   data.append('difficult', difficulty.toString())
//   data.append('totalCount', gameStats.totalGames.toString())
//   data.append('failedCount', gameStats.gamesFailed.toString())
//   data.append('distributions', gameStats.winDistribution.toString())
//   return fetch(url, {
//     method: 'POST',
//     body: data,
//   }).then((response) => response.json())
// }

export const getStatsFromAPI = () => {
  if (!process.env.REACT_APP_API_URL) {
    return Promise.reject()
  }

  const url = `${window.location.protocol}//${process.env.REACT_APP_API_URL}`
  const params = new URLSearchParams()
  params.append('global', 'true')
  params.append('id', createId())

  params.toString()
  return fetch(`${url}?${params.toString()}`, {
    method: 'GET',
  }).then((response) => response.json())
}
