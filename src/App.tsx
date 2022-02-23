import {
  InformationCircleIcon,
  ChartBarIcon,
  PlusCircleIcon,
  ViewGridAddIcon,
  ViewGridIcon,
  PuzzleIcon,
  RefreshIcon,
} from '@heroicons/react/outline'
import animateScrollTo from 'animated-scroll-to'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { AboutModal } from './components/modals/AboutModal'
import { InfoModal } from './components/modals/InfoModal'
import { DevModal } from './components/modals/DevModal'
import { StatsModal } from './components/modals/StatsModal'
import { NewGameModal } from './components/modals/NewGameModal'
import { DifficultyList } from './components/lists/DifficultyList'
import { Icon } from './components/icon/icon'
import {
  getGlobalStatsFromAPI,
  getStateFromAPI,
  getStaticWords,
  sendStateToAPI,
} from './lib/api'
import { WIN_MESSAGES } from './constants/strings'
import { addStatsForCompletedGame } from './lib/stats'
import { gameKey, getSize, truncate, wordKey } from './lib/localStorage'
import { CharValue, Word } from './lib/statuses'
import { MAX_NUMBER_OF_GUESSES } from './constants/constants'
import { ThemeToggle } from './components/theme/ThemeToggle'
import { ThemeContext } from './components/theme/ThemeContext'
import { CreatePuzzleModal } from './components/modals/CreatePuzzleModal'
import { times, random as rand, isNil, map } from 'lodash'
import {
  addGTM,
  GameType,
  getDebugInfo,
  getGridMaxWidthClassName,
  getGuessLength,
  getInitialCurentGuess,
  isLocalhost,
  removeLetter,
  setLetter,
} from './lib/utils'
import { ModalId, ModalType } from './components/modals/BaseModal'
import { getAllWords } from './constants/wordlist'
import {
  isWordInWordList,
  isWinningWord,
  isWordEqual,
  getCurrentWord,
  getRandomWord,
} from './lib/words'
import { usePersistedReducer } from './hooks/usePersistedReducer'
import {
  gameReducer,
  initialState as gameInitialState,
  State as GameState,
  Action as GameAction,
  View,
  Difficulty,
  getInitialState,
} from './hooks/gameReducer'
import {
  wordReducer,
  initialState as wordInitialState,
  State as WordState,
  Action as WordAction,
} from './hooks/wordReducer'
import { ThemeValue } from './lib/theme'
import PKG from '../package.json'
import html2canvas from 'html2canvas'

const ALERT_TIME_MS = 2000
const NEW_MODAL_TIME_MS = 500

