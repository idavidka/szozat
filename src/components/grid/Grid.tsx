import classNames from 'classnames'
import { MAX_NUMBER_OF_GUESSES } from '../../constants/constants'
import { getGridMaxWidthClassName } from '../../lib/utils'
import { CharValue, Word } from '../../lib/statuses'
import { CompletedRow } from './CompletedRow'
import { CurrentRow } from './CurrentRow'
import { EmptyRow } from './EmptyRow'
import { Difficulty } from '../../hooks/gameReducer'
import { useCallback } from 'react'
import { KeyValue } from '../../lib/keyboard'

type Props = {
  guesses: Word[]
  currentGuess: Word
  size: { width: number; height: number }
  day: number
  random: number
  difficulty: Difficulty
  full?: boolean
  showCurrentRow?: boolean
  onReplace: (value: CharValue, index?: number) => void
}

export const Grid = ({
  guesses,
  currentGuess,
  day,
  random,
  difficulty,
  size,
  full,
  showCurrentRow,
  onReplace,
}: Props) => {
  const onDrop = useCallback(
    (value: KeyValue, index: number) => {
      onReplace(value, index)
    },
    [onReplace]
  )

  const empties =
    guesses.length < MAX_NUMBER_OF_GUESSES[difficulty] - 1
      ? Array.from(
          Array(
            MAX_NUMBER_OF_GUESSES[difficulty] -
              (showCurrentRow ? 1 : 0) -
              guesses.length
          )
        )
      : []

  const rowHeight = size.height / MAX_NUMBER_OF_GUESSES[difficulty] - 5

  const classes = classNames({
    'grid-flow-row px-1': full,
    'text-xs': rowHeight < 19,
    'text-sm': rowHeight >= 19 && rowHeight < 23,
    'text-base': rowHeight >= 23 && rowHeight < 28,
    'text-lg': rowHeight >= 28,
  })

  return (
    <div
      className={classNames(
        'grid grid-rows-8 gap-1 mx-auto w-full',
        `${getGridMaxWidthClassName(difficulty)} ${classes}`
      )}
      style={
        full
          ? {
              height: `${size.height}px`,
              gridAutoRows: `${rowHeight}px`,
            }
          : {}
      }
    >
      {guesses.map((guess, i) => (
        <CompletedRow
          key={i}
          guess={guess}
          day={day}
          random={random}
          difficulty={difficulty}
        />
      ))}
      {guesses.length < MAX_NUMBER_OF_GUESSES[difficulty] && showCurrentRow && (
        <CurrentRow
          guess={currentGuess}
          difficulty={difficulty}
          onDrop={onDrop}
        />
      )}
      {empties.map((_, i) => (
        <EmptyRow key={i} difficulty={difficulty} />
      ))}
    </div>
  )
}
