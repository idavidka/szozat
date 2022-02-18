import { ReactNode, Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import classnames from 'classnames'
import { KeyValue } from '../../lib/keyboard'
import { CharStatus } from '../../lib/statuses'
import { isEmpty } from 'lodash'
import { Button } from '../Button'

export type KeyProps = {
  children?: ReactNode
  value: KeyValue
  additional?: Record<KeyValue, CharStatus>
  width?: number
  status?: CharStatus
  className?: string
  disabled?: boolean
  noDrag?: boolean
  onClick: (value: KeyValue) => void
  onDrop?: (value: KeyValue, index: number) => void
  onDevClick?: (value: KeyValue) => void
}

export const Key = ({
  children,
  status,
  width = 40,
  value,
  additional,
  className,
  onClick,
  onDrop,
  onDevClick,
  disabled,
  noDrag,
}: KeyProps) => {
  const classes = classnames(
    'key flex relative items-center justify-center rounded mx-0.5 text-xs font-bold cursor-pointer select-none overflow-hidden',
    className ?? {
      'bg-slate-200 dark:bg-slate-500 hover:bg-slate-600 dark:hover:bg-slate-400 active:bg-slate-400 dark:text-slate-900':
        !status,
      'bg-slate-400 text-white': status === 'absent',
      'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white': [
        'correct',
        'correct-diff',
      ].includes(status ?? ''),
      'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white': [
        'present',
        'present-diff',
      ].includes(status ?? ''),
    }
  )

  const differenceMarkerClasses = classnames(
    'absolute z-10 w-[100%] h-[100%]',
    {
      'bg-green-600 hover:bg-green-700': status === 'correct-diff',
      'bg-yellow-600 hover:bg-yellow-700': status === 'present-diff',
    }
  )

  const handleClick = (clickedValue: KeyValue) => {
    onClick(clickedValue)
  }

  const handleDevClick = (clickedValue: KeyValue) => {
    onDevClick?.(clickedValue)
  }

  if (isEmpty(additional)) {
    return (
      <Button
        disabled={!!disabled}
        style={{ width: `${width}px`, height: '50px' }}
        className={classes}
        noDrag={noDrag}
        onShortClick={() => {
          handleClick(value)
        }}
        onDrop={(index: number) => onDrop?.(value, index)}
        onDevClick={() => {
          handleDevClick(value)
        }}
      >
        {['present-diff', 'correct-diff'].includes(status ?? '') && (
          <div
            className={differenceMarkerClasses}
            style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0)' }}
          />
        )}
        <span className="relative z-[15]">{children || value}</span>
      </Button>
    )
  }

  return (
    <Popover as={Fragment}>
      {({ open }) => (
        <>
          {open ? (
            <div className="fixed left-0 z-20 top-0 w-full h-full bg-gray-100 dark:bg-gray-800 opacity-80"></div>
          ) : null}
          <span className="relative">
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                className={`absolute  z-20 transform -translate-x-1/2 left-[16px] bottom-full bg-gray-100 dark:bg-gray-800 p-2 rounded flex`}
              >
                {({ close }) =>
                  Object.entries(additional ?? {}).map(
                    ([addValue, addStatus], index) => (
                      <Key
                        key={index}
                        value={addValue}
                        onClick={(value) => {
                          onClick(value)
                          close()
                        }}
                        noDrag={noDrag}
                        status={addStatus}
                      />
                    )
                  )
                }
              </Popover.Panel>
            </Transition>
          </span>
          <Popover.Button
            as={Button}
            disabled={!!disabled}
            style={{ width: `${width}px`, height: '50px' }}
            className={classes}
            noDrag={noDrag}
            onShortClick={() => {
              handleClick(value)
            }}
            onDrop={(index: number) => onDrop?.(value, index)}
            onDevClick={() => {
              handleDevClick(value)
            }}
          >
            {['present-diff', 'correct-diff'].includes(status ?? '') && (
              <div
                className={differenceMarkerClasses}
                style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0)' }}
              />
            )}
            <span className="relative z-[15]">{children || value}</span>
          </Popover.Button>
        </>
      )}
    </Popover>
  )
}
