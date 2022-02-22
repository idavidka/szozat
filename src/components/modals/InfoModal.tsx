import { Cell } from '../grid/Cell'
import { MAX_NUMBER_OF_GUESSES } from '../../constants/constants'
import { BaseModal, ModalType } from './BaseModal'
import React, { useMemo } from 'react'
import { getWords } from '../../constants/wordlist'
import {
  getArticle,
  getGridColClassName,
  getGridMaxWidthClassName,
} from '../../lib/utils'
import { CharStatus } from '../../lib/statuses'
import { Difficulty } from '../../hooks/gameReducer'
import PKG from '../../../package.json'

type Props = {
  isOpen: boolean
  handleClose: () => void
  handleModal: (state: ModalType) => void
  difficulty: Difficulty
}

export const InfoModal = ({
  isOpen,
  handleModal,
  handleClose,
  difficulty,
}: Props) => {
  const words = useMemo(() => {
    const currentWords = getWords(difficulty)

    if (currentWords.length < 5) {
      return []
    }

    const indexes = [
      0,
      0,
      Math.floor(difficulty / 2) - (difficulty % 2 === 0 ? 1 : 0),
      Math.floor(difficulty / 2) - (difficulty % 2 === 0 ? 1 : 0),
      difficulty - (difficulty > 4 ? 2 : 1),
    ]
    const letters = [
      currentWords[0][indexes[0]],
      currentWords[1][indexes[1]],
      currentWords[2][indexes[2]],
      currentWords[3][indexes[3]],
      currentWords[4][indexes[4]],
    ]

    return [
      {
        word: currentWords[0],
        letter: letters[0],
        text: `${getArticle(letters[0])} ${
          letters[0]
        } betű szerepel a szóban és jó helyen van.`,
        status: 'correct',
      },
      {
        word: currentWords[1],
        letter: letters[1],
        text: `${getArticle(letters[1])} ${
          letters[1]
        } betű szerepel a szóban, jó helyen van, de többször előfordul.`,
        status: 'correct-diff',
      },
      {
        word: currentWords[2],
        letter: letters[2],
        text: `${getArticle(letters[2])} ${
          letters[2]
        } betű szerepel a szóban, de nem jó helyen van.`,
        status: 'present',
      },
      {
        word: currentWords[3],
        letter: letters[3],
        text: `${getArticle(letters[3])} ${
          letters[3]
        } betű szerepel a szóban, de nem jó helyen van és többször előfordul`,
        status: 'present-diff',
      },
      {
        word: currentWords[4],
        letter: letters[4],
        text: `${getArticle(letters[4])} ${
          letters[4]
        } betű nem szerepel a szóban.`,
        status: 'absent',
      },
    ]
  }, [difficulty])

  return (
    <BaseModal
      title="Szabályok"
      subTitle={PKG.version}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <p className="text-sm text-gray-500 dark:text-slate-200">
        Találd ki a napi <b>{difficulty} betűs</b> szót{' '}
        <b>{MAX_NUMBER_OF_GUESSES[difficulty]} tippből</b>! Minden tipp után a
        négyzetek színe jelzi, hogy mennyire kerültél közel a megoldáshoz.
      </p>

      {/* <div className="flex justify-center mb-1 mt-4"> */}
      {words.map(
        ({ word, letter: selectedLetter, text, status }, wordIndex) => (
          <React.Fragment key={wordIndex}>
            <div
              className={`grid ${getGridColClassName(
                difficulty
              )} gap-1 mb-1 mt-4 mx-auto w-full text-lg ${getGridMaxWidthClassName(
                difficulty
              )}`}
            >
              {word.map((letter, letterIndex) => (
                <Cell
                  key={letterIndex}
                  value={letter}
                  status={
                    letter === selectedLetter
                      ? (status as CharStatus)
                      : undefined
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-200">{text}</p>
          </React.Fragment>
        )
      )}
      <div className="text-sm text-gray-500 dark:text-slate-200 mt-3">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-slate-200">
          Használati tippek
        </h3>
        <ul className="list-disc pl-0 ml-2 text-left">
          <li className="mb-2">
            Használd a lenti virtuális vagy a számítógéped billentyűzetét a
            szavak beírásához.
          </li>
          <li>
            Ha virtuális billentyűzeten szeretnél dupla vagy tripla betűt
            beírni, használd a megfelelő betű gombját vagy nyomd meg hosszan az
            adott szimpla betűt.
          </li>
          <li>
            Ha a számítgéped billentyűzetén pötyögs és nem szeretnéd a dupla
            vagy tripla betűt egybeírni, akkor az írás közben tartsd lenyomva a{' '}
            <b>[SHIFT]</b> billentyűt.
          </li>
          <li>
            Betű cseréléséhez csak fogd meg a kívánt betűt és húzd rá a
            lecserélendőre.
          </li>
        </ul>
      </div>
      <button
        tabIndex={-1}
        type="button"
        className="mx-auto mt-2 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none"
        onClick={() => {
          handleModal(false)
          setTimeout(() => {
            handleModal(['about', 'info'])
          }, 500)
        }}
      >
        A játék eredetéről
      </button>
    </BaseModal>
  )
}
