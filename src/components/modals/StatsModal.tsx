import Countdown from 'react-countdown'
import { StatBar } from '../stats/StatBar'
import { Histogram } from '../stats/Histogram'
import { getScreenShot, getShareText, shareStatus } from '../../lib/share'
import { tomorrow } from '../../lib/words'
import { BaseModal } from './BaseModal'
import { Word } from '../../lib/statuses'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DifficultyList } from '../lists/DifficultyList'
import { Tab } from '@headlessui/react'
import classNames from 'classnames'
import { createCustomStatURl } from '../../lib/hashUtils'
import { addToDebugInfo, GameType } from '../../lib/utils'
import { Difficulty, GameStats } from '../../hooks/gameReducer'
import { toStats } from '../../lib/stats'
import { ThemeContext } from '../theme/ThemeContext'

type Props = {
  isOpen: boolean
  isMinimal?: boolean
  handleClose: () => void
  guesses: Word[]
  isGameLost: boolean
  isGameWon: boolean
  day: number
  random: number
  difficulty: Difficulty
  solution?: Word
  solutionCreator?: string
  stats: Record<Difficulty, GameStats>
  globalStats: Record<Difficulty, GameStats> | undefined
  handleShareCopySuccess: () => void
  handleShareScreenshotSuccess: () => void
  handleShareFailure: () => void
  handleNewGameClick: (type: GameType) => void
}

