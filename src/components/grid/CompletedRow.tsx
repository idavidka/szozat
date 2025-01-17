import { getGridColClassName } from '../../lib/utils'
import { getGuessStatuses, Word } from '../../lib/statuses'
import { Cell } from './Cell'
import { Difficulty } from '../../hooks/gameReducer'

type Props = {
  guess: Word
  day: number
  random: number
  difficulty: Difficulty
}

export const CompletedRow = ({ guess, day, random, difficulty }: Props) => {
  const statuses = getGuessStatuses(guess, day, random, difficulty)

  return (
    <div className={`grid ${getGridColClassName(difficulty)} gap-1`}>
      {guess.map((letter, i) => (
        <Cell key={i} value={letter} status={statuses[i]} />
      ))}
    </div>
  )
}
