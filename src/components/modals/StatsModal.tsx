import Countdown from 'react-countdown'
import { StatBar } from '../stats/StatBar'
import { Histogram } from '../stats/Histogram'
import { GameStats } from '../../lib/localStorage'
import { getShareText, shareStatus } from '../../lib/share'
import { solutionCreator, tomorrow } from '../../lib/words'
import { BaseModal } from './BaseModal'
import { Word } from '../../lib/statuses'
import React, { useCallback, useEffect, useState } from 'react'
import { DifficultyList } from '../lists/DifficultyList'

type Props = {
  isOpen: boolean
  handleClose: () => void
  guesses: Word[]
  isGameLost: boolean
  isGameWon: boolean
  day: number
  difficulty: number
  solution?: Word
  handleShareCopySuccess: () => void
  handleShareFailure: () => void
  handleNewGameClick: () => void
  handleStats: (difficulty: number) => GameStats
}

export const StatsModal = ({
  isOpen,
  handleClose,
  guesses,
  isGameLost,
  isGameWon,
  day,
  solution,
  difficulty,
  handleShareCopySuccess,
  handleShareFailure,
  handleNewGameClick,
  handleStats,
}: Props) => {
  const [statDifficulty, setStatDifficulty] = useState(difficulty)
  useEffect(() => {
    setStatDifficulty(difficulty)
  }, [difficulty, isOpen, handleStats])

  const handleShareClick = useCallback(async () => {
    try {
      const { type } = await shareStatus(
        guesses,
        isGameLost,
        day,
        statDifficulty,
        solution
      )
      if (type === 'clipboard') {
        handleShareCopySuccess()
      }
    } catch (e) {
      handleShareFailure()
    }
  }, [
    guesses,
    isGameLost,
    day,
    statDifficulty,
    solution,
    handleShareCopySuccess,
    handleShareFailure,
  ])

  const renderShareText = useCallback(
    (guesses: Word[], lost: boolean, solution?: Word) => {
      const text = getShareText(guesses, lost, day, statDifficulty, solution)
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
    },
    [day, statDifficulty]
  )

  const gameStats = handleStats(statDifficulty)

  return (
    <BaseModal title="Statisztika" isOpen={isOpen} handleClose={handleClose}>
      <StatBar gameStats={gameStats} />
      <>
        <h4 className="text-lg leading-6 font-medium text-gray-900 dark:text-slate-200">
          A megoldások eloszlása
        </h4>

        <div className="relative ml-2 mt-5 mb-5 sm:mt-6 columns-2">
          <div>
            <h5 className="text-left">Nehézség:</h5>
          </div>
          <div className="absolute left-1/3 top-[-10px]">
            <DifficultyList
              selected={statDifficulty}
              onChange={(value) => setStatDifficulty(value)}
            />
          </div>
        </div>
        <Histogram gameStats={gameStats} />
      </>
      <div className="ml-2 mt-5 sm:mt-6 columns-2">
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
      <div className="ml-2 mt-5 sm:mt-6" style={{ marginTop: 0 }}>
        <button
          type="button"
          className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          onClick={handleNewGameClick}
        >
          Most akarom!
        </button>
      </div>
      {gameStats.totalGames > 0 && (
        <>
          <div className="ml-2 mt-5 sm:mt-6">
            <button
              type="button"
              className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={handleShareClick}
            >
              Megosztás
            </button>
            <p>
              Ha a megosztás gomb nem működik, másold ki innen az eredményedet:
            </p>
            {renderShareText(guesses, isGameLost, solution)}
          </div>
        </>
      )}
    </BaseModal>
  )
}
