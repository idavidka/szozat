export const VOWEL_CHAR_VALUES = [
  'E',
  'U',
  'I',
  'O',
  'A',
  'Ö',
  'Ü',
  'Ó',
  'Ő',
  'Ú',
  'É',
  'Á',
  'Ű',
  'Í',
]

export const DOUBLE_CONSONANT_CHAR_VALUES = [
  'CS',
  'DZ',
  'GY',
  'LY',
  'NY',
  'SZ',
  'TY',
  'ZS',
]

export const TRIPLE_CONSONANT_CHAR_VALUES = ['DZS']

export const MULTIPLE_CONSONANT_CHAR_VALUES = [
  ...DOUBLE_CONSONANT_CHAR_VALUES,
  ...TRIPLE_CONSONANT_CHAR_VALUES,
]

export const SINGLE_CONSONANT_CHAR_VALUES = [
  'Q',
  'W',
  'R',
  'T',
  'Y',
  'P',
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
]

export const CONSONANT_CHAR_VALUES = [
  ...SINGLE_CONSONANT_CHAR_VALUES,
  ...MULTIPLE_CONSONANT_CHAR_VALUES,
]

export const FOREIGN_CHAR_VALUES = ['Q', 'W', 'Y', 'X']

export const CHAR_VALUES = [
  '-',
  ...VOWEL_CHAR_VALUES,
  ...CONSONANT_CHAR_VALUES,
] as const
