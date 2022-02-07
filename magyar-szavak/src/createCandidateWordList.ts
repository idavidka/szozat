import fs from 'fs'
import { getWordLetters } from '../../src/lib/hungarianWordUtils'
import yargs from 'yargs'
import {
  CHAR_VALUES,
  CONSONANT_CHAR_VALUES,
  FOREIGN_CHAR_VALUES,
  MULTIPLE_CONSONANT_CHAR_VALUES,
  VOWEL_CHAR_VALUES,
} from './constants'
import { reverse, shuffle } from 'lodash'

type Arguments = ReturnType<typeof yargs.parse>
const args: Arguments = yargs.parseSync(process.argv)
const TARGET_WORD_LENGTH: number = (args?.length as number) ?? 5
const GENERATE_SELECTED: boolean = args?.selected ? true : false
const GENERATE_RANDOM: boolean = args?.random ? true : false
const OUTPUT_LIST: string =
  (args?.output as string) ?? 'hungarian-word-letter-list.json'
const OUTPUT_PUZZLE: string =
  (args?.output as string) ?? 'hungarian-puzzles.json'
const OUTPUT_PUZZLE_RANDOM: string =
  (args?.output as string) ?? 'hungarian-puzzles-all.json'

// Parse input file
const hungarianWordsText = fs.readFileSync('./src/magyar-szavak.txt').toString() // [].join('\n')
const hungarianWordsExtraText = fs
  .readFileSync('./src/magyar-szavak-extra.txt')
  .toString() // [].join('\n')
const hungarianWords = hungarianWordsText
  .split('\n')
  .map((word) => word.toLowerCase().trim())

const hungarianWordsExtra = hungarianWordsExtraText
  .split('\n')
  .map((word) => word.toLowerCase().trim())

// Exclude words with special characters
const hungarianWordsOnlyAlphabet = hungarianWords.filter((word) => {
  const wordUpperCase = word.toUpperCase()

  return wordUpperCase.split('').every((letter) => CHAR_VALUES.includes(letter))
})
const hungarianWordsExtraOnlyAlphabet = hungarianWordsExtra.filter((word) => {
  const wordUpperCase = word.toUpperCase()

  return wordUpperCase.split('').every((letter) => CHAR_VALUES.includes(letter))
})
// Split into letters

const shorterWords = hungarianWordsOnlyAlphabet.filter((word) => {
  const wordLength = getWordLetters(word).length
  return (
    wordLength < TARGET_WORD_LENGTH &&
    wordLength <
      (TARGET_WORD_LENGTH <= 3 ? 3 : Math.ceil(TARGET_WORD_LENGTH / 2))
  )
})

const words = hungarianWordsOnlyAlphabet.filter((word) => {
  // exclude words not having same length
  return getWordLetters(word).length === TARGET_WORD_LENGTH
})
const wordsExtra = hungarianWordsExtraOnlyAlphabet.filter((word) => {
  // exclude words not having same length
  return getWordLetters(word).length === TARGET_WORD_LENGTH
})

const wordsExcludingUnnecessary = words.filter((word) => {
  const wordUpperCase = word.toUpperCase()
  // exlude monograms
  if (
    new RegExp(`^[${CONSONANT_CHAR_VALUES.join('')}]+$`).test(wordUpperCase) ||
    new RegExp(`^[${VOWEL_CHAR_VALUES.join('')}]+$`).test(wordUpperCase)
  ) {
    return false
  }

  // exlude words containing foreign char if not in a multiple consonant
  if (
    new RegExp(`[${FOREIGN_CHAR_VALUES.join('')}]`).test(
      wordUpperCase.replace(
        new RegExp(`(${MULTIPLE_CONSONANT_CHAR_VALUES.join('|')})`),
        ''
      )
    )
  ) {
    return false
  }

  return getWordLetters(word).length === TARGET_WORD_LENGTH
})

const wordsExtraExcludingUnnecessary = wordsExtra.filter((word) => {
  const wordUpperCase = word.toUpperCase()
  // exlude monograms
  if (
    new RegExp(`^[${CONSONANT_CHAR_VALUES.join('')}]+$`).test(wordUpperCase) ||
    new RegExp(`^[${VOWEL_CHAR_VALUES.join('')}]+$`).test(wordUpperCase)
  ) {
    return false
  }

  // exlude words containing foreign char if not in a multiple consonant
  if (
    new RegExp(`[${FOREIGN_CHAR_VALUES.join('')}]`).test(
      wordUpperCase.replace(
        new RegExp(`(${MULTIPLE_CONSONANT_CHAR_VALUES.join('|')})`),
        ''
      )
    )
  ) {
    return false
  }

  return getWordLetters(word).length === TARGET_WORD_LENGTH
})

console.log('Debug', words.length, wordsExtra.length)
console.log(
  'Debug',
  wordsExcludingUnnecessary.length,
  wordsExtraExcludingUnnecessary.length
)

const shorterWordsInSelectedWords = wordsExcludingUnnecessary.filter((word) =>
  shorterWords.find(
    (shorterWord) =>
      word.includes(shorterWord + 'jé') ||
      word.includes(shorterWord + 'i') ||
      word.includes(shorterWord + 'é') ||
      word.includes(shorterWord)
  )
)

const wordsExcludingShortens = wordsExcludingUnnecessary.filter(
  (word) => !shorterWordsInSelectedWords.includes(word)
)

const wordLetters = words.concat(wordsExtra).map(getWordLetters)
const selectedWordLetters = shuffle(reverse(shuffle(wordsExcludingShortens)))
  .slice(0, 500)
  .map(getWordLetters)
const selectedWordForRandomLetters = shuffle(
  reverse(shuffle(wordsExcludingUnnecessary))
).map(getWordLetters)

console.log('Result', {
  words: words.length,
  shorterWords: shorterWords.length,
  wordsExcludingNames: wordsExcludingUnnecessary.length,
  wordsExcludingShortens: wordsExcludingShortens.length,
  wordsExtra: wordsExtra.length,
  wordLetters: wordLetters.length,
  selectedWordLetters: selectedWordLetters.length,
  selectedWordForRandomLetters: selectedWordForRandomLetters.length,
})

if (true) {
  // Save to file
  const jsonString = JSON.stringify(wordLetters)
  fs.writeFileSync(
    `../public/words/${OUTPUT_LIST.replace(
      /(-\d)?\.(json|txt)$/,
      ''
    )}-${TARGET_WORD_LENGTH}.json`,
    jsonString
  )

  if (GENERATE_SELECTED) {
    fs.writeFileSync(
      `./src/selected/selected-${TARGET_WORD_LENGTH}.txt`,
      selectedWordLetters
        .map((selectedWordLetter) => selectedWordLetter.join(''))
        .join('\n')
    )

    fs.writeFileSync(
      `../public/words/${OUTPUT_PUZZLE.replace(
        /(-\d)?\.(json|txt)$/,
        ''
      )}-${TARGET_WORD_LENGTH}.json`,
      JSON.stringify(selectedWordLetters)
    )
  }

  if (GENERATE_RANDOM) {
    fs.writeFileSync(
      `./src/random/random-${TARGET_WORD_LENGTH}.txt`,
      selectedWordForRandomLetters
        .map((selectedRandomWordLetter) => selectedRandomWordLetter.join(''))
        .join('\n')
    )

    fs.writeFileSync(
      `../public/words/${OUTPUT_PUZZLE_RANDOM.replace(
        /(-\d)?\.(json|txt)$/,
        ''
      )}-${TARGET_WORD_LENGTH}.json`,
      JSON.stringify(selectedWordForRandomLetters)
    )
  }
}
