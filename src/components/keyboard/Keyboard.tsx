import { KeyValue } from '../../lib/keyboard'
import { CharValue, getStatuses, Word, isCharValue } from '../../lib/statuses'
import { Key } from './Key'
import { useEffect } from 'react'

type Props = {
  onChar: (value: CharValue) => void
  onDelete: () => void
  onEnter: () => void
  guesses: Word[]
  day: number
  difficulty: number
  enabledOnEnter?: boolean
  enabledOnDelete?: boolean
}

export const Keyboard = ({
  onChar,
  onDelete,
  onEnter,
  guesses,
  day,
  difficulty,
  enabledOnEnter,
  enabledOnDelete,
}: Props) => {
  const charStatuses = getStatuses(guesses, day, difficulty)

  const onClick = (value: KeyValue) => {
    if (value === 'ENTER') {
      onEnter()
    } else if (value === 'DELETE') {
      onDelete()
    } else {
      onChar(value)
    }
  }

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        onEnter()
      } else if (e.code === 'Backspace') {
        onDelete()
      } else {
        const key = e.key.toUpperCase()
        if (key.length === 1 && isCharValue(key)) {
          onChar(key)
        }
      }
    }
    window.addEventListener('keyup', listener)
    return () => {
      window.removeEventListener('keyup', listener)
    }
  }, [onEnter, onDelete, onChar])

  return (
    <div>
      <div className="flex justify-center mb-1">
        <Key value="CS" onClick={onClick} status={charStatuses['CS']} />
        <Key value="DZ" onClick={onClick} status={charStatuses['DZ']} />
        <Key value="DZS" onClick={onClick} status={charStatuses['DZS']} />
        <Key value="GY" onClick={onClick} status={charStatuses['GY']} />
        <Key value="LY" onClick={onClick} status={charStatuses['LY']} />
        <Key value="NY" onClick={onClick} status={charStatuses['NY']} />
        <Key value="SZ" onClick={onClick} status={charStatuses['SZ']} />
        <Key value="TY" onClick={onClick} status={charStatuses['TY']} />
        <Key value="ZS" onClick={onClick} status={charStatuses['ZS']} />
        <Key value="Ö" onClick={onClick} status={charStatuses['Ö']} />
        <Key value="Ü" onClick={onClick} status={charStatuses['Ü']} />
        <Key value="Ó" onClick={onClick} status={charStatuses['Ó']} />
      </div>
      <div className="flex justify-center mb-1">
        <Key value="Q" onClick={onClick} status={charStatuses['Q']} />
        <Key value="W" onClick={onClick} status={charStatuses['W']} />
        <Key value="E" onClick={onClick} status={charStatuses['E']} />
        <Key value="R" onClick={onClick} status={charStatuses['R']} />
        <Key value="T" onClick={onClick} status={charStatuses['T']} />
        <Key value="Z" onClick={onClick} status={charStatuses['Z']} />
        <Key value="U" onClick={onClick} status={charStatuses['U']} />
        <Key value="I" onClick={onClick} status={charStatuses['I']} />
        <Key value="O" onClick={onClick} status={charStatuses['O']} />
        <Key value="P" onClick={onClick} status={charStatuses['P']} />
        <Key value="Ő" onClick={onClick} status={charStatuses['Ő']} />
        <Key value="Ú" onClick={onClick} status={charStatuses['Ú']} />
      </div>
      <div className="flex justify-center mb-1">
        <Key value="A" onClick={onClick} status={charStatuses['A']} />
        <Key value="S" onClick={onClick} status={charStatuses['S']} />
        <Key value="D" onClick={onClick} status={charStatuses['D']} />
        <Key value="F" onClick={onClick} status={charStatuses['F']} />
        <Key value="G" onClick={onClick} status={charStatuses['G']} />
        <Key value="H" onClick={onClick} status={charStatuses['H']} />
        <Key value="J" onClick={onClick} status={charStatuses['J']} />
        <Key value="K" onClick={onClick} status={charStatuses['K']} />
        <Key value="L" onClick={onClick} status={charStatuses['L']} />
        <Key value="É" onClick={onClick} status={charStatuses['É']} />
        <Key value="Á" onClick={onClick} status={charStatuses['Á']} />
        <Key value="Ű" onClick={onClick} status={charStatuses['Ű']} />
      </div>
      <div className="flex justify-center">
        <Key
          width={65.4}
          className="bg-lime-500 text-white hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
          value="ENTER"
          onClick={onClick}
          disabled={!enabledOnEnter}
        >
          Beküld
        </Key>
        <Key value="Í" onClick={onClick} status={charStatuses['Í']} />
        <Key value="Y" onClick={onClick} status={charStatuses['Y']} />
        <Key value="X" onClick={onClick} status={charStatuses['X']} />
        <Key value="C" onClick={onClick} status={charStatuses['C']} />
        <Key value="V" onClick={onClick} status={charStatuses['V']} />
        <Key value="B" onClick={onClick} status={charStatuses['B']} />
        <Key value="N" onClick={onClick} status={charStatuses['N']} />
        <Key value="M" onClick={onClick} status={charStatuses['M']} />
        <Key
          width={65.4}
          className="bg-red-500 text-white hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          value="DELETE"
          onClick={onClick}
          disabled={!enabledOnDelete}
        >
          Töröl
        </Key>
      </div>
    </div>
  )
}
