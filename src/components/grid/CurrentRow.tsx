import { getGridColClassName } from '../../lib/utils'
import { Word } from '../../lib/statuses'
import { Cell } from './Cell'
import { Difficulty } from '../../hooks/gameReducer'
import { KeyValue } from '../../lib/keyboard'

type Props = {
  guess: Word
  difficulty: Difficulty
  onDrop?: (value: KeyValue, index: number) => void
}

export const CurrentRow = ({ guess, difficulty, onDrop }: Props) => {
  const emptyCells = Array.from(Array(difficulty - guess.length))

  return (
    <div
      className={`grid ${getGridColClassName(difficulty)} gap-1  current-row`}
    >
      {guess.map((letter, i) => (
        <Cell key={i} value={letter} isPulsing onDrop={onDrop} />
      ))}
      {emptyCells.map((_, i) => (
        <Cell key={i} isPulsing onDrop={onDrop} />
      ))}
    </div>
  )
}
