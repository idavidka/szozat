import { MAX_NUMBER_OF_GUESSES } from '../../constants/constants'
import { Word } from '../../lib/statuses'
import { CompletedRow } from './CompletedRow'
import { CurrentRow } from './CurrentRow'
import { EmptyRow } from './EmptyRow'

type Props = {
  guesses: Word[]
  currentGuess: Word
  // size: { width: number; height: number }
  day: number
  difficulty: number
}

export const Grid = ({ guesses, currentGuess, day, difficulty }: Props) => {
  const empties =
    guesses.length < MAX_NUMBER_OF_GUESSES - 1
      ? Array.from(Array(MAX_NUMBER_OF_GUESSES - 1 - guesses.length))
      : []

  return (
    <div
      className={`grid grid-rows-8 gap-1 mx-auto p-2 w-full max-w-[${
        difficulty * 60
      }px]`}
    >
      {guesses.map((guess, i) => (
        <CompletedRow key={i} guess={guess} day={day} difficulty={difficulty} />
      ))}
      {guesses.length < MAX_NUMBER_OF_GUESSES && (
        <CurrentRow guess={currentGuess} difficulty={difficulty} />
      )}
      {empties.map((_, i) => (
        <EmptyRow key={i} difficulty={difficulty} />
      ))}
    </div>
  )
}
