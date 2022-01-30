import { getGuessStatuses, Word } from '../../lib/statuses'
import { Cell } from './Cell'

type Props = {
  guess: Word
  day: number
}

export const CompletedRow = ({ guess, day }: Props) => {
  const statuses = getGuessStatuses(guess, day)

  return (
    <div className="grid grid-cols-5 gap-1">
      {guess.map((letter, i) => (
        <Cell key={i} value={letter} status={statuses[i]} />
      ))}
    </div>
  )
}
