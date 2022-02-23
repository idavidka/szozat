import moment from 'moment'
import { MAX_NUMBER_OF_GUESSES } from '../constants/constants'
import { Difficulty } from '../hooks/gameReducer'
import { CharStatus, getGuessStatuses, Word } from './statuses'
import { getCurrentWord, getRandomWord } from './words'
import Konva from 'konva'
import { ThemeValue } from './theme'
import { range } from 'lodash'

export const getScreenShot = (
  theme: ThemeValue,
  guesses: Word[],
  lost: boolean,
  day: number,
  random: number,
  difficulty: Difficulty,
  solution?: Word
) => {
  const emptyColors: Record<
    ThemeValue,
    { border: string; background: string }
  > = {
    dark: {
      background: '#334155',
      border: '#64748b',
    },
    light: {
      background: '#e2e8f0',
      border: '#64748b',
    },
  }
  const colors: Record<CharStatus, string> = {
    present: '#eab308',
    'present-diff': '#ca8a04',
    correct: '#21c55d',
    'correct-diff': '#16a349',
    absent: '#94a4b8',
  }
  const padding = 3
  const itemSize = { w: 40, h: 32 }
  const rowSize = {
    w: difficulty * itemSize.w + (difficulty - 1) * padding,
    h: itemSize.h,
  }
  const canvasSize = {
    w: rowSize.w + 2 * padding,
    h:
      rowSize.h * MAX_NUMBER_OF_GUESSES[difficulty] +
      (MAX_NUMBER_OF_GUESSES[difficulty] - 1) * padding +
      2 * padding,
  }

  var stage = new Konva.Stage({
    container: document.createElement('div'),
    width: canvasSize.w,
    height: canvasSize.h,
  })

  var layer = new Konva.Layer()
  stage.add(layer)

  var stageRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: canvasSize.w,
    height: canvasSize.h,
    fill: theme === 'dark' ? '#1f2937' : '#ffffff',
  })
  layer.add(stageRect)

  range(0, MAX_NUMBER_OF_GUESSES[difficulty]).forEach((i) => {
    const guess = guesses[i] ?? range(i, difficulty)
    const status = guess
      ? getGuessStatuses(guess, day, random, difficulty)
      : null

    guess.forEach((letter, j) => {
      const fill = status ? colors[status[j]] : emptyColors[theme].background
      var stageRect = new Konva.Rect({
        x: padding + j * (itemSize.w + padding),
        y: padding + i * (rowSize.h + padding),
        width: itemSize.w,
        height: itemSize.h,
        fill,
        cornerRadius: 5,
      })
      layer.add(stageRect)
    })
  })

  console.log('ASD', {
    theme,
    padding,
    itemSize,
    rowSize,
    canvasSize,
    im: stage.toCanvas(),
  })

  return stage.toCanvas()
}

export const getShareText = (
  guesses: Word[],
  lost: boolean,
  day: number,
  random: number,
  difficulty: Difficulty,
  solution?: Word
) => {
  const { solutionIndex, solutionCreator } =
    random > -1
      ? getRandomWord(random, difficulty)
      : getCurrentWord(day, difficulty)

  const identifier =
    solutionCreator !== undefined
      ? 'Egyéni feladvány: ' + solutionCreator
      : solutionIndex +
        '. nap, ' +
        moment('2022-01-01').add(solutionIndex, 'days').format('YYYY. MM. DD.')
  const text =
    'Szózat - ' +
    identifier +
    ' - ' +
    (lost ? 'X' : guesses.length) +
    `/${MAX_NUMBER_OF_GUESSES[difficulty]}\n${
      solution ? `Megfejtés: ${solution?.join('')}` : ''
    }\n\n` +
    generateEmojiGrid(guesses, day, random, difficulty) +
    '\n\n' +
    window.location.origin
  return text
}

export const shareStatus = async (
  guesses: Word[],
  lost: boolean,
  day: number,
  random: number,
  difficulty: Difficulty,
  solution?: Word
) => {
  const text = getShareText(guesses, lost, day, random, difficulty, solution)
  if (navigator?.share != null) {
    await navigator.share({ text })
    return { type: 'share' as const }
  }
  if (navigator?.clipboard?.writeText != null) {
    await navigator.clipboard.writeText(text)
    return { type: 'clipboard' as const }
  }
  throw new Error('No sharing methods are available')
}

export const generateEmojiGrid = (
  guesses: Word[],
  day: number,
  random: number,
  difficulty: Difficulty
) => {
  return guesses
    .map((guess) => {
      const status = getGuessStatuses(guess, day, random, difficulty)
      return guess
        .map((letter, i) => {
          switch (status[i]) {
            case 'correct':
            case 'correct-diff':
              return '🟩'
            case 'present':
            case 'present-diff':
              return '🟨'
            default:
              return '⬜'
          }
        })
        .join('')
    })
    .join('\n')
}
