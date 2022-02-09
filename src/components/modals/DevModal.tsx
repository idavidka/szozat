import { solutionCreator, tomorrow } from '../../lib/words'
import { BaseModal } from './BaseModal'
import { Word } from '../../lib/statuses'
import React from 'react'
import classNames from 'classnames'

type Props = {
  isOpen: boolean
  handleClose: () => void
  solution?: Word
}

export const DevModal = ({ isOpen, handleClose, solution }: Props) => {
  const handleReload = () => {
    window.location.reload()
  }

  const handleTruncate = () => {
    Object.keys(localStorage).forEach((itemKey) =>
      localStorage.removeItem(itemKey)
    )
  }

  return (
    <BaseModal
      title={'Fejlesztői modal'}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div
        className={classNames(
          'bg-white dark:bg-slate-500 p-3',
          'text-gray-900 dark:text-slate-200',
          'focus:outline-none mt-2'
        )}
      >
        <div className="ml-2 mt-5 sm:mt-6 columns-2">
          {tomorrow && (
            <div>
              <h5>Feladvány:</h5>
              {solution}
            </div>
          )}
          {solutionCreator && (
            <div>
              <p>A feladvány készítője: {solutionCreator}</p>
            </div>
          )}
        </div>
        <div className="ml-2 mt-5 sm:mt-6">
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={handleReload}
          >
            Oldal újratöltése
          </button>
        </div>
        <div className="ml-2 mt-5 sm:mt-6">
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={handleTruncate}
          >
            Játékadatok törlése
          </button>
        </div>
        <div className="ml-2 mt-5 sm:mt-6" style={{ marginTop: 0 }}></div>
      </div>
    </BaseModal>
  )
}