function App() {
  const { state, dispatch } = usePersistedReducer<GameState, GameAction>(
    gameReducer,
    gameInitialState,
    gameKey
  )

  const { difficulty, theme, view, game, stats, info } = state

  const { state: wordsState, dispatch: dispatchWord } = usePersistedReducer<
    WordState,
    WordAction
  >(wordReducer, wordInitialState, wordKey, false)
  const context = React.useContext(ThemeContext)

  const {
    day,
    random,
    solution: loadedSolution,
    guesses = [],
    currentGuess = getInitialCurentGuess(difficulty),
  } = game?.[difficulty] ?? getInitialState(difficulty)

  const [globalStats, setGlobalStats] = useState()
  const [isGameWon, setIsGameWon] = useState<Record<number, boolean>>({})
  const [isGameLost, setIsGameLost] = useState<Record<number, boolean>>({})
  const [isModalOpen, setIsModalOpenState] = useState<ModalType>(false)
  const [isModalOpenRegistered, setIsModalOpenRegistered] =
    useState<ModalType>(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [shareComplete, setShareComplete] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [successAlert, setSuccessAlert] = useState('')
  const [userInteracted, setUserInteracted] = useState(false)
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 })

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const currentGuessLength = useMemo(
    () => getGuessLength(currentGuess),
    [currentGuess]
  )

  const [{ solution, solutionCreator }, setSolution] = useState<{
    solution: Word
    solutionCreator?: string
  }>(getCurrentWord(day, difficulty))

  useEffect(() => {
    const size = getSize()

    if (size > 1024 * 1024) {
      truncate('id')

      window.location.reload()
    }
  }, [])

  useEffect(() => {
    setSolution(
      random > -1
        ? getRandomWord(random, difficulty)
        : getCurrentWord(day, difficulty)
    )
  }, [day, difficulty, random, wordsState])

  const maxGuess = useMemo(
    () => MAX_NUMBER_OF_GUESSES[difficulty],
    [difficulty]
  )

  const setIsModalOpen = useCallback((type: ModalType) => {
    type && setIsModalOpenRegistered(type)
    setIsModalOpenState(type)
  }, [])

  useEffect(() => {
    if (theme !== context.theme) {
      context.setTheme(theme)
    }
  }, [context, dispatch, theme])

  useEffect(() => {
    if (loadedSolution && !isWordEqual(solution, loadedSolution)) {
      dispatch({
        type: 'UPDATE_GAME',
        difficulty,
        solution: solution,
        guesses: [],
        currentGuess: getInitialCurentGuess(difficulty),
      })
      return
    }

    const gameWasWon = guesses.some((guess) => isWordEqual(guess, solution))
    if (gameWasWon) {
      setIsGameWon({ [difficulty]: true })
    }
    if (guesses.length === maxGuess && !gameWasWon) {
      setIsGameLost({ [difficulty]: true })
    }
  }, [difficulty, dispatch, guesses, loadedSolution, maxGuess, solution])

  useEffect(() => {
    if (!info?.[difficulty]) {
      setIsModalOpen('info')
      dispatch({ type: 'SET_INFO', difficulty, seen: true })
    }
  }, [difficulty, dispatch, info, setIsModalOpen])

  useEffect(() => {
    isLocalhost() && console.log('Solution', solution)
    getGlobalStatsFromAPI().then((data) => setGlobalStats(data))

    getStateFromAPI().then((data) => {
      if (data) {
        dispatch({
          type: 'UPDATE_STATE',
          state: data,
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    getStaticWords(difficulty, ({ group, words }) => {
      dispatchWord({
        type: 'UPDATE_STATE',
        state: {
          [group]: words,
        },
      })
    })
  }, [difficulty, dispatchWord])

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

  const stateToAPITimeout = useRef<NodeJS.Timeout>()
  useEffect(() => {
    checkViewPort()
    if (userInteracted && !solutionCreator) {
      stateToAPITimeout.current && clearTimeout(stateToAPITimeout.current)
      stateToAPITimeout.current = setTimeout(
        () => sendStateToAPI(state)?.then((data) => setGlobalStats(data)),
        200
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userInteracted])

  useEffect(() => {
    if (!isGameWon[difficulty] && !isGameLost[difficulty]) {
      setSuccessAlert('')
      return
    }

    setSuccessAlert(
      isGameWon[difficulty]
        ? WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
        : ''
    )
    setTimeout(() => {
      !(['new-game', 'new-game-confirm'] as ModalType[]).includes(
        isModalOpenRegistered
      ) && setIsModalOpen('stat')
    }, ALERT_TIME_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameLost, isGameWon])

  const onChar = (value: CharValue) => {
    checkViewPort()
    if (
      currentGuessLength < difficulty &&
      guesses.length < maxGuess &&
      !isGameWon[difficulty]
    ) {
      setUserInteracted(true)

      dispatch({
        type: 'UPDATE_CURRENT_GUESS',
        difficulty,
        currentGuess: setLetter(currentGuess, value, difficulty),
      })
    }
  }

  const onReplace = (value: CharValue, index?: number) => {
    checkViewPort()
    if (
      currentGuessLength - 1 < difficulty &&
      guesses.length < maxGuess &&
      !isGameWon[difficulty]
    ) {
      setUserInteracted(true)

      if (isNil(index)) {
        dispatch({
          type: 'UPDATE_CURRENT_GUESS',
          difficulty,
          currentGuess: removeLetter(currentGuess, value),
        })
      } else {
        dispatch({
          type: 'UPDATE_CURRENT_GUESS',
          difficulty,
          currentGuess: setLetter(currentGuess, value, difficulty, index),
        })
      }
    }
  }

  const onDelete = () => {
    checkViewPort()
    if (currentGuessLength - 1 >= 0 && !isGameWon[difficulty]) {
      setUserInteracted(true)

      dispatch({
        type: 'UPDATE_CURRENT_GUESS',
        difficulty,
        currentGuess: removeLetter(currentGuess),
      })
    }
  }

  const onEnter = () => {
    checkViewPort()
    if (isGameWon[difficulty] || isGameLost[difficulty]) {
      return
    }

    if (currentGuessLength !== difficulty) {
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
      currentGuessLength === difficulty &&
      guesses.length < maxGuess &&
      !isGameWon[difficulty]
    ) {
      dispatch({
        type: 'UPDATE_GUESSES',
        difficulty,
        guesses: [...guesses, currentGuess],
      })
      dispatch({
        type: 'UPDATE_CURRENT_GUESS',
        difficulty,
        currentGuess: getInitialCurentGuess(difficulty),
      })
      if (winningWord) {
        dispatch({
          type: 'UPDATE_STATS',
          difficulty,
          stats: addStatsForCompletedGame(stats, guesses.length, difficulty),
        })
        addGTM('event', 'win', {
          guess: currentGuess.join(''),
          difficulty,
        })
        return setIsGameWon({ [difficulty]: true })
      }

      if (guesses.length === maxGuess - 1) {
        dispatch({
          type: 'UPDATE_STATS',
          difficulty,
          stats: addStatsForCompletedGame(
            stats,
            guesses.length + 1,
            difficulty
          ),
        })
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

  const handleDifficultyChange = (value: Difficulty) => {
    setSuccessAlert('')
    addGTM('event', 'changeDifficulty', {
      previous: difficulty,
      current: value,
    })
    setUserInteracted(true)
    dispatch({ type: 'SET_DIFFICULTY', difficulty: value })
  }

  const handleScreenShot = useCallback(() => {
    const canvas = document.createElement('canvas')

    return canvas
    // if (gridContainerRef.current && gridSize.height) {
    //   const grid = gridContainerRef.current.querySelector(
    //     '.grid'
    //   ) as HTMLDivElement
    //   if (grid) {
    //     const currentPadding = gridContainerRef.current.style.padding
    //     const currentHeight = grid.style.height
    //     const currentAutoRows = grid.style.gridAutoRows
    //     const rowHeight =
    //       gridSize.height / MAX_NUMBER_OF_GUESSES[difficulty] - 5
    //     gridContainerRef.current.style.padding = '5px'
    //     gridContainerRef.current.style.overflowY = 'hidden'
    //     grid.style.height = `${gridSize.height}px`
    //     grid.style.gridAutoRows = `${rowHeight}px`
    //     return html2canvas(gridContainerRef.current, {
    //       backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    //     }).then((canvas) => {
    //       if (gridContainerRef.current) {
    //         gridContainerRef.current.style.padding = currentPadding
    //         gridContainerRef.current.style.overflowY = 'auto'
    //         if (grid) {
    //           grid.style.height = currentHeight
    //           grid.style.gridAutoRows = currentAutoRows
    //         }
    //       }
    //       return Promise.resolve(canvas)
    //     })
    //   }
    // }
    // return Promise.reject()
  }, [])

  const handleNewGame = (type: GameType) => {
    addGTM('event', 'newGame', { difficulty })
    setUserInteracted(true)
    setIsGameLost({ [difficulty]: false })
    setIsGameWon({ [difficulty]: false })
    dispatch({
      type: 'UPDATE_GAME',
      difficulty,
      guesses: [],
      currentGuess: getInitialCurentGuess(difficulty),
    })
    if (type === 'in-row') {
      dispatch({ type: 'SET_RANDOM', difficulty, random: -1 })
      dispatch({ type: 'SET_DAY', difficulty, day: day + 1 })
    } else {
      getAllWords(difficulty)
      dispatch({
        type: 'SET_RANDOM',
        difficulty,
        random: rand(0, getAllWords(difficulty).length - 1),
      })
    }
    setSuccessAlert('')
    setIsModalOpen(false)
    setIsModalOpenRegistered(false)
  }

  const handleManualEnd = () => {
    setIsModalOpen(false)
    setUserInteracted(true)
    if (!isGameWon[difficulty]) {
      const emptyRow = times(difficulty, () => '-') as Word
      const newCurrentGuess = emptyRow.map(
        (letter, index) => currentGuess[index] ?? letter
      )
      const newGuesses = [...guesses, newCurrentGuess].filter(
        (guess) => guess.length
      )
      for (let i = 0; i < maxGuess; i++) {
        if (!newGuesses[i]) {
          newGuesses[i] = [...emptyRow]
        }
      }

      addGTM('event', 'giveUp', { difficulty, guesses: newGuesses })
      dispatch({ type: 'UPDATE_GUESSES', difficulty, guesses: newGuesses })
      dispatch({
        type: 'UPDATE_STATS',
        difficulty,
        stats: addStatsForCompletedGame(stats, newGuesses.length, difficulty),
      })
      setIsGameLost({ [difficulty]: true })
    }
    setIsModalOpenRegistered('new-game')
    setTimeout(() => {
      setSuccessAlert('')
      setIsModalOpen('new-game')
    }, NEW_MODAL_TIME_MS)
  }

  const handleGridIcon = (newView: View) => {
    setUserInteracted(true)
    dispatch({ type: 'SET_VIEW', view: newView })
  }

  const handleTheme = (newTheme: ThemeValue) => {
    setUserInteracted(true)
    dispatch({ type: 'SET_THEME', theme: newTheme })
  }

  const handleModalClose = (newModal?: ModalType) => {
    const fallbackModal = newModal ?? checkIsModalCallback()
    setIsModalOpen(false)
    setIsModalOpenRegistered(false)
    if (fallbackModal) {
      setIsModalOpenRegistered(fallbackModal)
      setTimeout(() => {
        setIsModalOpen(fallbackModal)
      }, NEW_MODAL_TIME_MS)
    }
  }

  const debugInfo = () => {
    if (new URLSearchParams(window.location.search).get('debug') === '1') {
      return (
        <div
          id="debug-info"
          className="bg-white dark:bg-gray-800 max-h-[200px] overflow-auto text-xs dark:text-gray-300"
        >
          {map(getDebugInfo(), (info, key) => (
            <div>
              <b>{key}:</b> {info}
            </div>
          ))}
        </div>
      )
    }

    return ''
  }

  if (
    wordsState.all.length === 0 ||
    wordsState.selected.length === 0 ||
    wordsState.random.length === 0 ||
    !solution
  ) {
    return (
      <div className={context.theme + ' h-[100%] '}>
        <div className="flex justify-center content-center text-center flex-col bg-white dark:bg-gray-800 h-[100%]">
          {debugInfo()}
          <span className="text-xs dark:text-gray-300">{PKG.version}</span>
          <span className="text-5xl mb-5 dark:text-gray-300">Betöltés</span>
          <Icon
            component={RefreshIcon}
            isStandalone
            className="w-40 h-40 animate-spin"
            style={{
              animationDuration: '2s',
              animationDirection: 'reverse',
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={context.theme + ' h-[100%]'}>
      {debugInfo()}
      <Alert message="Nincs elég betű" isOpen={isNotEnoughLetters} />
      <Alert
        message="Nem találtunk ilyen szót"
        isOpen={isWordNotFoundAlertOpen}
      />
      <Alert
        message={`Vesztettél, a megoldás ez volt: ${solution?.join('')}`}
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
        className="z-[1020]"
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
      <DevModal
        isOpen={checkIsModalOpen('dev')}
        solution={solution}
        handleClose={handleModalClose}
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
        solutionCreator={solutionCreator}
        handleShareCopySuccess={handleShareCopySuccess}
        handleShareFailure={handleShareFailure}
        handleNewGameClick={handleNewGame}
        screenshot={handleScreenShot}
        stats={stats}
        globalStats={globalStats}
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
          <div className="flex  mx-1 items-center mb-8 relative z-20">
            <h1 className="text-xl font-bold dark:text-gray-300">
              Szózat<sup>+</sup>
            </h1>
            <Icon
              component={InformationCircleIcon}
              onClick={() => {
                setIsModalOpen('info')
              }}
            />
            <DifficultyList
              selected={difficulty}
              onChange={handleDifficultyChange}
            />
            <Icon
              component={ThemeToggle}
              onClick={(themeValue) => handleTheme(themeValue)}
              className="h-6 w-6 ml-0"
            />
            <Icon
              component={view === 'full' ? ViewGridIcon : ViewGridAddIcon}
              onClick={() =>
                handleGridIcon(view === 'full' ? 'compact' : 'full')
              }
            />
            <Icon
              component={ChartBarIcon}
              onClick={() => {
                setIsModalOpen('stat')
              }}
            />
            <Icon
              component={PlusCircleIcon}
              onClick={() => {
                setIsModalOpen('create-puzzle')
              }}
            />
            <Icon
              component={PuzzleIcon}
              onClick={() => {
                setIsModalOpen(
                  isGameWon[difficulty] || isGameLost[difficulty]
                    ? 'new-game'
                    : 'new-game-confirm'
                )
              }}
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
              full={view === 'full'}
              difficulty={difficulty}
              showCurrentRow={!isGameWon[difficulty]}
            />
          </div>
          <div className="pb-5">
            <Keyboard
              onChar={onChar}
              onDelete={onDelete}
              onReplace={onReplace}
              onEnter={onEnter}
              onDevClicks={{
                D: () => {
                  handleModalClose('dev')
                },
                R: () => window.location.reload(),
              }}
              guesses={guesses}
              currentGuess={currentGuess}
              day={day}
              random={random}
              difficulty={difficulty}
              enabledOnEnter={currentGuessLength === difficulty}
              enabledOnDelete={currentGuessLength > 0}
              noDrag={isGameLost[difficulty] || isGameWon[difficulty]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
