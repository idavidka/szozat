import { Word } from '../lib/statuses'
import { toWord } from '../lib/utils'

import words3 from './hungarian-puzzles-3.json'
import words4 from './hungarian-puzzles-4.json'
import words5 from './hungarian-puzzles-5.json'
import words6 from './hungarian-puzzles-6.json'
import words7 from './hungarian-puzzles-7.json'
import words8 from './hungarian-puzzles-8.json'
import words9 from './hungarian-puzzles-9.json'

import randomWords3 from './hungarian-word-letter-list-3.json'
import randomWords4 from './hungarian-word-letter-list-4.json'
import randomWords5 from './hungarian-word-letter-list-5.json'
import randomWords6 from './hungarian-word-letter-list-6.json'
import randomWords7 from './hungarian-word-letter-list-7.json'
import randomWords8 from './hungarian-word-letter-list-8.json'
import randomWords9 from './hungarian-word-letter-list-9.json'

const words: Record<number, string[][]> = {
  3: words3,
  4: words4,
  5: words5,
  6: words6,
  7: words7,
  8: words8,
  9: words9,
}

const randomWords: Record<number, string[][]> = {
  3: randomWords3,
  4: randomWords4,
  5: randomWords5,
  6: randomWords6,
  7: randomWords7,
  8: randomWords8,
  9: randomWords9,
}

export const getWords = (difficulty: number): Word[] =>
  (words[difficulty] ?? words[5]).map(toWord)

export const getAllWords = (difficulty: number): Word[] =>
  (randomWords[difficulty] ?? randomWords[5]).map(toWord)
