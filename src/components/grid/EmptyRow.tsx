import { Cell } from './Cell'

type Props = { difficulty: number }

export const EmptyRow = ({ difficulty }: Props) => {
  const emptyCells = Array.from(Array(difficulty))

  return (
    <div className={`grid grid-cols-${difficulty} gap-1`}>
      {emptyCells.map((_, i) => (
        <Cell key={i} />
      ))}
    </div>
  )
}
