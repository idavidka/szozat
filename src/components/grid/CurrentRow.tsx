import { getGridColClassName } from '../../lib/utils'
import { Word } from '../../lib/statuses'
import { Cell } from './Cell'
import { Difficulty } from '../../hooks/gameReducer'

type Props = {
  guess: Word
  difficulty: Difficulty
}

export const CurrentRow = ({ guess, difficulty }: Props) => {
  const emptyCells = Array.from(Array(difficulty - guess.length))

  return (
    <div
      className={`grid ${getGridColClassName(difficulty)} gap-1  current-row`}
    >
      {guess.map((letter, i) => (
        <Cell key={i} value={letter} isPulsing />
      ))}
      {emptyCells.map((_, i) => (
        <Cell key={i} isPulsing />
      ))}
    </div>
  )
}
