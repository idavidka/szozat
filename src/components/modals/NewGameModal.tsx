import { BaseModal } from './BaseModal'
import { Word } from '../../lib/statuses'
import React from 'react'

type Props = {
  isOpen: boolean
  handleClose: () => void
  handleFailure: () => void
  solution: Word
}

export const NewGameModal = ({
  isOpen,
  solution,
  handleClose,
  handleFailure,
}: Props) => {
  return (
    <BaseModal title="Feladás" isOpen={isOpen} handleClose={handleClose}>
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
          onClick={() => {
            handleFailure()
            handleClose()
          }}
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
    </BaseModal>
  )
}
