import { Difficulty } from '../../hooks/gameReducer'
import { getGridColClassName } from '../../lib/utils'
import { Cell } from './Cell'

type Props = { difficulty: Difficulty }

export const EmptyRow = ({ difficulty }: Props) => {
  const emptyCells = Array.from(Array(difficulty))

  return (
    <div className={`grid ${getGridColClassName(difficulty)} gap-1`}>
      {emptyCells.map((_, i) => (
        <Cell key={i} />
      ))}
    </div>
  )
}
