import { getCurrentWord, getLetterCount, getRandomWord } from './words'
import { CHAR_VALUES, MULTIPLE_CONSONANT_CHAR_VALUES } from './wordCommons'
import { Difficulty } from '../hooks/gameReducer'

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
  random: number,
  difficulty: Difficulty
): { [key: string]: CharStatus } => {
  const { solution } =
    random > -1
      ? getRandomWord(random, difficulty)
      : getCurrentWord(day, difficulty)
  const charObj: { [key: string]: CharStatus } = {}

  const solutionCount = getLetterCount(solution)

  guesses.forEach((word, index) => {
    const wordCount = getLetterCount(word)
    word.forEach((letter, i) => {
      if (!solution?.includes(letter)) {
        // make status absent
        return (charObj[letter] = 'absent')
      }

      if (letter === solution[i]) {
        //make status correct
        return (charObj[letter] =
          ['present', 'correct'].includes(charObj[letter]) ||
          wordCount[letter] >= solutionCount[letter]
            ? 'correct'
            : 'correct-diff')
      }

      if (!['correct', 'correct-diff'].includes(charObj[letter])) {
        //make status present
        return (charObj[letter] =
          charObj[letter] === 'present' ||
          wordCount[letter] >= solutionCount[letter]
            ? 'present'
            : 'present-diff')
      }
    })
  })

  return charObj
}

export const getGuessStatuses = (
  guess: Word,
  day: number,
  random: number,
  difficulty: Difficulty
): CharStatus[] => {
  const { solution } =
    random > -1
      ? getRandomWord(random, difficulty)
      : getCurrentWord(day, difficulty)

  if (!solution) {
    return []
  }

  const solutionCharsTaken = solution.map((_) => false)

  const statuses: CharStatus[] = Array.from(Array(guess.length))

  const solutionCount = getLetterCount(solution)
  const guessCount = getLetterCount(guess)

  // handle all correct cases first
  guess.forEach((letter, i) => {
    if (letter === solution[i]) {
      statuses[i] =
        solutionCount[letter] > guessCount[letter] ? 'correct-diff' : 'correct'
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
        solutionCount[letter] > guessCount[letter] ? 'present-diff' : 'present'
      solutionCharsTaken[indexOfPresentChar] = true
      return
    } else {
      statuses[i] = 'absent'
      return
    }
  })

  return statuses
}
