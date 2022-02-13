import { KeyValue } from '../../lib/keyboard'
import { CharValue, getStatuses, Word, isCharValue } from '../../lib/statuses'
import { Key } from './Key'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Difficulty } from '../../hooks/gameReducer'

type Props = {
  onChar: (value: CharValue) => void
  onReplace: (value: CharValue, index?: number) => void
  onDelete: () => void
  onEnter: () => void
  onDevClick?: (value: KeyValue) => void
  guesses: Word[]
  currentGuess: Word
  day: number
  random: number
  difficulty: Difficulty
  enabledOnEnter?: boolean
  enabledOnDelete?: boolean
  noDrag?: boolean
}

export const Keyboard = ({
  onChar,
  onDelete,
  onReplace,
  onEnter,
  onDevClick,
  guesses,
  currentGuess,
  day,
  random,
  difficulty,
  enabledOnEnter,
  enabledOnDelete,
  noDrag,
}: Props) => {
  const charStatuses = getStatuses(guesses, day, random, difficulty)
  const lastKey = useRef('')
  const documentHeight = useRef(document.documentElement.offsetHeight)

  const onClick = useCallback(
    (value: KeyValue) => {
      if (value === 'ENTER') {
        onEnter()
      } else if (value === 'DELETE') {
        onDelete()
      } else {
        onChar(value)
      }
    },
    [onChar, onDelete, onEnter]
  )

  const onDrop = useCallback(
    (value: KeyValue, index: number) => {
      onReplace(value, index)
    },
    [onReplace]
  )

  useEffect(() => {
    const keyup = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        onEnter()
      } else if (e.code === 'Backspace') {
        const key = currentGuess?.[(currentGuess?.length ?? 0) - 1] ?? ''
        const shorterKey = key.substring(0, key.length - 1)

        if (!e.shiftKey && isCharValue(shorterKey)) {
          onReplace(shorterKey)
          lastKey.current = shorterKey
        } else {
          lastKey.current =
            currentGuess?.[(currentGuess?.length ?? 0) - 2] ?? ''
          onDelete()
        }
      } else {
        const upperKey = e.key.toUpperCase()
        const key =
          !e.shiftKey && isCharValue(lastKey.current + upperKey)
            ? lastKey.current + upperKey
            : upperKey
        if (key.length === 1 && isCharValue(key)) {
          onChar(key)
          lastKey.current = key
        }
        if (key.length > 1 && isCharValue(key)) {
          onReplace(key)
          lastKey.current = key
        }
      }
    }

    const resize = () => {
      const bottomCheck =
        document.querySelector<HTMLDivElement>('.bottom-check')

      if (bottomCheck) {
        const heightDiff = documentHeight.current - window.innerHeight

        document.body.style.height = `calc(100vh - ${
          heightDiff < 0 ? 0 : heightDiff
        }px)`
      }
    }
    resize()
    window.addEventListener('keyup', keyup)
    window.addEventListener('resize.keyboard', resize)
    return () => {
      window.removeEventListener('keyup', keyup)
      window.removeEventListener('resize.keyboard', resize)
    }
  }, [onEnter, onDelete, onChar, onReplace, currentGuess])

  const keyProps = useMemo(
    () => ({
      onClick,
      onDrop,
      noDrag,
    }),
    [noDrag, onClick, onDrop]
  )

  return (
    <div>
      <div className="bottom-check fixed bottom-0" />
      <div className="flex relative justify-center mb-1">
        <Key value="CS" status={charStatuses['CS']} {...keyProps} />
        <Key value="DZ" status={charStatuses['DZ']} {...keyProps} />
        <Key value="DZS" status={charStatuses['DZS']} {...keyProps} />
        <Key value="GY" status={charStatuses['GY']} {...keyProps} />
        <Key value="LY" status={charStatuses['LY']} {...keyProps} />
        <Key value="NY" status={charStatuses['NY']} {...keyProps} />
        <Key value="SZ" status={charStatuses['SZ']} {...keyProps} />
        <Key value="TY" status={charStatuses['TY']} {...keyProps} />
        <Key value="ZS" status={charStatuses['ZS']} {...keyProps} />
        <Key value="Ö" status={charStatuses['Ö']} {...keyProps} />
        <Key value="Ü" status={charStatuses['Ü']} {...keyProps} />
        <Key value="Ó" status={charStatuses['Ó']} {...keyProps} />
      </div>
      <div className="flex relative justify-center mb-1">
        <Key value="Q" status={charStatuses['Q']} {...keyProps} />
        <Key value="W" status={charStatuses['W']} {...keyProps} />
        <Key
          value="E"
          additional={{ É: charStatuses['É'] }}
          status={charStatuses['E']}
          {...keyProps}
        />
        <Key value="R" status={charStatuses['R']} {...keyProps} />
        <Key
          value="T"
          additional={{ TY: charStatuses['TY'] }}
          status={charStatuses['T']}
          {...keyProps}
        />
        <Key
          value="Z"
          additional={{ ZS: charStatuses['ZS'] }}
          status={charStatuses['Z']}
          {...keyProps}
        />
        <Key
          value="U"
          additional={{
            Ú: charStatuses['Ú'],
            Ü: charStatuses['Ü'],
            Ű: charStatuses['Ű'],
          }}
          status={charStatuses['U']}
          {...keyProps}
        />
        <Key
          value="I"
          additional={{ Í: charStatuses['Í'] }}
          status={charStatuses['I']}
          {...keyProps}
        />
        <Key
          value="O"
          additional={{
            Ó: charStatuses['Ó'],
            Ö: charStatuses['Ö'],
            Ő: charStatuses['Ő'],
          }}
          status={charStatuses['O']}
          {...keyProps}
        />
        <Key value="P" status={charStatuses['P']} {...keyProps} />
        <Key value="Ő" status={charStatuses['Ő']} {...keyProps} />
        <Key value="Ú" status={charStatuses['Ú']} {...keyProps} />
      </div>
      <div className="flex relative justify-center mb-1">
        <Key
          value="A"
          additional={{ Á: charStatuses['Á'] }}
          status={charStatuses['A']}
          {...keyProps}
        />
        <Key
          value="S"
          additional={{ SZ: charStatuses['SZ'] }}
          status={charStatuses['S']}
          {...keyProps}
        />
        <Key
          value="D"
          additional={{ DZ: charStatuses['DZ'], DZS: charStatuses['DZS'] }}
          onDevClick={onDevClick}
          status={charStatuses['D']}
          {...keyProps}
        />
        <Key value="F" onClick={onClick} status={charStatuses['F']} />
        <Key
          value="G"
          additional={{ GY: charStatuses['GY'] }}
          status={charStatuses['G']}
          {...keyProps}
        />
        <Key value="H" status={charStatuses['H']} {...keyProps} />
        <Key value="J" status={charStatuses['J']} {...keyProps} />
        <Key value="K" status={charStatuses['K']} {...keyProps} />
        <Key
          value="L"
          additional={{ LY: charStatuses['LY'] }}
          status={charStatuses['L']}
          {...keyProps}
        />
        <Key value="É" status={charStatuses['É']} {...keyProps} />
        <Key value="Á" status={charStatuses['Á']} {...keyProps} />
        <Key value="Ű" status={charStatuses['Ű']} {...keyProps} />
      </div>
      <div className="flex relative justify-center">
        <Key
          width={65.4}
          className="bg-lime-500 text-white hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
          value="ENTER"
          onClick={onClick}
          disabled={!enabledOnEnter}
          noDrag
        >
          Beküld
        </Key>
        <Key value="Í" status={charStatuses['Í']} {...keyProps} />
        <Key value="Y" status={charStatuses['Y']} {...keyProps} />
        <Key value="X" status={charStatuses['X']} {...keyProps} />
        <Key
          value="C"
          additional={{ CS: charStatuses['CS'] }}
          status={charStatuses['C']}
          {...keyProps}
        />
        <Key value="V" status={charStatuses['V']} {...keyProps} />
        <Key value="B" status={charStatuses['B']} {...keyProps} />
        <Key
          value="N"
          additional={{ NY: charStatuses['NY'] }}
          status={charStatuses['N']}
          {...keyProps}
        />
        <Key value="M" status={charStatuses['M']} {...keyProps} />
        <Key
          width={65.4}
          className="bg-red-500 text-white hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          value="DELETE"
          onClick={onClick}
          disabled={!enabledOnDelete}
          noDrag
        >
          Töröl
        </Key>
      </div>
    </div>
  )
}
