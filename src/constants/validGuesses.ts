import { Word } from '../lib/statuses'
import { toWord } from './utils'

import words3 from './hungarian-word-letter-list-3.json'
import words4 from './hungarian-word-letter-list-4.json'
import words5 from './hungarian-word-letter-list-5.json'
import words6 from './hungarian-word-letter-list-6.json'
import words7 from './hungarian-word-letter-list-7.json'
import words8 from './hungarian-word-letter-list-8.json'
import words9 from './hungarian-word-letter-list-9.json'

const words: Record<number, string[][]> = {
  3: words3,
  4: words4,
  5: words5,
  6: words6,
  7: words7,
  8: words8,
  9: words9,
}

export const getValidGuesses = (difficulty: number): Word[] =>
  (words[difficulty] ?? words[5]).map(toWord)
