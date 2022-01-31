import classNames from 'classnames'
import { CharValue, Word } from '../lib/statuses'

export const toWord = (word: string[]): Word => {
  return word.map((letter) => letter.toUpperCase() as CharValue)
}

export const getGridColClassName = (difficulty: number) => {
  // workaround for tailwindcss parsing if classname is a literal template
  const className = classNames({
    'grid-cols-3': difficulty === 3,
    'grid-cols-4': difficulty === 4,
    'grid-cols-5': difficulty === 5,
    'grid-cols-6': difficulty === 6,
    'grid-cols-7': difficulty === 7,
    'grid-cols-8': difficulty === 8,
    'grid-cols-9': difficulty === 9,
  })

  return className
}
