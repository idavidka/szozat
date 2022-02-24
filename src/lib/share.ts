import moment from 'moment'
import { MAX_NUMBER_OF_GUESSES } from '../constants/constants'
import { Difficulty } from '../hooks/gameReducer'
import { CharStatus, getGuessStatuses, Word } from './statuses'
import { getCurrentWord, getRandomWord } from './words'
import Konva from 'konva'
import { ThemeValue } from './theme'
import { range } from 'lodash'
import { clipSquare } from './utils'

export const getScreenShot = (
  theme: ThemeValue,
  guesses: Word[],
  day: number,
  random: number,
  difficulty: Difficulty
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
  const radius = 20
  const padding = 20
  const itemSize = { w: 150, h: 120, p: 12 }
  const rowSize = {
    w: difficulty * itemSize.w + (difficulty - 1) * itemSize.p,
    h: itemSize.h,
  }
  const canvasSize = {
    w: rowSize.w + 2 * padding,
    h:
      rowSize.h * MAX_NUMBER_OF_GUESSES[difficulty] +
      (MAX_NUMBER_OF_GUESSES[difficulty] - 1) * itemSize.p +
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
    const guess = guesses[i] ?? range(0, difficulty)
    const status =
      guesses[i] && getGuessStatuses(guesses[i], day, random, difficulty)

    guess.forEach((letter, j) => {
      const fill = status
        ? colors[status[j].replace('-diff', '') as CharStatus]
        : emptyColors[theme].border
      const coord = {
        x: padding + j * (itemSize.w + itemSize.p),
        y: padding + i * (rowSize.h + itemSize.p),
      }
      var primaryRect = new Konva.Rect({
        ...coord,
        width: itemSize.w,
        height: itemSize.h,
        fill,
        // stroke: status ? undefined : emptyColors[theme].border,
        // strokeWidth: status ? 0 : itemSize.w / 20,
      })

      const group = new Konva.Group({
        clipFunc: (ctx) =>
          clipSquare(ctx, coord.x, coord.y, itemSize.w, itemSize.h, radius),
      })

      group.add(primaryRect)

      if (!status) {
        const borderWidth = status ? 0 : itemSize.w / 20
        var innerRect = new Konva.Rect({
          x: coord.x + borderWidth,
          y: coord.y + borderWidth,
          width: itemSize.w - borderWidth * 2,
          height: itemSize.h - borderWidth * 2,
          fill: emptyColors[theme].background,
          cornerRadius: radius * 0.5,
          // stroke: status ? undefined : emptyColors[theme].border,
          // strokeWidth: status ? 0 : itemSize.w / 20,
        })
        group.add(innerRect)
      }

      const secondaryFill =
        status && ['correct-diff', 'present-diff'].includes(status[j])
          ? colors[status[j]]
          : null
      if (secondaryFill) {
        const secondaryRect = new Konva.Line({
          points: [
            coord.x + itemSize.w,
            coord.y,
            coord.x + itemSize.w,
            coord.y + itemSize.h,
            coord.x,
            coord.y + itemSize.h,
          ],
          fill: secondaryFill,
          closed: true,
        })
        group.add(secondaryRect)
      }

      if (typeof letter === 'string') {
        var content = new Konva.Text({
          x: coord.x + itemSize.w / 2,
          y: coord.y + itemSize.h / 2 + itemSize.p / 2,
          text: letter,
          fontSize: itemSize.h / 2,
          fontFamily: 'Arial',
          fill: '#ffffff',
        })
        content.offsetX(content.width() / 2)
        content.offsetY(content.height() / 2)

        group.add(content)
      }

      layer.add(group)
    })
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
  theme: ThemeValue,
  guesses: Word[],
  lost: boolean,
  day: number,
  random: number,
  difficulty: Difficulty,
  type: 'status' | 'screenshot',
  solution?: Word
) => {
  const content =
    type === 'screenshot'
      ? getScreenShot(theme, guesses, day, random, difficulty)
      : getShareText(guesses, lost, day, random, difficulty, solution)

  if (navigator?.share != null) {
    if (typeof content === 'string') {
      await navigator.share({
        title: 'Megoldottam',
        text: content,
      })
      return { type: 'share' as const }
    }
    // if (typeof content === 'object') {
    //   const image = await new Promise<Blob>((resolve, reject) => {
    //     content.toBlob(
    //       (blob) => {
    //         if (blob) {
    //           resolve(blob)
    //         } else {
    //           reject()
    //         }
    //       },
    //       'image/jpeg',
    //       1.5
    //     )
    //   })

    //   const file = new File([image], `jatek-${random > 0 ? random : day}.png`, {
    //     type: image.type,
    //   })
    //   var filesArray = [file]

    //   await navigator.share({
    //     files: filesArray,
    //   })
    //   return { type: 'share' as const }
    // }
  }

  if (navigator?.clipboard?.writeText != null) {
    if (typeof content === 'string') {
      await navigator.clipboard.writeText(content)
      return { type: 'clipboard' as const }
    }

    if (typeof content === 'object') {
      const image = await new Promise<Blob>((resolve, reject) => {
        content.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject()
          }
        })
      })

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': image,
        }),
      ])
      return { type: 'screenshot' as const }
    }
  }

  throw new Error('No sharing methods are available')
}

export const generateEmojiGrid = (
  guesses: Word[],
  day: number,
  random: number,
  difficulty: Difficulty
) => {
  return range(0, MAX_NUMBER_OF_GUESSES[difficulty])
    .map((i) => {
      const guess = guesses[i] ?? range(0, difficulty)
      const status =
        guesses[i] && getGuessStatuses(guesses[i], day, random, difficulty)
      return guess
        .map((letter, j) => {
          switch (status?.[j]) {
            case 'correct':
            case 'correct-diff':
              return '🟩'
            case 'present':
            case 'present-diff':
              return '🟨'
            case 'absent':
              return '⬜'
            default:
              return '⬛'
          }
        })
        .join('')
    })
    .join('\n')
}
