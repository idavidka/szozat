import classNames from 'classnames'
import { MAX_NUMBER_OF_GUESSES } from '../../constants/constants'
import { getGridMaxWidthClassName } from '../../lib/utils'
import { Word } from '../../lib/statuses'
import { CompletedRow } from './CompletedRow'
import { CurrentRow } from './CurrentRow'
import { EmptyRow } from './EmptyRow'

type Props = {
  guesses: Word[]
  currentGuess: Word
  size: { width: number; height: number }
  day: number
  difficulty: number
  full?: boolean
}

export const Grid = ({
  guesses,
  currentGuess,
  day,
  difficulty,
  size,
  full,
}: Props) => {
  const empties =
    guesses.length < MAX_NUMBER_OF_GUESSES[difficulty] - 1
      ? Array.from(
          Array(MAX_NUMBER_OF_GUESSES[difficulty] - 1 - guesses.length)
        )
      : []

  const classes = classNames({
    'grid-flow-row': full,
  })

  const rowHeight = size.height / MAX_NUMBER_OF_GUESSES[difficulty] - 5

  const textSizeClasses = {
    'text-xs': rowHeight < 19,
    'text-sm': rowHeight >= 19 && rowHeight < 23,
    'text-base': rowHeight >= 23 && rowHeight < 28,
    'text-lg': rowHeight >= 28,
  }

  return (
    <div
      className={classNames(
        'grid grid-rows-8 gap-1 mx-auto w-full',
        {
          'px-1': !full,
        },
        textSizeClasses,
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
        <CompletedRow key={i} guess={guess} day={day} difficulty={difficulty} />
      ))}
      {guesses.length < MAX_NUMBER_OF_GUESSES[difficulty] && (
        <CurrentRow guess={currentGuess} difficulty={difficulty} />
      )}
      {empties.map((_, i) => (
        <EmptyRow key={i} difficulty={difficulty} />
      ))}
    </div>
  )
}
