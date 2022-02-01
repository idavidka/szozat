import { CharStatus } from '../../lib/statuses'
import classnames from 'classnames'

type Props = {
  value?: string
  status?: CharStatus
  className?: string
  isPulsing?: boolean
}

export const Cell = ({ value, status, className, isPulsing }: Props) => {
  const containerClasses = classnames(
    'grow relative inline-flex justify-center border-solid border-2 rounded before:content-[""] before:block before:pb-[100%] overflow-hidden',
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
      'cell-animation': !!value,
      'animate-pulse': !value && isPulsing,
      'bg-slate-200 dark:bg-slate-700 cursor-not-allowed': !value && !isPulsing,
    },
    className
  )

  const classes = classnames(
    'absolute w-[100%] h-[100%] flex items-center justify-center mx-0.5 text-lg font-bold'
  )

  const differenceMarkerClasses = classnames('absolute w-[100%] h-[100%]', {
    'bg-green-600': status === 'correct-diff',
    'bg-yellow-600': status === 'present-diff',
  })

  return (
    <div className={containerClasses}>
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
