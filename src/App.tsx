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
import { DifficultyList } from './components/lists/DifficultyList'
import {
  isWordInWordList,
  isWinningWord,
  isWordEqual,
  getCurrentWord,
} from './lib/words'
import { WIN_MESSAGES } from './constants/strings'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadDifficultyToLocalStorage,
  loadGameStateFromLocalStorage,
  saveDifficultyToLocalStorage,
  saveGameStateToLocalStorage,
} from './lib/localStorage'
import { CharValue, Word } from './lib/statuses'
import { MAX_NUMBER_OF_GUESSES } from './constants/constants'
import { ThemeToggle } from './components/theme/ThemeToggle'
import { ThemeContext } from './components/theme/ThemeContext'
import { CreatePuzzleModal } from './components/modals/CreatePuzzleModal'
import { times } from 'lodash'
import { addGTM } from './constants/utils'

const ALERT_TIME_MS = 2000
const NEW_GAME_TIME_MS = 500

function App() {
  const context = React.useContext(ThemeContext)
  const [currentGuess, setCurrentGuess] = useState<Word>([])
  const [isGameWon, setIsGameWon] = useState<Record<number, boolean>>({})
  const [isModalOpen, setIsModalOpen] = useState<
    'info' | 'new-game' | 'stat' | 'about' | 'create-puzzle' | false
  >(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [shareComplete, setShareComplete] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [isGameLost, setIsGameLost] = useState<Record<number, boolean>>({})
  const [successAlert, setSuccessAlert] = useState('')
  const savedDificulty = useMemo(() => loadDifficultyToLocalStorage(), [])
  const [difficulty, setDifficulty] = useState(savedDificulty)
  const getLoadedState = useCallback(
    (stateDifficulty) => loadGameStateFromLocalStorage(stateDifficulty),
    []
  )

  const maxGuess = useMemo(
    () => MAX_NUMBER_OF_GUESSES[difficulty],
    [difficulty]
  )

  const savedDay = useMemo(
    () => getLoadedState(difficulty)?.day ?? 0,
    [difficulty, getLoadedState]
  )
  const [day, setDay] = useState(savedDay)

  const { solution } = useMemo(
    () => getCurrentWord(day, difficulty),
    [day, difficulty]
  )

  const getLoadedGuesses = useCallback(() => {
    const loaded = getLoadedState(difficulty)
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
      setIsGameWon({ [difficulty]: true })
    }
    if (loaded.guesses.length === maxGuess && !gameWasWon) {
      setIsGameLost({ [difficulty]: true })
    }
    return loaded.guesses
  }, [difficulty, getLoadedState, maxGuess, solution])
  const getLoadedStats = useCallback(
    (statDifficulty) => loadStats(statDifficulty),
    []
  )

  const [guesses, setGuesses] = useState<Word[]>([])

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState(getLoadedStats(difficulty))

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
        animateScrollTo(currentRow.previousElementSibling ?? currentRow, {
          elementToScroll: parent,
        })
      }
    }
  }

  useEffect(() => {
    checkViewPort()
    saveDifficultyToLocalStorage(difficulty)
    setGuesses(getLoadedGuesses())
    setStats(getLoadedStats(difficulty))
  }, [difficulty, getLoadedGuesses, getLoadedStats])

  useEffect(() => {
    checkViewPort()
    saveGameStateToLocalStorage({ guesses, solution, day }, difficulty)
  }, [guesses, solution, day, difficulty])

  useEffect(() => {
    if (isGameWon[difficulty]) {
      setSuccessAlert(
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      )
      setTimeout(() => {
        setSuccessAlert('')
        isModalOpen !== 'new-game' && setIsModalOpen('stat')
      }, ALERT_TIME_MS)
    }
    if (isGameLost[difficulty]) {
      setTimeout(() => {
        isModalOpen !== 'new-game' && setIsModalOpen('stat')
      }, ALERT_TIME_MS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameWon, isGameLost])

  const onChar = (value: CharValue) => {
    checkViewPort()
    if (
      currentGuess.length < difficulty &&
      guesses.length < maxGuess &&
      !isGameWon[difficulty]
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
    if (isGameWon[difficulty] || isGameLost[difficulty]) {
      return
    }
    if (!(currentGuess.length === difficulty)) {
      setIsNotEnoughLetters(true)
      return setTimeout(() => {
        setIsNotEnoughLetters(false)
      }, ALERT_TIME_MS)
    }
    addGTM('event', 'guess', {
      guess: currentGuess.join(''),
      difficulty,
    })

    if (
      !isWordInWordList(currentGuess, difficulty) &&
      !isWordEqual(currentGuess, solution)
    ) {
      setIsWordNotFoundAlertOpen(true)
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
      }, ALERT_TIME_MS)
    }

    const winningWord = isWinningWord(currentGuess, day, difficulty)

    if (
      currentGuess.length === difficulty &&
      guesses.length < maxGuess &&
      !isGameWon[difficulty]
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess([])

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length, difficulty))
        addGTM('event', 'win', {
          guess: currentGuess.join(''),
          difficulty,
        })
        return setIsGameWon({ [difficulty]: true })
      }

      if (guesses.length === maxGuess - 1) {
        setStats(
          addStatsForCompletedGame(stats, guesses.length + 1, difficulty)
        )
        addGTM('event', 'lost', {
          guesses: guesses.map((guess) => guess.join('')),
          difficulty,
        })
        setIsGameLost({ [difficulty]: true })
      }
    }
  }

  const handleShareCopySuccess = useCallback(() => {
    addGTM('event', 'copy', { status: 'success' })
    setShareComplete(true)
    setTimeout(() => {
      setShareComplete(false)
    }, ALERT_TIME_MS)
  }, [])

  const handleShareFailure = useCallback(() => {
    addGTM('event', 'copy', { status: 'failed' })
    setShareFailed(true)
    setTimeout(() => {
      setShareFailed(false)
    }, ALERT_TIME_MS)
  }, [])

  const handleDifficultyChange = (value: number) => {
    addGTM('event', 'changeDifficulty', {
      previous: difficulty,
      current: value,
    })
    setDifficulty(value)
  }

  const handleNewGame = () => {
    addGTM('event', 'newGame', { difficulty })
    setIsGameLost({ [difficulty]: false })
    setIsGameWon({ [difficulty]: false })
    setGuesses([])
    setCurrentGuess([])
    setDay((prev) => prev + 1)
    setIsModalOpen(false)
  }

  const handleManualEnd = () => {
    setIsModalOpen(false)
    if (!isGameWon[difficulty]) {
      const emptyRow = times(difficulty, () => '-') as Word
      const newGuesses = [
        ...guesses,
        emptyRow.map((letter, index) => currentGuess[index] ?? letter),
      ].filter((guess) => guess.length)

      for (let i = 0; i < maxGuess; i++) {
        if (!newGuesses[i]) {
          newGuesses[i] = [...emptyRow]
        }
      }
      addGTM('event', 'giveUp', { difficulty, guesses: newGuesses })
      setGuesses(newGuesses)

      setStats(addStatsForCompletedGame(stats, newGuesses.length, difficulty))
      setIsGameLost({ [difficulty]: true })
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
        isOpen={!!isGameLost[difficulty]}
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
        difficulty={difficulty}
      />
      <StatsModal
        isOpen={isModalOpen === 'stat'}
        handleClose={() => setIsModalOpen(false)}
        guesses={guesses}
        day={day}
        difficulty={difficulty}
        isGameLost={isGameLost[difficulty]}
        isGameWon={isGameWon[difficulty]}
        solution={isGameWon[difficulty] ? solution : undefined}
        handleShareCopySuccess={handleShareCopySuccess}
        handleShareFailure={handleShareFailure}
        handleNewGameClick={handleNewGame}
        handleStats={getLoadedStats}
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
        difficulty={difficulty}
      />
      <div className="bg-white dark:bg-gray-800 transition-all h-[100%]">
        <div
          className="flex flex-col py-8 w-[100%] h-[100%] max-w-[500px] mx-auto sm:px-6 lg:px-8"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex w-80 mx-auto items-center mb-8 relative z-20">
            <h1 className="text-xl grow font-bold dark:text-gray-300">
              Szózat
            </h1>
            <DifficultyList
              selected={difficulty}
              onChange={handleDifficultyChange}
            />
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
              onClick={() =>
                setIsModalOpen(isGameWon[difficulty] ? 'stat' : 'new-game')
              }
            />
          </div>
          <div
            ref={gridContainerRef}
            className="grow flex justify-center overflow-auto mb-5 min-h-[60px]  relative z-10"
          >
            <Grid
              guesses={guesses}
              currentGuess={currentGuess}
              day={day}
              difficulty={difficulty}
            />
          </div>
          <div className="pb-5">
            <Keyboard
              onChar={onChar}
              onDelete={onDelete}
              onEnter={onEnter}
              guesses={guesses}
              day={day}
              difficulty={difficulty}
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
