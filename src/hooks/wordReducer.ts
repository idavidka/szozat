import { Reducer } from 'react'
import { Word } from '../lib/statuses'

export type Group = 'all' | 'selected' | 'random'

export type State = Record<Group, Word[]>

export type Action =
  | {
      type: 'RESET_STATE'
    }
  | {
      type: 'UPDATE_STATE'
      state: Partial<State>
    }
  | {
      type: 'ADD_WORD'
      group: Group
      word: Word
    }
  | {
      type: 'REMOVE_WORD'
      group: Group
      word: Word
    }

export const initialState: State = {
  all: [],
  selected: [],
  random: [],
}

export const wordReducer: Reducer<State, Action> = (state, action): State => {
  switch (action.type) {
    case 'ADD_WORD': {
      const index = state[action.group].indexOf(action.word)
      const indexAll = state.all.indexOf(action.word)
      let all = {}
      let group = {}
      if (indexAll < 0) {
        all = {
          all: [...(state.all ?? []), action.word],
        }
      }

      if (index < 0) {
        group = {
          [action.group]: [...(state[action.group] ?? {}), action.word],
        }
      }

      return { ...state, ...all, ...group }
    }
    case 'REMOVE_WORD': {
      const words = [...state[action.group]]
      const wordsAll = [...state.all]
      const index = words.indexOf(action.word)
      const indexAll = wordsAll.indexOf(action.word)
      let all = {}
      let group = {}
      if (indexAll > -1) {
        wordsAll.splice(indexAll, 1)
        all = {
          all: wordsAll,
        }
      }
      if (index > -1) {
        words.splice(index, 1)
        group = {
          [action.group]: words,
        }
      }

      return { ...state, ...all, ...group }
    }
    case 'RESET_STATE': {
      return initialState
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
