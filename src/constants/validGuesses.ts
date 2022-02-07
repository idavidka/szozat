import { Difficulty } from '../hooks/gameReducer'
import { getWordsFromLocalStorage } from '../lib/localStorage'
import { Word } from '../lib/statuses'
import { toWord } from '../lib/utils'

export const getValidGuesses = (difficulty: Difficulty): Word[] =>
  getWordsFromLocalStorage('all', difficulty)?.map(toWord) ?? []
