import {
  InformationCircleIcon,
  ChartBarIcon,
  PlusCircleIcon,
  RefreshIcon,
} from '@heroicons/react/outline'
import animateScrollTo from 'animated-scroll-to'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { AboutModal } from './components/modals/AboutModal'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { NewGameModal } from './components/modals/NewGameModal'
import {
  isWordInWordList,
  isWinningWord,
  isWordEqual,
  getCurrentWord,
} from './lib/words'
import { WIN_MESSAGES } from './constants/strings'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
} from './lib/localStorage'
import { CharValue, Word } from './lib/statuses'
import { MAX_NUMBER_OF_GUESSES } from './constants/constants'
import { ThemeToggle } from './components/theme/ThemeToggle'
import { ThemeContext } from './components/theme/ThemeContext'
import { CreatePuzzleModal } from './components/modals/CreatePuzzleModal'

const ALERT_TIME_MS = 2000
const NEW_GAME_TIME_MS = 500

function App() {
  const context = React.useContext(ThemeContext)
  const [currentGuess, setCurrentGuess] = useState<Word>([])
  const [isGameWon, setIsGameWon] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState<
    'info' | 'new-game' | 'stat' | 'about' | 'create-puzzle' | false
  >(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [shareComplete, setShareComplete] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [successAlert, setSuccessAlert] = useState('')

  const savedDay = useMemo(() => loadGameStateFromLocalStorage()?.day ?? 0, [])
  const [day, setDay] = useState(savedDay)

  const { solution } = useMemo(() => getCurrentWord(day), [day])
  const [guesses, setGuesses] = useState<Word[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded == null) {
      setIsModalOpen('info')
    }
    if (loaded == null || !isWordEqual(loaded.solution, solution)) {
      return []
    }
    const gameWasWon = loaded.guesses.some((guess) =>
      isWordEqual(guess, solution)
    )
    if (gameWasWon) {
      setIsGameWon(true)
    }
    if (loaded.guesses.length === MAX_NUMBER_OF_GUESSES && !gameWasWon) {
      setIsGameLost(true)
    }
    return loaded.guesses
  })
  // const [gridSize, setGridSize] = useState({ width: 0, height: 0 })

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState(() => loadStats())

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (gridContainerRef.current == null) {
  //       return
  //     }
  //     const gridContainerHeight = gridContainerRef.current.clientHeight
  //     const gridWidth = Math.min(
  //       Math.floor(gridContainerHeight * (5 / MAX_NUMBER_OF_GUESSES)),
  //       350
  //     )
  //     const gridHeight = Math.floor((MAX_NUMBER_OF_GUESSES * gridWidth) / 5)
  //     setGridSize({ width: gridWidth, height: gridHeight })
  //   }
  //   window.addEventListener('resize', handleResize)
  //   handleResize()
  //   return () => {
  //     window.removeEventListener('resize', handleResize)
  //   }
  // }, [setGridSize])

  const checkViewPort = () => {
    const currentRow = gridContainerRef.current?.querySelector(
      '.current-row'
    ) as HTMLDivElement | null
    const parent = gridContainerRef.current

    if (parent && currentRow) {
      if (parent.offsetTop > currentRow.offsetTop - parent.scrollTop) {
        animateScrollTo(0)
        animateScrollTo(currentRow.previousElementSibling ?? currentRow, {
          elementToScroll: parent,
        })
      }
      if (
        parent.offsetTop + parent.offsetHeight <
        currentRow.offsetTop + currentRow.offsetHeight - parent.scrollTop
      ) {
        animateScrollTo(0)
        animateScrollTo(currentRow.nextElementSibling ?? currentRow, {
          elementToScroll: parent,
        })
      }
    }
  }

  useEffect(() => {
    checkViewPort()
    saveGameStateToLocalStorage({ guesses, solution, day })
  }, [guesses, solution, day])

  useEffect(() => {
    if (isGameWon) {
      setSuccessAlert(
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      )
      setTimeout(() => {
        setSuccessAlert('')
        isModalOpen !== 'new-game' && setIsModalOpen('stat')
      }, ALERT_TIME_MS)
    }
    if (isGameLost) {
      setTimeout(() => {
        isModalOpen !== 'new-game' && setIsModalOpen('stat')
      }, ALERT_TIME_MS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameWon, isGameLost])

  const onChar = (value: CharValue) => {
    checkViewPort()
    if (
      currentGuess.length < 5 &&
      guesses.length < MAX_NUMBER_OF_GUESSES &&
      !isGameWon
    ) {
      setCurrentGuess([...currentGuess, value])
    }
  }

  const onDelete = () => {
    checkViewPort()
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  const onEnter = () => {
    checkViewPort()
    if (isGameWon || isGameLost) {
      return
    }
    if (!(currentGuess.length === 5)) {
      setIsNotEnoughLetters(true)
      return setTimeout(() => {
        setIsNotEnoughLetters(false)
      }, ALERT_TIME_MS)
    }

    if (
      !isWordInWordList(currentGuess) &&
      !isWordEqual(currentGuess, solution)
    ) {
      setIsWordNotFoundAlertOpen(true)
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
      }, ALERT_TIME_MS)
    }

    const winningWord = isWinningWord(currentGuess, day)

    if (
      currentGuess.length === 5 &&
      guesses.length < MAX_NUMBER_OF_GUESSES &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess([])

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length))
        return setIsGameWon(true)
      }

      if (guesses.length === MAX_NUMBER_OF_GUESSES - 1) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setIsGameLost(true)
      }
    }
  }

  const handleShareCopySuccess = useCallback(() => {
    setShareComplete(true)
    setTimeout(() => {
      setShareComplete(false)
    }, ALERT_TIME_MS)
  }, [])

  const handleShareFailure = useCallback(() => {
    setShareFailed(true)
    setTimeout(() => {
      setShareFailed(false)
    }, ALERT_TIME_MS)
  }, [])

  const handleNewGame = () => {
    setIsGameLost(false)
    setIsGameWon(false)
    setGuesses([])
    setCurrentGuess([])
    setDay((prev) => prev + 1)
    setIsModalOpen(false)
  }

  const handleManualEnd = () => {
    setIsModalOpen(false)
    if (!isGameWon) {
      const newGuesses = [...guesses, currentGuess].filter(
        (guess) => guess.length
      )

      for (let i = 0; i < MAX_NUMBER_OF_GUESSES; i++) {
        if (!newGuesses[i]) {
          newGuesses[i] = ['-', '-', '-', '-', '-']
        }
      }
      setGuesses(newGuesses)

      setStats(addStatsForCompletedGame(stats, newGuesses.length))
      setIsGameLost(true)
    }

    setTimeout(() => {
      setSuccessAlert('')
      setIsModalOpen('stat')
    }, NEW_GAME_TIME_MS)
  }

  return (
    <div className={context.theme + ' h-[100%]'}>
      <Alert message="Nincs elég betű" isOpen={isNotEnoughLetters} />
      <Alert
        message="Nem találtunk ilyen szót"
        isOpen={isWordNotFoundAlertOpen}
      />
      <Alert
        message={`Vesztettél, a megoldás ez volt: ${solution.join('')}`}
        isOpen={isGameLost}
      />
      <Alert
        message={successAlert}
        isOpen={successAlert !== ''}
        variant="success"
      />
      <Alert
        message="A játékot kimásoltuk a vágólapra"
        isOpen={shareComplete}
        variant="success"
      />
      <Alert
        message="Nem sikerült a megosztás - lehet, hogy beágyazott böngészőt használsz?"
        isOpen={shareFailed}
        variant="warning"
      />
      <InfoModal
        isOpen={isModalOpen === 'info'}
        handleClose={() => setIsModalOpen(false)}
      />
      <StatsModal
        isOpen={isModalOpen === 'stat'}
        handleClose={() => setIsModalOpen(false)}
        guesses={guesses}
        gameStats={stats}
        day={day}
        isGameLost={isGameLost}
        isGameWon={isGameWon}
        handleShareCopySuccess={handleShareCopySuccess}
        handleShareFailure={handleShareFailure}
        handleNewGameClick={handleNewGame}
      />
      <NewGameModal
        isOpen={isModalOpen === 'new-game'}
        handleClose={() => setIsModalOpen(false)}
        handleFailure={handleManualEnd}
      />
      <AboutModal
        isOpen={isModalOpen === 'about'}
        handleClose={() => setIsModalOpen(false)}
      />
      <CreatePuzzleModal
        isOpen={isModalOpen === 'create-puzzle'}
        handleClose={() => setIsModalOpen(false)}
      />
      <div className="bg-white dark:bg-gray-800 transition-all h-[100%]">
        <div
          className="flex flex-col py-8 w-[100%] h-[100%] max-w-[500px] mx-auto sm:px-6 lg:px-8"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex w-80 mx-auto items-center mb-8">
            <h1 className="text-xl grow font-bold dark:text-gray-300">
              Szózat
            </h1>
            <ThemeToggle />
            <InformationCircleIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-300"
              onClick={() => setIsModalOpen('info')}
            />
            <ChartBarIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-300"
              onClick={() => setIsModalOpen('stat')}
            />
            <PlusCircleIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-300"
              onClick={() => setIsModalOpen('create-puzzle')}
            />
            <RefreshIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-300"
              onClick={() => setIsModalOpen('new-game')}
            />
          </div>
          <div
            ref={gridContainerRef}
            className="grow flex justify-center overflow-auto mb-5"
            style={{ minHeight: 60 }}
          >
            <Grid
              guesses={guesses}
              currentGuess={currentGuess}
              // size={gridSize}
              day={day}
            />
          </div>
          <div className="pb-5">
            <Keyboard
              onChar={onChar}
              onDelete={onDelete}
              onEnter={onEnter}
              guesses={guesses}
              day={day}
            />
          </div>
          <button
            type="button"
            className="mx-auto flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none"
            onClick={() => setIsModalOpen('about')}
          >
            A játék eredetéről
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
