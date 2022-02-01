import { getWords } from '../constants/wordlist'
import { getValidGuesses } from '../constants/validGuesses'
import { CharValue, Word } from './statuses'
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

export const isWordInWordList = (word: Word, difficulty: number) => {
  return getValidGuesses(difficulty).some((validWord) =>
    isWordEqual(word, validWord)
  )
}

export const isWinningWord = (word: Word, day: number, difficulty: number) => {
  const { solution: currentSolution } = getCurrentWord(day, difficulty)
  return isWordEqual(currentSolution, word)
}

export const getWordOfDay = (day: number, difficulty: number) => {
  const words = getWords(difficulty)
  // January 1, 2022 Game Epoch
  const epochMs = new Date('January 1, 2022 00:00:00').valueOf()
  const msInDay = 86400000
  const now = Date.now() + (day ?? 0) * msInDay
  const index = Math.floor((now - epochMs) / msInDay)
  const indexModulo = index % words.length
  const nextday = (index + 1) * msInDay + epochMs

  return {
    solution: words[indexModulo],
    solutionIndex: indexModulo,
    tomorrow: nextday,
  }
}

export const getWordFromUrl = (difficulty: number) => {
  const customSolution = getDecodedHashParam(HASH_PARAM_KEY_SOLUTION)
  if (customSolution === undefined) {
    return undefined
  }
  const customCreator =
    getDecodedHashParam(HASH_PARAM_KEY_CREATOR) ?? 'ismeretlen szerző'
  const customWord = getWordLetters(customSolution).map((char) =>
    char.toUpperCase()
  ) as Word
  if (customWord.length !== difficulty) {
    return undefined
  }

  return {
    solution: customWord,
    solutionCreator: customCreator,
  }
}

export const getCurrentWord = (day: number, difficulty: number) => {
  const wordFromUrl = getWordFromUrl(difficulty)
  const wordOfDay = getWordOfDay(day, difficulty)
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

export const getLetterCount = (word: Word): Record<CharValue, number> => {
  return word.reduce<Record<CharValue, number>>((acc, letter) => {
    return { ...acc, [letter]: (acc[letter] ?? 0) + 1 }
  }, {})
}

export const { solution, solutionIndex, solutionCreator, tomorrow } =
  getCurrentWord(0, 5)
