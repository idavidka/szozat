import Countdown from 'react-countdown'
import { tomorrow } from '../../lib/words'
import { BaseModal } from './BaseModal'
import { Word } from '../../lib/statuses'
import React, { useState } from 'react'

type Props = {
  isOpen: boolean
  handleClose: () => void
  handleNewGameClick: () => void
  solution: Word
}

export const NewGameModal = ({
  isOpen,
  solution,
  handleClose,
  handleNewGameClick,
}: Props) => {
  const [giveUp, setGiveUp] = useState(false)
  return (
    <BaseModal
      title={!giveUp ? 'Feladás' : 'Új játék'}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      {!giveUp && (
        <>
          <h4 className="text-lg leading-6 font-medium text-gray-900 dark:text-slate-200">
            Biztos vagy benne, hogy feladod?
          </h4>
          <div className="mt-5 sm:mt-6">
            Ha az igen gombra kattintasz, megjelenik a mai feladvány
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-lime-600 text-base font-medium text-white hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 sm:text-sm"
              onClick={() => setGiveUp(true)}
            >
              Igen!
            </button>
            <button
              type="button"
              className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
              onClick={handleClose}
            >
              Nem!
            </button>
          </div>
        </>
      )}
      {giveUp && (
        <>
          <h4 className="text-lg leading-6 font-medium text-gray-900 dark:text-slate-200">
            A mai szó
          </h4>
          <div className="mt-5 sm:mt-6 columns-2"></div>
          <div>
            <h5>{isOpen ? solution : '-'}</h5>
          </div>
          <div className="mt-5 sm:mt-6 columns-2">
            {tomorrow && (
              <div>
                <h5>Következő feladvány:</h5>
                <Countdown
                  className="text-lg font-medium text-gray-900"
                  date={tomorrow}
                  daysInHours={true}
                />
              </div>
            )}
          </div>
          <div className="mt-5 sm:mt-6" style={{ marginTop: 0 }}>
            <button
              type="button"
              className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={handleNewGameClick}
            >
              Most akarom!
            </button>
          </div>
        </>
      )}
    </BaseModal>
  )
}
