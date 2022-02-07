import fs from 'fs'
import { getWordLetters } from '../../src/lib/hungarianWordUtils'
import yargs from 'yargs'
import { CHAR_VALUES } from './constants'

type Arguments = ReturnType<typeof yargs.parse>
const args: Arguments = yargs.parseSync(process.argv)
const TARGET_WORD_LENGTH: number = (args?.length as number) ?? 5
const OUTPUT: string = (args?.output as string) ?? 'hungarian-puzzles.json'

// Parse input file
const hungarianWordsText = fs
  .readFileSync(`./src/selected/selected-${TARGET_WORD_LENGTH}.txt`)
  .toString()
const hungarianWords = hungarianWordsText
  .split('\n')
  .map((word) => word.toLowerCase().trim())
// Exclude words with special characters
const hungarianWordsOnlyAlphabet = hungarianWords.filter((word) => {
  return word
    .toUpperCase()
    .split('')
    .every((letter) => CHAR_VALUES.includes(letter))
})
// Split into letters
const wordLetters = hungarianWordsOnlyAlphabet.map(getWordLetters)

fs.writeFileSync(
  `../public/words/${OUTPUT.replace(
    /(-\d)?\.(json|txt)$/,
    ''
  )}-${TARGET_WORD_LENGTH}.json`,
  JSON.stringify(wordLetters)
)
