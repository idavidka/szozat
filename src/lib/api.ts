import { debounce } from 'lodash'
import { Difficulty, State } from '../hooks/gameReducer'
import { Group } from '../hooks/wordReducer'
import { createId, getWordsFromLocalStorage } from './localStorage'
import { Word } from './statuses'

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

export const getStaticWords = (
  difficulty: Difficulty,
  resolver: (value: {
    group: Group
    difficulty: Difficulty
    words: Word[]
  }) => void
) => {
  const urls: Record<Group, string> = {
    all: `/words/hungarian-word-letter-list-${difficulty}.json`,
    selected: `/words/hungarian-puzzles-${difficulty}.json`,
    random: `/words/hungarian-puzzles-all-${difficulty}.json`,
  }

  let timeout = 0
  Object.entries(urls).forEach(([group, url]) => {
    if (!getWordsFromLocalStorage(group as Group, difficulty)?.length) {
      timeout = timeout++
      setTimeout(() => {
        fetch(url, {
          method: 'GET',
        })
          .then((response) => response.json())
          .then((words) =>
            resolver({
              group: group as Group,
              difficulty,
              words: words as Word[],
            })
          )
      }, timeout * 100)
    }
  })
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

export const getGlobalStatsFromAPI = () => {
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
