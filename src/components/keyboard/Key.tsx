import { ReactNode } from 'react'
import classnames from 'classnames'
import { KeyValue } from '../../lib/keyboard'
import { CharStatus } from '../../lib/statuses'

type Props = {
  children?: ReactNode
  value: KeyValue
  width?: number
  status?: CharStatus
  className?: string
  disabled?: boolean
  onClick: (value: KeyValue) => void
}

export const Key = ({
  children,
  status,
  width = 40,
  value,
  className,
  onClick,
  disabled,
}: Props) => {
  const classes = classnames(
    'flex items-center justify-center rounded mx-0.5 text-xs font-bold cursor-pointer select-none',
    className ?? {
      'bg-slate-200 dark:bg-slate-500 hover:bg-slate-600 dark:hover:bg-slate-400 active:bg-slate-400 dark:text-slate-900':
        !status,
      'bg-slate-400 text-white': status === 'absent',
      'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white':
        status === 'correct',
      'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white':
        status === 'present',
    }
  )

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick(value)
    event.currentTarget.blur()
  }

  return (
    <button
      disabled={!!disabled}
      style={{ width: `${width}px`, height: '50px' }}
      className={classes}
      onClick={handleClick}
    >
      {children || value}
    </button>
  )
}
