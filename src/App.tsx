import {
  InformationCircleIcon,
  ChartBarIcon,
  PlusCircleIcon,
  ViewGridAddIcon,
  ViewGridIcon,
  PuzzleIcon,
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
import { Icon } from './components/icon/icon'
import {
  isWordInWordList,
  isWinningWord,
  isWordEqual,
  getCurrentWord,
  getRandomWord,
} from './lib/words'
import {
  debouncingStateToAPI,
  getStateFromAPI,
  getStatsFromAPI,
  sendStatsToAPI,
} from './lib/api'
import { WIN_MESSAGES } from './constants/strings'
import { addStatsForCompletedGame, loadStats, toStats } from './lib/stats'
import {
  GameStats,
  loadDifficultyToLocalStorage,
  loadGameStateFromLocalStorage,
  loadGridFullToLocalStorage,
  saveDifficultyToLocalStorage,
  saveGameStateToLocalStorage,
  saveGridFullToLocalStorage,
  saveStatsToLocalStorage,
  StoredGameState,
} from './lib/localStorage'
import { CharValue, Word } from './lib/statuses'
import { MAX_NUMBER_OF_GUESSES } from './constants/constants'
import { ThemeToggle } from './components/theme/ThemeToggle'
import { ThemeContext } from './components/theme/ThemeContext'
import { CreatePuzzleModal } from './components/modals/CreatePuzzleModal'
import { times, random as rand } from 'lodash'
import {
  addGTM,
  GameType,
  getDifficultyFromUrl,
  getGridMaxWidthClassName,
} from './lib/utils'
import { ModalId, ModalType } from './components/modals/BaseModal'
import { getAllWords } from './constants/wordlist'

const ALERT_TIME_MS = 2000
const NEW_MODAL_TIME_MS = 500

function App() {
  const context = React.useContext(ThemeContext)
  const hashDifficulty = getDifficultyFromUrl()
  const [currentGuess, setCurrentGuess] = useState<Word>([])
  const [isGameWon, setIsGameWon] = useState<Record<number, boolean>>({})
  const [isModalOpen, setIsModalOpenState] = useState<ModalType>(false)
  const [isModalOpenRegistered, setIsModalOpenRegistered] =
    useState<ModalType>(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [shareComplete, setShareComplete] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [isGameLost, setIsGameLost] = useState<Record<number, boolean>>({})
  const [successAlert, setSuccessAlert] = useState('')
  const [userInteracted, setUserInteracted] = useState(false)
  const [appToReload, setAppToReload] = useState(false)
  const [appIsReloaded, setAppIsReloaded] = useState(false)
  const savedDificulty = useMemo(() => {
    return hashDifficulty ?? loadDifficultyToLocalStorage()
  }, [hashDifficulty])
  const [difficulty, setDifficulty] = useState(savedDificulty)
  const getLoadedState = useCallback((stateDifficulty) => {
    const loadedState = loadGameStateFromLocalStorage(stateDifficulty)

    return loadedState
  }, [])

  const maxGuess = useMemo(
    () => MAX_NUMBER_OF_GUESSES[difficulty],
    [difficulty]
  )

  const savedRandom = useMemo(
    () => getLoadedState(difficulty)?.random ?? -1,
    [difficulty, getLoadedState]
  )

  const [random, setRandom] = useState(savedRandom)

  const savedDay = useMemo(
    () => getLoadedState(difficulty)?.day ?? 0,
    [difficulty, getLoadedState]
  )
  const [day, setDay] = useState(savedDay)

  const { solution } = useMemo(() => {
    return random > -1
      ? getRandomWord(random, difficulty)
      : getCurrentWord(day, difficulty)
  }, [day, difficulty, random])

  console.log('ASD', solution)

  const setIsModalOpen = useCallback((type: ModalType) => {
    type && setIsModalOpenRegistered(type)
    setIsModalOpenState(type)
  }, [])

  const getLoadedGuesses = useCallback(
    (customState?: StoredGameState | null) => {
      const loaded = customState ?? getLoadedState(difficulty)
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
    },
    [difficulty, getLoadedState, maxGuess, setIsModalOpen, solution]
  )

  const getLoadedStats = useCallback(
    (statDifficulty) => loadStats(statDifficulty),
    []
  )

  const [stats, setStats] = useState(getLoadedStats(difficulty))
  const [globalStats, setGlobalStats] = useState()

  const [, updateState] = useState<Record<string, string>>()
  const forceUpdate = useCallback(() => updateState({}), [])
  useEffect(() => {
    if (appToReload) {
      const loadedDifficulty = loadDifficultyToLocalStorage()
      const loadedState = loadGameStateFromLocalStorage(loadedDifficulty)
      if (!appIsReloaded) {
        setTimeout(() => {
          const loadedDay = loadedState?.day

          setAppIsReloaded(true)
          if (loadedState) {
            setIsModalOpen(false)
          }
          setDay(loadedDay ?? 0)
          setDifficulty(loadedDifficulty)
          const loadedGuesses = getLoadedGuesses()
          if (loadedGuesses.length) {
            setGuesses(loadedGuesses)
          }
          forceUpdate()
        }, 1000)
      }
    }
  }, [
    appIsReloaded,
    appToReload,
    day,
    forceUpdate,
    getLoadedGuesses,
    getLoadedStats,
    setIsModalOpen,
  ])

  useEffect(() => {
    getStatsFromAPI().then((data) => setGlobalStats(data))

    setTimeout(() => {
      getStateFromAPI().then((data) => {
        let statesSaved = false
        Object.entries(data?.state ?? {}).forEach(([d, s]) => {
          const loopDifficulty = parseInt(d)
          if (loopDifficulty >= 3 && loopDifficulty <= 9) {
            saveGameStateToLocalStorage(s as StoredGameState, loopDifficulty)
            statesSaved = true
          }
        })
        Object.entries(data?.stats ?? {}).forEach(([d, s]) => {
          const loopDifficulty = parseInt(d)
          if (loopDifficulty >= 3 && loopDifficulty <= 9) {
            saveStatsToLocalStorage(
              toStats(loopDifficulty, s as Record<string, number | number[]>),
              loopDifficulty
            )
            statesSaved = true
          }
        })

        if (data.difficulty >= 3 && data.difficulty <= 9) {
          saveDifficultyToLocalStorage(data.difficulty as number)

          if (statesSaved && data?.state?.[data.difficulty]) {
            setTimeout(() => {
              setAppToReload(true)
            }, 300)
          }
        }
      })
    }, 500)
  }, [])

  const getGlobalStats = useCallback(
    (statDifficulty): GameStats | undefined =>
      toStats(difficulty, globalStats?.[statDifficulty]),

    [difficulty, globalStats]
  )

  const saveStat = useCallback(
    (gameStats: GameStats) => {
      setStats(gameStats)
      sendStatsToAPI(gameStats, difficulty).then((data) => setGlobalStats(data))
    },
    [difficulty]
  )

  const [guesses, setGuesses] = useState<Word[]>([])

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const [gridFull, setGridFull] = useState(loadGridFullToLocalStorage())
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const handleResize = () => {
      if (gridContainerRef.current == null) {
        return
      }
      const gridContainerHeight = gridContainerRef.current.clientHeight
      const gridWidth = Math.min(
        Math.floor(
          gridContainerHeight * (5 / MAX_NUMBER_OF_GUESSES[difficulty])
        ),
        350
      )
      const gridHeight = Math.floor(
        (MAX_NUMBER_OF_GUESSES[difficulty] * gridWidth) / 5
      )
      setGridSize({ width: gridWidth, height: gridHeight })
    }
    window.addEventListener('resize.grid', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize.grid', handleResize)
    }
  }, [difficulty, setGridSize])

  const checkIsModalOpen = useCallback(
    (type: ModalId) => {
      if (typeof isModalOpen === 'string' && isModalOpen === type) {
        return true
      }

      if (Array.isArray(isModalOpen) && isModalOpen?.[0] === type) {
        return true
      }

      return false
    },
    [isModalOpen]
  )
  const checkIsModalCallback = useCallback(() => {
    if (Array.isArray(isModalOpen) && isModalOpen?.[1]) {
      return isModalOpen?.[1]
    }

    return null
  }, [isModalOpen])

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
    !hashDifficulty && saveDifficultyToLocalStorage(difficulty)
    setGuesses(getLoadedGuesses())
    setStats(getLoadedStats(difficulty))
  }, [difficulty, getLoadedGuesses, getLoadedStats, hashDifficulty])

  useEffect(() => {
    checkViewPort()
    if (userInteracted) {
      debouncingStateToAPI({ guesses, solution, day, random }, difficulty)
      saveGameStateToLocalStorage(
        { guesses, solution, day, random },
        difficulty
      )
    }
  }, [guesses, solution, day, difficulty, userInteracted, random])

  useEffect(() => {})

  useEffect(() => {
    setTimeout(() => {
      if (!isGameWon[difficulty] && !isGameLost[difficulty]) {
        setSuccessAlert('')
        return
      }

      setSuccessAlert(
        isGameWon[difficulty]
          ? WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
          : ''
      )

      !(['new-game', 'new-game-confirm'] as ModalType[]).includes(
        isModalOpenRegistered
      ) && setIsModalOpen('stat')
    }, ALERT_TIME_MS)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameWon[difficulty], isGameLost[difficulty]])

  const onChar = (value: CharValue) => {
    checkViewPort()
    if (
      currentGuess.length < difficulty &&
      guesses.length < maxGuess &&
      !isGameWon[difficulty]
    ) {
      setCurrentGuess([...currentGuess, value])
      setUserInteracted(true)
    }
  }

  const onReplace = (value: CharValue) => {
    checkViewPort()
    if (
      currentGuess.length - 1 < difficulty &&
      guesses.length < maxGuess &&
      !isGameWon[difficulty]
    ) {
      setCurrentGuess([...currentGuess.slice(0, -1), value])
      setUserInteracted(true)
    }
  }

  const onDelete = () => {
    checkViewPort()
    setCurrentGuess(currentGuess.slice(0, -1))
    setUserInteracted(true)
  }

  const onEnter = () => {
    checkViewPort()
    if (isGameWon[difficulty] || isGameLost[difficulty]) {
      return
    }

    if (currentGuess.length !== difficulty) {
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

    const winningWord = isWinningWord(currentGuess, day, random, difficulty)

    if (
      currentGuess.length === difficulty &&
      guesses.length < maxGuess &&
      !isGameWon[difficulty]
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess([])
      setUserInteracted(true)

      if (winningWord) {
        saveStat(addStatsForCompletedGame(stats, guesses.length, difficulty))
        addGTM('event', 'win', {
          guess: currentGuess.join(''),
          difficulty,
        })
        return setIsGameWon({ [difficulty]: true })
      }

      if (guesses.length === maxGuess - 1) {
        saveStat(
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
    setUserInteracted(true)
    setDifficulty(value)
    setCurrentGuess(currentGuess.slice(0, value))
  }

  const handleNewGame = (type: GameType) => {
    addGTM('event', 'newGame', { difficulty })
    setUserInteracted(true)
    setIsGameLost({ [difficulty]: false })
    setIsGameWon({ [difficulty]: false })
    setGuesses([])
    setCurrentGuess([])

    if (type === 'in-row') {
      setRandom(-1)
      setDay((prev) => prev + 1)
    } else {
      getAllWords(difficulty)
      setRandom(rand(0, getAllWords(difficulty).length - 1))
    }
    setIsModalOpen(false)
  }

  const handleManualEnd = () => {
    setIsModalOpen(false)
    setUserInteracted(true)
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

      saveStat(addStatsForCompletedGame(stats, newGuesses.length, difficulty))
      setIsGameLost({ [difficulty]: true })
    }
    setIsModalOpenRegistered('new-game')
    setTimeout(() => {
      setSuccessAlert('')
      setIsModalOpen('new-game')
    }, NEW_MODAL_TIME_MS)
  }

  const handleGridIcon = (full: boolean) => {
    saveGridFullToLocalStorage(full)
    setGridFull(full)
  }

  const handleModalClose = () => {
    const fallbackModal = checkIsModalCallback()

    setIsModalOpen(false)
    if (fallbackModal) {
      setIsModalOpenRegistered(fallbackModal)
      setTimeout(() => {
        setIsModalOpen(fallbackModal)
      }, NEW_MODAL_TIME_MS)
    }
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
        isOpen={checkIsModalOpen('info')}
        handleClose={handleModalClose}
        handleModal={setIsModalOpen}
        difficulty={difficulty}
      />
      <StatsModal
        isOpen={checkIsModalOpen('stat') || checkIsModalOpen('new-game')}
        handleClose={handleModalClose}
        isMinimal={isModalOpen === false || checkIsModalOpen('new-game')}
        guesses={guesses}
        day={day}
        random={random}
        difficulty={difficulty}
        isGameLost={isGameLost[difficulty]}
        isGameWon={isGameWon[difficulty]}
        solution={isGameWon[difficulty] ? solution : undefined}
        handleShareCopySuccess={handleShareCopySuccess}
        handleShareFailure={handleShareFailure}
        handleNewGameClick={handleNewGame}
        handleStats={getLoadedStats}
        handleGlobalStats={getGlobalStats}
      />
      <NewGameModal
        isOpen={checkIsModalOpen('new-game-confirm')}
        handleClose={handleModalClose}
        handleFailure={handleManualEnd}
      />
      <AboutModal
        isOpen={checkIsModalOpen('about')}
        handleClose={handleModalClose}
      />
      <CreatePuzzleModal
        isOpen={checkIsModalOpen('create-puzzle')}
        handleClose={handleModalClose}
        difficulty={difficulty}
      />
      <div className="bg-white dark:bg-gray-800 transition-all h-[100%]">
        <div
          className="flex flex-col px-2 pt-8 w-[100%] h-[100%] max-w-[500px] mx-auto sm:px-6 lg:px-8"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex  mx-4 items-center mb-8 relative z-20">
            <h1 className="text-xl font-bold dark:text-gray-300">Szózat</h1>
            <Icon
              component={InformationCircleIcon}
              onClick={() => setIsModalOpen('info')}
            />
            <DifficultyList
              selected={difficulty}
              onChange={handleDifficultyChange}
            />
            <Icon component={ThemeToggle} />
            <Icon
              component={gridFull ? ViewGridIcon : ViewGridAddIcon}
              onClick={() => handleGridIcon(!gridFull)}
              isGroupEnd
            />
            <Icon
              component={ChartBarIcon}
              onClick={() => setIsModalOpen('stat')}
            />
            <Icon
              component={PlusCircleIcon}
              onClick={() => setIsModalOpen('create-puzzle')}
            />
            <Icon
              component={PuzzleIcon}
              onClick={() =>
                setIsModalOpen(
                  isGameWon[difficulty] || isGameLost[difficulty]
                    ? 'new-game'
                    : 'new-game-confirm'
                )
              }
            />
          </div>
          {/* {isLocalhost() && (
            <div className="dark:text-gray-300">
              Nap {day}, Nehézség {difficulty}, Megfejtés {solution}
            </div>
          )} */}
          <div
            ref={gridContainerRef}
            className={`grow flex justify-center overflow-auto mx-auto w-full mb-5 min-h-[60px] ${getGridMaxWidthClassName(
              difficulty
            )} relative z-10`}
          >
            <Grid
              guesses={guesses}
              currentGuess={currentGuess}
              day={day}
              random={random}
              size={gridSize}
              full={gridFull}
              difficulty={difficulty}
            />
          </div>
          <div className="pb-5">
            <Keyboard
              onChar={onChar}
              onDelete={onDelete}
              onReplace={onReplace}
              onEnter={onEnter}
              guesses={guesses}
              currentGuess={currentGuess}
              day={day}
              random={random}
              difficulty={difficulty}
              enabledOnEnter={currentGuess.length === difficulty}
              enabledOnDelete={currentGuess.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
