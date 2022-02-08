import { useEffect, useMemo, useReducer } from 'react'
import deepEqual from 'fast-deep-equal/es6'
import { usePrevious } from './usePrevious'
import * as localstorage from '../lib/localStorage'
import indexedDB from 'localforage'

const engines = {
  localstorage,
  indexedDB,
}
type Engine = 'localstorage' | 'indexedDB'

export const usePersistedReducer = <State, Action>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
  storageKey: string,
  shouldEncrypt = true,
  engine?: Engine
) => {
  const usedEngine = useMemo(() => engine ?? 'localstorage', [engine])
  const [state, dispatch] = useReducer(reducer, initialState, init)
  const prevState = usePrevious(state)

  function init(): State {
    const stringState = engines[usedEngine].getItem(storageKey)

    if (stringState && typeof stringState === 'string') {
      try {
        return JSON.parse(stringState)
      } catch (error) {
        return initialState
      }
    }

    return initialState
  }

  useEffect(() => {
    const stateEqual = deepEqual(prevState, state)
    if (!stateEqual) {
      const stringifiedState = JSON.stringify(state)
      try {
        engines[usedEngine].setItem(
          storageKey,
          stringifiedState,
          undefined,
          shouldEncrypt
        )
      } catch (err) {
        console.log('Debug', err)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, storageKey])

  return { state, dispatch }
}
