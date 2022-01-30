import Countdown from 'react-countdown'
import { StatBar } from '../stats/StatBar'
import { Histogram } from '../stats/Histogram'
import { GameStats } from '../../lib/localStorage'
import { getShareText, shareStatus } from '../../lib/share'
import { solutionCreator, tomorrow } from '../../lib/words'
import { BaseModal } from './BaseModal'
import { Word } from '../../lib/statuses'
import React, { useCallback } from 'react'

type Props = {
  isOpen: boolean
  handleClose: () => void
  guesses: Word[]
  gameStats: GameStats
  isGameLost: boolean
  isGameWon: boolean
  day?: number
  handleShareCopySuccess: () => void
  handleShareFailure: () => void
  handleNewGameClick: () => void
}

export const StatsModal = ({
  isOpen,
  handleClose,
  guesses,
  gameStats,
  isGameLost,
  isGameWon,
  day,
  handleShareCopySuccess,
  handleShareFailure,
  handleNewGameClick,
}: Props) => {
  const handleShareClick = useCallback(async () => {
    try {
      const { type } = await shareStatus(guesses, isGameLost)
      if (type === 'clipboard') {
        handleShareCopySuccess()
      }
    } catch (e) {
      handleShareFailure()
    }
  }, [guesses, isGameLost, handleShareCopySuccess, handleShareFailure])

  const renderShareText = useCallback((guesses: Word[], lost: boolean) => {
    const text = getShareText(guesses, lost, day)
    const rows = text.split('\n')
    return (
      <p className="text-xs text-left pt-5">
        {rows.map((row, index) => (
          <React.Fragment key={index}>
            {row}
            <br />
          </React.Fragment>
        ))}
      </p>
    )
  }, [day])

  return (
    <BaseModal title="Statisztika" isOpen={isOpen} handleClose={handleClose}>
      <StatBar gameStats={gameStats} />
      {gameStats.totalGames > 0 && (
        <>
          <h4 className="text-lg leading-6 font-medium text-gray-900 dark:text-slate-200">
            A megoldások eloszlása
          </h4>
          <Histogram gameStats={gameStats} />
          {(isGameLost || isGameWon) && (
            <>
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
                {solutionCreator && (
                  <div>
                    <p>A feladvány készítője: {solutionCreator}</p>
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
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  onClick={handleShareClick}
                >
                  Megosztás
                </button>
                <p>
                  Ha a megosztás gomb nem működik, másold ki innen az
                  eredményedet:
                </p>
                {renderShareText(guesses, isGameLost)}
              </div>
            </>
          )}
        </>
      )}
    </BaseModal>
  )
}
