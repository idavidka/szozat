import { Difficulty } from '../hooks/gameReducer'
import { getWordsFromLocalStorage } from '../lib/localStorage'
import { Word } from '../lib/statuses'
import { toWord } from '../lib/utils'

export const getWords = (difficulty: Difficulty): Word[] =>
  getWordsFromLocalStorage('selected', difficulty)?.map(toWord) ?? []

export const getAllWords = (difficulty: Difficulty): Word[] =>
  getWordsFromLocalStorage('random', difficulty)?.map(toWord) ?? []
