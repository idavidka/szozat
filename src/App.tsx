import {
  InformationCircleIcon,
  ChartBarIcon,
  PlusCircleIcon,
  RefreshIcon,
} from '@heroicons/react/outline'
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

function App() {
  const context = React.useContext(ThemeContext)
  const [currentGuess, setCurrentGuess] = useState<Word>([])
  const [isGameWon, setIsGameWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isNewGameModelOpen, setIsNewGameModalOpen] = useState(false)
  const [isCreatePuzzleModalOpen, setIsCreatePuzzleModalOpen] = useState(false)
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
      setIsInfoModalOpen(true)
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
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 })

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState(() => loadStats())

  useEffect(() => {
    const handleResize = () => {
      if (gridContainerRef.current == null) {
        return
      }
      const gridContainerHeight = gridContainerRef.current.clientHeight
      const gridWidth = Math.min(
        Math.floor(gridContainerHeight * (5 / MAX_NUMBER_OF_GUESSES)),
        350
      )
      const gridHeight = Math.floor((MAX_NUMBER_OF_GUESSES * gridWidth) / 5)
      setGridSize({ width: gridWidth, height: gridHeight })
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setGridSize])

  useEffect(() => {
    saveGameStateToLocalStorage({ guesses, solution, day })
  }, [guesses, solution, day])

  useEffect(() => {
    if (isGameWon) {
      setSuccessAlert(
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      )
      setTimeout(() => {
        setSuccessAlert('')
        setIsStatsModalOpen(true)
      }, ALERT_TIME_MS)
    }
    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, ALERT_TIME_MS)
    }
  }, [isGameWon, isGameLost])

  const onChar = (value: CharValue) => {
    if (
      currentGuess.length < 5 &&
      guesses.length < MAX_NUMBER_OF_GUESSES &&
      !isGameWon
    ) {
      setCurrentGuess([...currentGuess, value])
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  const onEnter = () => {
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
    setIsNewGameModalOpen(false)
  }

  const handleManualEnd = () => {
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
    setIsStatsModalOpen(true)
  }

  return (
    <div className={context.theme}>
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
        isOpen={isInfoModalOpen}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        handleClose={() => setIsStatsModalOpen(false)}
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
        isOpen={isNewGameModelOpen}
        handleClose={() => setIsNewGameModalOpen(false)}
        handleFailure={handleManualEnd}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        handleClose={() => setIsAboutModalOpen(false)}
      />
      <CreatePuzzleModal
        isOpen={isCreatePuzzleModalOpen}
        handleClose={() => setIsCreatePuzzleModalOpen(false)}
      />
      <div className="bg-white dark:bg-gray-800 transition-all">
        <div className="flex flex-col h-[100vh] py-8 w-[100%] max-w-[500px] mx-auto sm:px-6 lg:px-8">
          <div className="flex w-80 mx-auto items-center mb-8">
            <h1 className="text-xl grow font-bold dark:text-gray-300">
              Szózat
            </h1>
            <ThemeToggle />
            <InformationCircleIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-300"
              onClick={() => setIsInfoModalOpen(true)}
            />
            <ChartBarIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-300"
              onClick={() => setIsStatsModalOpen(true)}
            />
            <PlusCircleIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-300"
              onClick={() => setIsCreatePuzzleModalOpen(true)}
            />
            <RefreshIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-300"
              onClick={() => setIsNewGameModalOpen(true)}
            />
          </div>
          <div
            ref={gridContainerRef}
            className="grow flex justify-center items-center overflow-hidden mb-5"
          >
            <Grid
              guesses={guesses}
              currentGuess={currentGuess}
              size={gridSize}
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
        </div>
        <div className="pb-5">
          <button
            type="button"
            className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none"
            onClick={() => setIsAboutModalOpen(true)}
          >
            A játék eredetéről
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
