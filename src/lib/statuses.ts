import { getCurrentWord, getLetterCount } from './words'
import { CHAR_VALUES, MULTIPLE_CONSONANT_CHAR_VALUES } from './wordCommons'

export type CharStatus =
  | 'absent'
  | 'present'
  | 'correct'
  | 'present-diff'
  | 'correct-diff'

export type CharValue = typeof CHAR_VALUES[number]

export type Word = readonly CharValue[]

export function isCharValue(value: string): value is CharValue {
  return CHAR_VALUES.includes(value as any)
}

export function isMultipleCharValue(value: string): value is CharValue {
  return MULTIPLE_CONSONANT_CHAR_VALUES.includes(value as any)
}

export const getStatuses = (
  guesses: Word[],
  day: number,
  difficulty: number
): { [key: string]: CharStatus } => {
  const { solution } = getCurrentWord(day, difficulty)
  const charObj: { [key: string]: CharStatus } = {}

  guesses.forEach((word) => {
    console.log('ASD', solution, word, charObj)
    word.forEach((letter, i) => {
      if (!solution.includes(letter)) {
        // make status absent
        return (charObj[letter] = 'absent')
      }

      if (letter === solution[i]) {
        //make status correct
        return (charObj[letter] = 'absent')
      }

      if (charObj[letter] !== 'correct') {
        //make status present
        return (charObj[letter] = 'present')
      }
    })
  })

  return charObj
}

export const getGuessStatuses = (
  guess: Word,
  day: number,
  difficulty: number
): CharStatus[] => {
  const { solution } = getCurrentWord(day, difficulty)
  const solutionCharsTaken = solution.map((_) => false)

  const statuses: CharStatus[] = Array.from(Array(guess.length))

  const solutionCount = getLetterCount(solution)
  const guessCount = getLetterCount(guess)

  // handle all correct cases first
  guess.forEach((letter, i) => {
    if (letter === solution[i]) {
      statuses[i] =
        solutionCount[letter] !== guessCount[letter]
          ? 'correct-diff'
          : 'correct'
      solutionCharsTaken[i] = true
      return
    }
  })

  guess.forEach((letter, i) => {
    if (statuses[i]) return

    if (!solution.includes(letter)) {
      // handles the absent case
      statuses[i] = 'absent'
      return
    }

    // now we are left with "present"s
    const indexOfPresentChar = solution.findIndex(
      (x, index) => x === letter && !solutionCharsTaken[index]
    )

    if (indexOfPresentChar > -1) {
      statuses[i] =
        solutionCount[letter] !== guessCount[letter]
          ? 'present-diff'
          : 'present'
      solutionCharsTaken[indexOfPresentChar] = true
      return
    } else {
      statuses[i] = 'absent'
      return
    }
  })

  return statuses
}
