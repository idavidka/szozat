import classNames from 'classnames'
import { findLastIndex, isNil, times } from 'lodash'
import { Difficulty } from '../hooks/gameReducer'
import { getHashParams, HASH_PARAM_KEY_DIFFICULTY } from './hashUtils'
import { CharValue, Word } from './statuses'

export type GameType = 'random' | 'in-row'

export const getInitialCurentGuess = (difficulty: Difficulty): Word =>
  times(difficulty, () => undefined)

export const toWord = (word: Word): Word => {
  return word.map((letter) => letter?.toUpperCase() as CharValue)
}

export const getGuessLength = (guess: Word) => {
  return guess.filter(Boolean).length
}

export const removeLetter = (word: Word, value?: CharValue): Word => {
  const lastNonEmptyIndex = findLastIndex(word, (letter) => !!letter)

  if (lastNonEmptyIndex < 0 || lastNonEmptyIndex >= word.length) {
    return word
  }

  const newWord = Object.assign({}, Object.values(word))

  newWord[lastNonEmptyIndex] = value

  return Object.values(newWord) as Word
}

export const setLetter = (
  word: Word,
  value: CharValue,
  difficulty: Difficulty,
  index?: number
): Word => {
  const hasIndex = !isNil(index)
  const nextEmptyIndex = hasIndex ? index : word.findIndex((letter) => !letter)

  if (nextEmptyIndex < 0 && word.length < difficulty) {
    return [...word, value]
  }

  if (nextEmptyIndex < 0 || (!hasIndex && nextEmptyIndex >= word.length)) {
    return word
  }

  const newWord = Object.assign(
    {},
    getInitialCurentGuess(difficulty),
    Object.values(word)
  )

  newWord[nextEmptyIndex] = value

  return Object.values(newWord) as Word
}

export const getArticle = (value?: CharValue) => {
  if (!value) {
    return ''
  }

  const own = [
    'Q',
    'W',
    'T',
    'P',
    'D',
    'G',
    'H',
    'J',
    'K',
    'Z',
    'C',
    'V',
    'B',
    'CS',
    'DZ',
    'DZS',
    'GY',
    'TY',
    'ZS',
  ]

  return own.includes(value) ? 'A' : 'Az'
}

export const getDifficultyFromUrl = (): number | undefined => {
  const difficulty = getHashParams()[HASH_PARAM_KEY_DIFFICULTY]

  return difficulty ? parseInt(difficulty) : undefined
}

export const getGridColClassName = (difficulty: Difficulty) => {
  // workaround for tailwindcss parsing if classname is a literal template
  const className = classNames({
    'grid-cols-3': difficulty === 3,
    'grid-cols-4': difficulty === 4,
    'grid-cols-5': difficulty === 5,
    'grid-cols-6': difficulty === 6,
    'grid-cols-7': difficulty === 7,
    'grid-cols-8': difficulty === 8,
    'grid-cols-9': difficulty === 9,
  })

  return className
}

export const getGridMaxWidthClassName = (difficulty: Difficulty) => {
  // workaround for tailwindcss parsing if classname is a literal template
  const className = classNames({
    'max-w-[240px]': difficulty === 3,
    'max-w-[320px]': difficulty === 4,
    'max-w-[400px]': difficulty === 5,
    'max-w-[480px]': difficulty === 6,
    'max-w-[560px]': difficulty === 7,
    'max-w-[640px]': difficulty === 8,
    'max-w-[720px]': difficulty === 9,
  })

  return className
}
declare global {
  interface Window {
    dataLayer: any
  }
}
export const addGTM = (...props: any[]) => {
  window.dataLayer?.push(props)
  // console.log(window.dataLayer)
}

export const abbreviation = (
  givenValue = 0,
  precision = 1,
  suffixes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
) => {
  const value = givenValue
  const flooredValue = Math.floor(value) || 0
  const suffixNum = Math.floor(
    (`${flooredValue}`.length - (flooredValue < 0 ? 2 : 1)) / 3
  )
  let shortValue =
    suffixNum !== 0
      ? parseFloat((value / Math.pow(1000, suffixNum)).toPrecision(3))
      : value
  if (shortValue % 1 !== 0) {
    shortValue = Number(
      shortValue.toFixed(shortValue < 10 ? precision + 1 : precision)
    )
  }
  return `${shortValue}${
    typeof suffixes === 'string' ? suffixes : suffixes[suffixNum]
  }`
}

export const isLocalhost = () =>
  ['localhost', '192.168.0.18'].includes(window.location.hostname)

export const copyStyle = (sourceNode: HTMLElement, targetNode: HTMLElement) => {
  const computedStyle = window.getComputedStyle(sourceNode)
  Array.from(computedStyle).forEach((key) =>
    targetNode.style.setProperty(
      key,
      computedStyle.getPropertyValue(key),
      computedStyle.getPropertyPriority(key)
    )
  )
}
