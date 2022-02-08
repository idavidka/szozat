import { useEffect, useReducer } from 'react'
import deepEqual from 'fast-deep-equal/es6'
import { usePrevious } from './usePrevious'
import { useFirebase } from './useFirebase'
import { getItem, setItem } from '../lib/localStorage'

export const usePersistedReducer = <State, Action>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
  storageKey: string
) => {
  const { database, write } = useFirebase()

  console.log('Database', database)
  const [state, dispatch] = useReducer(reducer, initialState, init)
  const prevState = usePrevious(state)

  function init(): State {
    const stringState = getItem(storageKey)
    if (stringState) {
      try {
        return JSON.parse(stringState)
      } catch (error) {
        return initialState
      }
    } else {
      return initialState
    }
  }

  useEffect(() => {
    const stateEqual = deepEqual(prevState, state)
    if (!stateEqual) {
      const stringifiedState = JSON.stringify(state)
      try {
        write('game/teszt', state)
        setItem(storageKey, stringifiedState)
      } catch (err) {
        console.log('Debug', err)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, storageKey])

  return { state, dispatch }
}
