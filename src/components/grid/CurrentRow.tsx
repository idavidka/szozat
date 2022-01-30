import { Word } from '../../lib/statuses'
import { Cell } from './Cell'

type Props = {
  guess: Word
}

export const CurrentRow = ({ guess }: Props) => {
  const emptyCells = Array.from(Array(5 - guess.length))

  return (
    <div className="grid grid-cols-5 gap-1 current-row">
      {guess.map((letter, i) => (
        <Cell key={i} value={letter} />
      ))}
      {emptyCells.map((_, i) => (
        <Cell key={i} />
      ))}
    </div>
  )
}
