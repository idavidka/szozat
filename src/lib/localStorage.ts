import { shuffle } from 'lodash'
import { isLocalhost } from './utils'
import { ThemeValue } from './theme'
import {
  getDecodedHashParam,
  getHashParams,
  HASH_PARAM_KEY_DIFFICULTY,
  HASH_PARAM_KEY_ID,
} from './hashUtils'
import PKG from '../../package.json'
import { Difficulty, State } from '../hooks/gameReducer'

export const gameKey = 'game'
export const wordKey = 'words'
export const idKey = 'id'

const encrypt = (value: string): string => {
  const buffer = window.btoa(encodeURIComponent(value)).split('')
  const reverseBuffer = buffer.reverse()

  return window.btoa(
    shuffle(buffer).join('') + reverseBuffer.join('') + shuffle(buffer).join('')
  )
}

const decrypt = (value: string): string => {
  const buffer = window.atob(value)
  const length = buffer.length / 3
  const reverseBuffer = buffer.substring(length, length * 2)

  return decodeURIComponent(
    window.atob(reverseBuffer.split('').reverse().join(''))
  )
}

export const getKey = (key: string, version?: string) => {
  return key === 'id' ? key : `${key}-${version ?? PKG.version}`
}

export const setItem = (key: string, value: string, version?: string) => {
  localStorage.setItem(
    getKey(key, version),
    isLocalhost() ? value : encrypt(value)
  )
}

export const getItem = (key: string, version?: string) => {
  const value = localStorage.getItem(getKey(key, version))

  try {
    if (value) {
      JSON.parse(value)
      return value
    }
  } catch (err) {}

  return value && value !== 'NaN' ? decrypt(value) : null
}

export const createId = () => {
  const version = PKG.version.match(
    /(?<major>\d)\.(?<minor>\d)\.(?<patch>\d)/
  )?.groups
  const hashId = getDecodedHashParam(HASH_PARAM_KEY_ID)

  let prevVersion = PKG.version
  if (version && parseInt(version.patch) > 0) {
    prevVersion = [
      version.major,
      version.minor,
      parseInt(version.patch) - 1,
    ].join('.')
  }

  //versioning with loop
  const current = JSON.parse(
    getItem(idKey) ?? getItem(gameKey) ?? getItem(gameKey, prevVersion) ?? '{}'
  )?.id

  const id = hashId || current || Math.random().toString(36).substr(2, 10)

  return id
}

export const createDifficulty = (): Difficulty => {
  const difficulty = parseInt(getHashParams()[HASH_PARAM_KEY_DIFFICULTY] ?? '')

  return (
    difficulty && !isNaN(difficulty) && difficulty >= 3 && difficulty <= 9
      ? difficulty
      : 5
  ) as Difficulty
}

export const loadInitialTheme = (): ThemeValue => {
  const gameState = getItem(gameKey)
  if (gameState) {
    const savedTheme = (JSON.parse(gameState) as State)?.theme

    if (savedTheme) {
      return savedTheme as ThemeValue
    }
  }

  const userMedia = window.matchMedia('(prefers-color-scheme: dark)')
  if (userMedia.matches) {
    return 'dark'
  }

  return 'light' // light theme as the default
}
