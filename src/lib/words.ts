import { WORDS } from '../constants/wordlist'
import { VALIDGUESSES } from '../constants/validGuesses'
import { Word } from './statuses'
import { isEqual } from 'lodash'
import { getWordLetters } from './hungarianWordUtils'
import {
  getDecodedHashParam,
  HASH_PARAM_KEY_CREATOR,
  HASH_PARAM_KEY_SOLUTION,
} from './hashUtils'

export const isWordEqual = (word1: Word, word2: Word) => {
  return isEqual(word1, word2)
}

export const isWordInWordList = (word: Word) => {
  return VALIDGUESSES.some((validWord) => isWordEqual(word, validWord))
}

export const isWinningWord = (word: Word) => {
  return isWordEqual(solution, word)
}

export const getWordOfDay = (day?: number) => {
  // January 1, 2022 Game Epoch
  const epochMs = new Date('January 1, 2022 00:00:00').valueOf()
  const msInDay = 86400000
  const now = Date.now() + (day ?? 0) * msInDay
  const index = Math.floor((now - epochMs) / msInDay)
  const indexModulo = index % WORDS.length
  const nextday = (index + 1) * msInDay + epochMs

  return {
    solution: WORDS[indexModulo],
    solutionIndex: indexModulo,
    tomorrow: nextday,
  }
}

export const getWordFromUrl = () => {
  const customSolution = getDecodedHashParam(HASH_PARAM_KEY_SOLUTION)
  if (customSolution === undefined) {
    return undefined
  }
  const customCreator =
    getDecodedHashParam(HASH_PARAM_KEY_CREATOR) ?? 'ismeretlen szerző'
  const customWord = getWordLetters(customSolution).map((char) =>
    char.toUpperCase()
  ) as Word
  if (customWord.length !== 5) {
    return undefined
  }
  return {
    solution: customWord,
    solutionCreator: customCreator,
  }
}

export const getCurrentWord = (day?: number) => {
  const wordFromUrl = getWordFromUrl()
  const wordOfDay = getWordOfDay(day)
  if (wordFromUrl !== undefined) {
    return {
      ...wordFromUrl,
      solutionIndex: undefined,
      tomorrow: undefined,
    }
  }
  return {
    ...wordOfDay,
    solutionCreator: undefined,
  }
}

export const { solution, solutionIndex, solutionCreator, tomorrow } =
  getCurrentWord()