export const StatsModal = ({
  isOpen,
  handleClose,
  guesses,
  isGameLost,
  isGameWon,
  isMinimal,
  day,
  random,
  solution,
  solutionCreator,
  difficulty,
  stats,
  globalStats,
  handleShareCopySuccess,
  handleShareScreenshotSuccess,
  handleShareFailure,
  handleNewGameClick,
}: Props) => {
  const { theme } = useContext(ThemeContext)
  const [statDifficulty, setStatDifficulty] = useState<Difficulty>(difficulty)
  useEffect(() => {
    setStatDifficulty(difficulty)
  }, [difficulty, isOpen])

  const handleShareClick = useCallback(
    async (shareType: 'status' | 'screenshot') => {
      try {
        const { type } = await shareStatus(
          theme,
          guesses,
          isGameLost,
          day,
          random,
          statDifficulty,
          shareType,
          solution
        )

        if (type === 'clipboard') {
          handleShareCopySuccess()
        }
        if (type === 'screenshot') {
          handleShareScreenshotSuccess()
        }
      } catch (e) {
        addToDebugInfo('share', { m: (e as { message: string }).message })
        handleShareFailure()
      }
    },
    [
      theme,
      guesses,
      isGameLost,
      day,
      random,
      statDifficulty,
      solution,
      handleShareCopySuccess,
      handleShareScreenshotSuccess,
      handleShareFailure,
    ]
  )

  const renderShareText = useCallback(
    (guesses: Word[], lost: boolean, solution?: Word) => {
      const text = getShareText(
        guesses,
        lost,
        day,
        random,
        statDifficulty,
        solution
      )
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
    [day, random, statDifficulty]
  )
  const statLink = createCustomStatURl()

  const statsTabs = useMemo(() => {
    return {
      Saját: {
        stat: toStats(statDifficulty, stats),
        details: true,
      },
      Világ: {
        stat: toStats(statDifficulty, globalStats),
        details: false,
      },
    }
  }, [globalStats, statDifficulty, stats])

  const getSolutionDetails = useCallback(() => {
    return (
      <>
        <div className="ml-2 mt-5 sm:mt-6 columns-2">
          {tomorrow && (
            <div>
              <h5>Következő feladvány:</h5>
              <Countdown
                className="text-lg font-medium "
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
        {isGameLost || isGameWon || isMinimal ? (
          <div className="ml-2 mt-5 sm:mt-6 columns-2" style={{ marginTop: 0 }}>
            <div className="text-left">
              <button
                type="button"
                className="mt-2 w-50 rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={() => handleNewGameClick('in-row')}
              >
                Most akarom!
              </button>
            </div>
            <div className="text-right">
              <button
                type="button"
                className="mt-2 w-50 rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={() => handleNewGameClick('random')}
              >
                Véletlen feladvány
              </button>
            </div>
          </div>
        ) : null}
        <div className="ml-2 mt-5 sm:mt-6" style={{ marginTop: 0 }}></div>
      </>
    )
  }, [handleNewGameClick, isGameLost, isGameWon, isMinimal, solutionCreator])

  const [image, setImage] = useState<string>()
  useEffect(() => {
    if (isGameWon && isOpen) {
      const canvas = getScreenShot(theme, guesses, day, random, statDifficulty)
      if (canvas) {
        setImage(canvas.toDataURL())
      }
    } else {
      setImage('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <BaseModal
      title={isMinimal ? 'Új feladvány' : 'Statisztika'}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      {isMinimal && (
        <div
          className={classNames(
            'bg-white dark:bg-slate-500 p-3',
            'text-gray-900 dark:text-slate-200',
            'focus:outline-none mt-2'
          )}
        >
          {getSolutionDetails()}
        </div>
      )}
      {!isMinimal && (
        <Tab.Group>
          <Tab.List className="flex p-1 space-x-1 bg-blue-900/20 rounded-xl">
            {Object.entries(statsTabs).map(
              ([category, { stat }], index) =>
                stat && (
                  <Tab
                    key={index}
                    className={({ selected }) =>
                      classNames(
                        'w-full py-2.5 text-sm leading-5 font-medium text-black dark:text-white rounded-lg',
                        'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white dark:ring-slate-500 ring-opacity-60',
                        selected
                          ? 'bg-white dark:bg-slate-500 shadow'
                          : 'hover:bg-white/[0.5] hover:dark:bg-slate-500/[0.5]'
                      )
                    }
                  >
                    {category}
                  </Tab>
                )
            )}
          </Tab.List>
          <Tab.Panels className="mt-2">
            {Object.values(statsTabs).map(
              ({ stat, details }, index) =>
                stat && (
                  <Tab.Panel
                    key={index}
                    className={classNames(
                      'bg-white dark:bg-slate-500 p-3',
                      'text-gray-900 dark:text-slate-200',
                      'focus:outline-none '
                    )}
                  >
                    {details && (
                      <>
                        <p className="text-gray-500 dark:text-slate-200 pb-2 pt-5">
                          Nyisd meg a játékaidat más eszközön is:
                        </p>
                        <p className="text-lg text-blue-500 dark:text-blue-900 pb-2 break-all">
                          <a href={statLink} target="_blank" rel="noreferrer">
                            {statLink}
                          </a>
                        </p>
                      </>
                    )}

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
                    <StatBar gameStats={stat} details={details} />
                    <h4 className="text-lg leading-6 font-medium">
                      A megoldások eloszlása
                    </h4>
                    <Histogram gameStats={stat} />
                    {details && (
                      <>
                        {getSolutionDetails()}
                        {stat.totalGames > 0 && (
                          <>
                            <div className="ml-2 mt-5 sm:mt-6">
                              Oszd meg az eredményedet!
                              <button
                                tabIndex={-1}
                                type="button"
                                className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                onClick={() => handleShareClick('status')}
                              >
                                Megosztás
                              </button>
                              <p className="text-xs">
                                Ha a megosztás gomb nem működik, másold ki innen
                                az eredményedet:
                              </p>
                              {renderShareText(guesses, isGameLost, solution)}
                            </div>
                            {image && (
                              <>
                                <p className="text-gray-500 dark:text-slate-200 pb-2 pt-5">
                                  Vagy oszd meg ezt a képet!
                                  <button
                                    tabIndex={-1}
                                    type="button"
                                    className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                    onClick={() =>
                                      handleShareClick('screenshot')
                                    }
                                  >
                                     Kép másolása a vágólapra
                                  </button>
                                </p>
                                <p className="flex justify-center">
                                  <img
                                    className="cursor-pointer share-img"
                                    src={image}
                                    alt={`jatek.${
                                      random > 0 ? random : day
                                    }.png`}
                                    title={`Játék ${random > 0 ? random : day}`}
                                    onClick={() => {
                                      var element = document.createElement('a')
                                      const clearUrl = image.replace(
                                        /^data:image\/\w+;base64,/,
                                        ''
                                      )

                                      element.setAttribute(
                                        'href',
                                        'data:attachment/image' + clearUrl
                                      )
                                      element.setAttribute(
                                        'download',
                                        `jatek.${random > 0 ? random : day}.png`
                                      )
                                      document.body.appendChild(element)
                                      element.click()
                                      document.body.removeChild(element)
                                    }}
                                  />
                                </p>
                                <p className="text-xs">
                                  Telefonon hosszú koppintással lehet menteni a
                                  képet
                                </p>
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Tab.Panel>
                )
            )}
          </Tab.Panels>
        </Tab.Group>
      )}
    </BaseModal>
  )
}
