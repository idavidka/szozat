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

export const getGridMaxWidthClassName = (difficulty: number) => {
  // workaround for tailwindcss parsing if classname is a literal template
  const className = classNames({
    'max-w-[240px]': difficulty === 3,
    'max-w-[320px]': difficulty === 4,
    'max-w-[400px]': difficulty === 5,
    'max-w-[480px]': difficulty === 6,
    'max-w-[560px]': difficulty === 7,
    'max-w-[640px]': difficulty === 8,
    'max-w-[720px]': difficulty === 9,
  })

  return className
}
declare global {
  interface Window {
    dataLayer: any
  }
}
export const addGTM = (...props: any[]) => {
  window.dataLayer?.push(props)
  // console.log(window.dataLayer)
}

export const isLocalhost = () => window.location.hostname === 'localhost'
