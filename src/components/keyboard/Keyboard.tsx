import { KeyValue } from '../../lib/keyboard'
import { CharValue, getStatuses, Word, isCharValue } from '../../lib/statuses'
import { Key } from './Key'
import { useEffect, useRef } from 'react'

type Props = {
  onChar: (value: CharValue) => void
  onReplace: (value: CharValue) => void
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
  onReplace,
  onEnter,
  guesses,
  day,
  difficulty,
  enabledOnEnter,
  enabledOnDelete,
}: Props) => {
  const charStatuses = getStatuses(guesses, day, difficulty)
  const lastKey = useRef('')

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
        const upperKey = e.key.toUpperCase()
        const key =
          e.shiftKey && isCharValue(lastKey.current + upperKey)
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
      const bottomCheck = document.querySelector(
        '.bottom-check'
      ) as HTMLDivElement

      if (bottomCheck) {
        const heightDiff =
          window.outerHeight - bottomCheck.offsetTop + bottomCheck.offsetHeight

        document.body.style.height = `calc(100vh - ${heightDiff / 1.5}px)`
      }
    }
    resize()
    window.addEventListener('keyup', listener)
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('keyup', listener)
      window.removeEventListener('resize', resize)
    }
  }, [onEnter, onDelete, onChar, onReplace])

  return (
    <div>
      <div className="bottom-check fixed bottom-0" />
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
        <Key
          value="E"
          additional={{ É: charStatuses['É'] }}
          onClick={onClick}
          status={charStatuses['E']}
        />
        <Key value="R" onClick={onClick} status={charStatuses['R']} />
        <Key
          value="T"
          additional={{ TY: charStatuses['TY'] }}
          onClick={onClick}
          status={charStatuses['T']}
        />
        <Key
          value="Z"
          additional={{ ZS: charStatuses['ZS'] }}
          onClick={onClick}
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
          status={charStatuses['U']}
        />
        <Key
          value="I"
          additional={{ Í: charStatuses['Í'] }}
          onClick={onClick}
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
          status={charStatuses['O']}
        />
        <Key value="P" onClick={onClick} status={charStatuses['P']} />
        <Key value="Ő" onClick={onClick} status={charStatuses['Ő']} />
        <Key value="Ú" onClick={onClick} status={charStatuses['Ú']} />
      </div>
      <div className="flex justify-center mb-1">
        <Key
          value="A"
          additional={{ Á: charStatuses['Á'] }}
          onClick={onClick}
          status={charStatuses['A']}
        />
        <Key
          value="S"
          additional={{ SZ: charStatuses['SZ'] }}
          onClick={onClick}
          status={charStatuses['S']}
        />
        <Key
          value="D"
          additional={{ DZ: charStatuses['DZ'], DZS: charStatuses['DZS'] }}
          onClick={onClick}
          status={charStatuses['D']}
        />
        <Key value="F" onClick={onClick} status={charStatuses['F']} />
        <Key
          value="G"
          additional={{ GY: charStatuses['GY'] }}
          onClick={onClick}
          status={charStatuses['G']}
        />
        <Key value="H" onClick={onClick} status={charStatuses['H']} />
        <Key value="J" onClick={onClick} status={charStatuses['J']} />
        <Key value="K" onClick={onClick} status={charStatuses['K']} />
        <Key
          value="L"
          additional={{ LY: charStatuses['LY'] }}
          onClick={onClick}
          status={charStatuses['L']}
        />
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
        <Key
          value="C"
          additional={{ CS: charStatuses['CS'] }}
          onClick={onClick}
          status={charStatuses['C']}
        />
        <Key value="V" onClick={onClick} status={charStatuses['V']} />
        <Key value="B" onClick={onClick} status={charStatuses['B']} />
        <Key
          value="N"
          additional={{ NY: charStatuses['NY'] }}
          onClick={onClick}
          status={charStatuses['N']}
        />
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
