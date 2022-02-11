import { KeyValue } from '../../lib/keyboard'
import { CharValue, getStatuses, Word, isCharValue } from '../../lib/statuses'
import { Key } from './Key'
import { useEffect, useRef } from 'react'
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
}: Props) => {
  const charStatuses = getStatuses(guesses, day, random, difficulty)
  const lastKey = useRef('')
  const documentHeight = useRef(document.documentElement.offsetHeight)

  const onClick = (value: KeyValue) => {
    if (value === 'ENTER') {
      onEnter()
    } else if (value === 'DELETE') {
      onDelete()
    } else {
      onChar(value)
    }
  }

  const onDrop = (value: KeyValue, index: number) => {
    onReplace(value, index)
  }

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

  return (
    <div>
      <div className="bottom-check fixed bottom-0" />
      <div className="flex relative justify-center mb-1">
        <Key
          value="CS"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['CS']}
        />
        <Key
          value="DZ"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['DZ']}
        />
        <Key
          value="DZS"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['DZS']}
        />
        <Key
          value="GY"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['GY']}
        />
        <Key
          value="LY"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['LY']}
        />
        <Key
          value="NY"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['NY']}
        />
        <Key
          value="SZ"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['SZ']}
        />
        <Key
          value="TY"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['TY']}
        />
        <Key
          value="ZS"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['ZS']}
        />
        <Key
          value="Ö"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Ö']}
        />
        <Key
          value="Ü"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Ü']}
        />
        <Key
          value="Ó"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Ó']}
        />
      </div>
      <div className="flex relative justify-center mb-1">
        <Key
          value="Q"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Q']}
        />
        <Key
          value="W"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['W']}
        />
        <Key
          value="E"
          additional={{ É: charStatuses['É'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['E']}
        />
        <Key
          value="R"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['R']}
        />
        <Key
          value="T"
          additional={{ TY: charStatuses['TY'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['T']}
        />
        <Key
          value="Z"
          additional={{ ZS: charStatuses['ZS'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Z']}
        />
        <Key
          value="U"
          additional={{
            Ú: charStatuses['Ú'],
            Ü: charStatuses['Ü'],
            Ű: charStatuses['Ű'],
          }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['U']}
        />
        <Key
          value="I"
          additional={{ Í: charStatuses['Í'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['I']}
        />
        <Key
          value="O"
          additional={{
            Ó: charStatuses['Ó'],
            Ö: charStatuses['Ö'],
            Ő: charStatuses['Ő'],
          }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['O']}
        />
        <Key
          value="P"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['P']}
        />
        <Key
          value="Ő"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Ő']}
        />
        <Key
          value="Ú"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Ú']}
        />
      </div>
      <div className="flex relative justify-center mb-1">
        <Key
          value="A"
          additional={{ Á: charStatuses['Á'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['A']}
        />
        <Key
          value="S"
          additional={{ SZ: charStatuses['SZ'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['S']}
        />
        <Key
          value="D"
          additional={{ DZ: charStatuses['DZ'], DZS: charStatuses['DZS'] }}
          onClick={onClick}
          onDrop={onDrop}
          onDevClick={onDevClick}
          status={charStatuses['D']}
        />
        <Key value="F" onClick={onClick} status={charStatuses['F']} />
        <Key
          value="G"
          additional={{ GY: charStatuses['GY'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['G']}
        />
        <Key
          value="H"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['H']}
        />
        <Key
          value="J"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['J']}
        />
        <Key
          value="K"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['K']}
        />
        <Key
          value="L"
          additional={{ LY: charStatuses['LY'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['L']}
        />
        <Key
          value="É"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['É']}
        />
        <Key
          value="Á"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Á']}
        />
        <Key
          value="Ű"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Ű']}
        />
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
        <Key
          value="Í"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Í']}
        />
        <Key
          value="Y"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['Y']}
        />
        <Key
          value="X"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['X']}
        />
        <Key
          value="C"
          additional={{ CS: charStatuses['CS'] }}
          onClick={onClick}
          status={charStatuses['C']}
        />
        <Key
          value="V"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['V']}
        />
        <Key
          value="B"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['B']}
        />
        <Key
          value="N"
          additional={{ NY: charStatuses['NY'] }}
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['N']}
        />
        <Key
          value="M"
          onClick={onClick}
          onDrop={onDrop}
          status={charStatuses['M']}
        />
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
