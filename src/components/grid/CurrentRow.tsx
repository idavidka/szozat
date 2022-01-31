import { Word } from '../../lib/statuses'
import { Cell } from './Cell'

type Props = {
  guess: Word
  difficulty: number
}

export const CurrentRow = ({ guess, difficulty }: Props) => {
  const emptyCells = Array.from(Array(difficulty - guess.length))

  return (
    <div className={`grid grid-cols-${difficulty} gap-1 current-row`}>
      {guess.map((letter, i) => (
        <Cell key={i} value={letter} />
      ))}
      {emptyCells.map((_, i) => (
        <Cell key={i} />
      ))}
    </div>
  )
}
