import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set } from 'firebase/database'
import { useCallback, useMemo, useState } from 'react'

export type Status = 'done' | 'error' | 'writing' | 'reading'

export const useFirebase = () => {
  const [config, setConfig] = useState({
    apiKey: 'AIzaSyB3t2FtRf-tgGwlzkMFZ7GjEtxAoHLciYU',
    authDomain: 'szozat-8d4f9.firebaseapp.com',
    projectId: 'szozat-8d4f9',
    storageBucket: 'szozat-8d4f9.appspot.com',
    messagingSenderId: '68391754604',
    appId: '1:68391754604:web:d71bf794eb34044aad7149',
  })
  const [status, setStatus] = useState<Status>('done')

  const app = useMemo(() => initializeApp(config), [config])
  const database = useMemo(() => getDatabase(app), [app])

  const write = useCallback(
    (table: string, data: unknown) =>
      new Promise((resolve, reject) => {
        setStatus('writing')
        set(ref(database, table), data)
          .then((value) => {
            setStatus('done')
            resolve(value)
          })
          .catch((reason) => {
            setStatus('error')
            reject(reason)
          })
      }),
    [database]
  )

  console.log('STATUS', status)

  return {
    app,
    status,
    database,
    config,
    setConfig,
    write,
  }
}
