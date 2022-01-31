import fs from 'fs'
import { getWordLetters } from '../../src/lib/hungarianWordUtils'
import yargs from 'yargs'
import { shuffle } from 'lodash'

type Arguments = ReturnType<typeof yargs.parse>
const args: Arguments = yargs.parseSync(process.argv)
const TARGET_WORD_LENGTH: number = (args?.length as number) ?? 5
const OUTPUT: string =
  (args?.output as string) ?? 'hungarian-word-letter-list.json'

export const CHAR_VALUES = [
  'Q',
  'W',
  'E',
  'R',
  'T',
  'Y',
  'U',
  'I',
  'O',
  'P',
  'A',
  'S',
  'D',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'Z',
  'X',
  'C',
  'V',
  'B',
  'N',
  'M',
  'Ö',
  'Ü',
  'Ó',
  'Ő',
  'Ú',
  'É',
  'Á',
  'Ű',
  'Í',
  'CS',
  'DZ',
  'DZS',
  'GY',
  'LY',
  'NY',
  'SZ',
  'TY',
  'ZS',
]

// Parse input file
const hungarianWordsText = fs.readFileSync('./src/magyar-szavak.txt').toString()
const hungarianWords = hungarianWordsText
  .split('\n')
  .map((word) => word.toLowerCase().trim())
// Exclude words with special characters
const hungarianWordsOnlyAlphabet = shuffle(hungarianWords).filter((word) => {
  return word
    .toUpperCase()
    .split('')
    .every((letter) => CHAR_VALUES.includes(letter))
})
// Split into letters
const wordLetters = hungarianWordsOnlyAlphabet.map(getWordLetters)
// Reduce the list to words which may have the given number of characters
const candidateWordLetters = wordLetters.filter(
  (word) => word.length === TARGET_WORD_LENGTH
)

// Manually add some words
TARGET_WORD_LENGTH === 5 &&
  candidateWordLetters.push(
    ['p', 'á', 'c', 's', 'ó'],
    ['dzs', 'i', 'h', 'á', 'd'],
    ['c', 'ó', 'r', 'e', 'sz'],
    ['l', 'i', 'm', 'á', 'ny'],
    ['f', 'ő', 'd', 'í', 'j'],
    ['ű', 'r', 'l', 'é', 'ny'],
    ['ny', 'i', 't', 'v', 'a']
  )

// Save to file
const jsonString = JSON.stringify(candidateWordLetters)
fs.writeFileSync(
  `../src/constants/${OUTPUT.replace(/\.(json|txt)$/, '')}.json`,
  jsonString
)

fs.writeFileSync(
  `./src/${OUTPUT.replace(/\.(json|txt)$/, '')}.txt`,
  candidateWordLetters
    .map((candidateWordLetter) => candidateWordLetter.join(''))
    .join('\n')
)
