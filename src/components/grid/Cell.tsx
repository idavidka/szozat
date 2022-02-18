import { CharStatus } from '../../lib/statuses'
import classnames from 'classnames'
import { usePrevious } from '../../hooks/usePrevious'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import { useCallback, useRef } from 'react'
import { KeyValue } from '../../lib/keyboard'

type Props = {
  value?: string
  status?: CharStatus
  className?: string
  isPulsing?: boolean
  onDrop?: (value: KeyValue, index: number) => void
}

export const Cell = ({
  value,
  status,
  className,
  isPulsing,
  onDrop: onDropProp,
}: Props) => {
  const letterRef = useRef<HTMLDivElement>(null)

  const onDrop = useCallback(
    (target: HTMLElement) => {
      if (value && target.parentNode) {
        const index = Array.from(target.parentNode.children).indexOf(target)

        console.log('ASD', value, target)
        onDropProp?.(value, index)
      }
    },
    [onDropProp, value]
  )

  useDragAndDrop({
    enabled: !!value && isPulsing,
    source: letterRef.current,
    target: 'current-row-cell',
    closestClassName: 'letter',
    targetedClassNames: [
      'bg-cyan-600',
      'border-cyan-800',
      'dark:bg-cyan-600',
      'dark:border-cyan-800',
    ],
    onDrop,
  })

  const prevValue = usePrevious(value)
  const containerClasses = classnames(
    'letter grow relative inline-flex justify-center border-solid border-2 rounded before:content-[""] before:block before:pb-[100%] overflow-hidden',
    {
      'bg-white dark:bg-slate-800 border-slate-500 dark:text-slate-100':
        !status,
      'border-black dark:border-slate-400': value && !status,
      'bg-slate-400 text-white border-0': status === 'absent',
      'bg-green-500 text-white border-0': ['correct', 'correct-diff'].includes(
        status ?? ''
      ),
      'bg-yellow-500 text-white border-0': ['present', 'present-diff'].includes(
        status ?? ''
      ),
      'cell-animation': prevValue !== value,
      'current-row-cell': isPulsing,
      'animate-pulse': !value && isPulsing,
      'bg-slate-200 dark:bg-slate-700 cursor-not-allowed': !value && !isPulsing,
    },
    className
  )

  const classes = classnames(
    'absolute w-[100%] h-[100%] flex items-center justify-center mx-0.5 font-bold'
  )

  const differenceMarkerClasses = classnames('absolute w-[100%] h-[100%]', {
    'bg-green-600': status === 'correct-diff',
    'bg-yellow-600': status === 'present-diff',
  })

  return (
    <div className={containerClasses} ref={letterRef}>
      {['present-diff', 'correct-diff'].includes(status ?? '') && (
        <div
          className={differenceMarkerClasses}
          style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0)' }}
        />
      )}
      <div className={classes}>{value}</div>
    </div>
  )
}
