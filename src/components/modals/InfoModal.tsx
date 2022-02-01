import { Cell } from '../grid/Cell'
import { MAX_NUMBER_OF_GUESSES } from '../../constants/constants'
import { BaseModal } from './BaseModal'
import { useMemo } from 'react'
import { getWords } from '../../constants/wordlist'
import { getGridColClassName } from '../../constants/utils'

type Props = {
  isOpen: boolean
  handleClose: () => void
  difficulty: number
}
export const InfoModal = ({ isOpen, handleClose, difficulty }: Props) => {
  const words = useMemo(() => {
    const currentWords = getWords(difficulty)
    return [currentWords[0], currentWords[1], currentWords[2]]
  }, [difficulty])

  const highlights = useMemo(() => {
    const indexes = [
      0,
      Math.floor(difficulty / 2) - (difficulty % 2 === 0 ? 1 : 0),
      difficulty - (difficulty > 4 ? 2 : 1),
    ]
    const letters = [
      words[0][indexes[0]],
      words[1][indexes[1]],
      words[2][indexes[2]],
    ]

    return { indexes, letters }
  }, [difficulty, words])

  return (
    <BaseModal title="Szabályok" isOpen={isOpen} handleClose={handleClose}>
      <p className="text-sm text-gray-500 dark:text-slate-200">
        Találd ki a napi <b>{difficulty} betűs</b> szót{' '}
        <b>{MAX_NUMBER_OF_GUESSES[difficulty]} tippből</b>! Minden tipp után a
        négyzetek színe jelzi, hogy mennyire kerültél közel a megoldáshoz.
      </p>

      {/* <div className="flex justify-center mb-1 mt-4"> */}
      <div
        className={`grid ${getGridColClassName(difficulty)} gap-1 mb-1 mt-4`}
      >
        {words[0].map((letter, index) => (
          <Cell
            key={index}
            value={letter}
            status={index === highlights.indexes[0] ? 'correct' : undefined}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-200">
        Az {highlights.letters[0]} betű szerepel a szóban és jó helyen van.
      </p>

      <div
        className={`grid ${getGridColClassName(difficulty)} gap-1 mb-1 mt-4`}
      >
        {words[1].map((letter, index) => (
          <Cell
            key={index}
            value={letter}
            status={index === highlights.indexes[1] ? 'present' : undefined}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-200">
        Az {highlights.letters[1]} betű szerepel a szóban, de nem jó helyen van.
      </p>

      <div
        className={`grid ${getGridColClassName(difficulty)} gap-1 mb-1 mt-4`}
      >
        {words[2].map((letter, index) => (
          <Cell
            key={index}
            value={letter}
            status={index === highlights.indexes[2] ? 'absent' : undefined}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-200">
        Az {highlights.letters[2]} betű nem szerepel a szóban.
      </p>
      <p className="text-sm text-gray-500 dark:text-slate-200 mt-3">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-slate-200">
          Használati tippek
        </h3>
        <ul className="list-disc pl-0 ml-2 text-left">
          <li className="mb-2">
            Használd a lenti virtuális vagy a számítógéped billentyűzetét a
            szavak beírásához.
          </li>
          <li>
            Dupla vagy tripla betűk beírásához nyomd meg hosszan a megfelelő
            szimpla betűt vagy használd a számítógéped <b>[SHIFT]</b>{' '}
            billentyűzejét.
          </li>
        </ul>
      </p>
    </BaseModal>
  )
}
