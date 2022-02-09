import { useEffect, useReducer } from 'react'
import deepEqual from 'fast-deep-equal/es6'
import { usePrevious } from './usePrevious'
import logger from 'use-reducer-logger'
import { getItem, setItem } from '../lib/localStorage'
import { isLocalhost } from '../lib/utils'

export const usePersistedReducer = <State, Action>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
  storageKey: string,
  shouldEncrypt = true
) => {
  const [state, dispatch] = useReducer(
    isLocalhost() ? logger(reducer) : reducer,
    initialState,
    init
  )
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
        setItem(storageKey, stringifiedState, undefined, shouldEncrypt)
      } catch (err) {
        console.log('Debug', err)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, storageKey])

  return { state, dispatch }
}
