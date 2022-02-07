import { Reducer } from 'react'
import { Word } from '../lib/statuses'
import { isLocalhost } from '../lib/utils'
import { Difficulty } from './gameReducer'

export type Group = 'all' | 'selected' | 'random'

export type State = Record<Group, Record<Difficulty, Word[]>>

export type Action =
  | {
      type: 'UPDATE_STATE'
      state: Partial<State>
    }
  | {
      type: 'UPDATE_DIFFICULTY'
      group: Group
      difficulty: Difficulty
      words: Word[]
    }
  | {
      type: 'ADD_WORD'
      group: Group
      difficulty: Difficulty
      word: Word
    }
  | {
      type: 'REMOVE_WORD'
      group: Group
      difficulty: Difficulty
      word: Word
    }

export const initialState: State = {
  all: {
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
  },
  selected: {
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
  },
  random: {
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
  },
}

export const wordReducer: Reducer<State, Action> = (state, action): State => {
  isLocalhost() && console.log('Word Action', action)
  switch (action.type) {
    case 'ADD_WORD': {
      const index = state[action.group][action.difficulty].indexOf(action.word)
      const indexAll = state.all[action.difficulty].indexOf(action.word)
      let all = {}
      let group = {}
      if (indexAll < 0) {
        all = {
          all: {
            ...(state.all ?? {}),
            [action.difficulty]: [
              ...(state.all[action.difficulty] ?? []),
              ...action.word,
            ],
          },
        }
      }

      if (index < 0) {
        group = {
          [action.group]: {
            ...(state[action.group] ?? {}),
            [action.difficulty]: [
              ...(state[action.group][action.difficulty] ?? []),
              ...action.word,
            ],
          },
        }
      }

      return { ...state, ...all, ...group }
    }
    case 'REMOVE_WORD': {
      const words = [...state[action.group][action.difficulty]]
      const wordsAll = [...state.all[action.difficulty]]
      const index = words.indexOf(action.word)
      const indexAll = wordsAll.indexOf(action.word)
      let all = {}
      let group = {}
      if (indexAll > -1) {
        wordsAll.splice(indexAll, 1)
        all = {
          all: {
            ...(state.all ?? {}),
            [action.difficulty]: wordsAll,
          },
        }
      }
      if (index > -1) {
        words.splice(index, 1)
        group = {
          [action.group]: {
            ...(state[action.group] ?? {}),
            [action.difficulty]: words,
          },
        }
      }

      return { ...state, ...all, ...group }
    }
    case 'UPDATE_DIFFICULTY': {
      return {
        ...state,
        [action.group]: {
          ...(state[action.group] ?? {}),
          [action.difficulty]: [
            ...(state[action.group][action.difficulty] ?? []),
            ...action.words,
          ],
        },
      }
    }
    case 'UPDATE_STATE': {
      return {
        ...state,
        ...action.state,
      }
    }
  }

  return state
}
