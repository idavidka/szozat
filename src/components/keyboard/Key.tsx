import {
  ReactNode,
  Fragment,
  useRef,
  CSSProperties,
  useLayoutEffect,
  useCallback,
} from 'react'
import { Popover, Transition } from '@headlessui/react'
import classnames from 'classnames'
import { KeyValue } from '../../lib/keyboard'
import { CharStatus } from '../../lib/statuses'
import { isEmpty } from 'lodash'
import Hammer from 'hammerjs'
import { copyStyle } from '../../lib/utils'

type ButtonProps = {
  disabled?: boolean
  style?: CSSProperties
  className?: string
  onShortClick?: () => void
  onClick?: (event: any) => void
  onDevClick?: (event: any) => void
  onDrop?: (index: number) => void
  children?: ReactNode
  noDrag?: boolean
}

const Button = ({
  disabled,
  style,
  className,
  onShortClick,
  onClick,
  children,
  onDevClick,
  onDrop,
  noDrag,
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const manager = useRef<HammerManager>()
  const buttonCloneRef = useRef<HTMLElement | null>()

  const handlePan = useCallback(
    (type: 'start' | 'move' | 'end', event: HammerInput) => {
      const target =
        event.target.tagName === 'BUTTON'
          ? event.target
          : event.target.closest('button')
      if (type === 'start' && target) {
        buttonCloneRef.current = target.cloneNode(true) as HTMLElement
        copyStyle(target, buttonCloneRef.current)
        buttonCloneRef.current.style.position = 'absolute'
        buttonCloneRef.current.style.transform = 'translate(-50%,-50%)'
        buttonCloneRef.current.style.zIndex = '2000'
        document.body.appendChild(buttonCloneRef.current)
      }
      if (type === 'end' && buttonCloneRef.current) {
        document.body.removeChild(buttonCloneRef.current)
        buttonCloneRef.current = null
        const currentElement = document.elementFromPoint(
          event.center.x,
          event.center.y
        )
        const currentCell = currentElement?.classList.contains(
          'current-row-cell'
        )
          ? currentElement
          : currentElement?.closest('.current-row-cell')

        if (currentCell && currentCell.parentNode) {
          const index = Array.from(currentCell.parentNode.children).indexOf(
            currentCell
          )

          onDrop?.(index)
        }
      }
      if (type === 'move' && buttonCloneRef.current) {
        buttonCloneRef.current.style.top = `${event.center.y}px`
        buttonCloneRef.current.style.left = `${event.center.x}px`
      }
    },
    [onDrop]
  )

  useLayoutEffect(() => {
    if (!manager.current && buttonRef.current) {
      manager.current = new Hammer.Manager(
        buttonRef.current as unknown as HTMLButtonElement
      )
      const Tap = new Hammer.Tap({
        event: 'short_tap',
        taps: 1,
        time: onClick ? 250 : 5000,
      })
      manager.current.add(Tap)
      let LongTap
      let DevTap
      if (onClick) {
        LongTap = new Hammer.Press({
          event: 'long_tap',
          taps: 1,
          time: 500,
        })
        LongTap.recognizeWith(Tap)
        manager.current.add(LongTap)
      }
      if (onDevClick) {
        DevTap = new Hammer.Tap({
          event: 'dev_tap',
          taps: 10,
          time: 250,
        })
        DevTap.recognizeWith(Tap)
        manager.current.add(DevTap)
      }
      if (!noDrag) {
        const Pan = new Hammer.Pan({
          event: 'pan',
          taps: 1,
        })
        Tap.recognizeWith(Pan)
        LongTap?.recognizeWith(Pan)
        DevTap?.recognizeWith(Pan)
        manager.current.add(Pan)
      }
    }

    manager.current?.on('short_tap', (e) => {
      onShortClick?.()
      e.target.blur()
    })

    if (!noDrag) {
      manager.current?.on('panstart', (e) => {
        handlePan('start', e)
      })

      manager.current?.on('panmove', (e) => {
        handlePan('move', e)
      })

      manager.current?.on('panend', (e) => {
        handlePan('end', e)
      })
    }

    if (onClick) {
      manager.current?.on('long_tap', (e) => {
        onClick?.({ ...e.srcEvent, currentTarget: e.target })
        e.target.blur()
      })
    }

    if (onDevClick) {
      manager.current?.on('dev_tap', (e) => {
        onDevClick?.({ ...e.srcEvent, currentTarget: e.target })
        e.target.blur()
      })
    }

    return () => {
      manager.current?.off('short_tap long_tap dev_tap panstart panmove panend')
    }
  }, [onDevClick, onClick, onShortClick, noDrag, handlePan])

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      style={style}
      className={className}
    >
      {children}
    </button>
  )
}

type KeyProps = {
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
    'flex relative items-center justify-center rounded mx-0.5 text-xs font-bold cursor-pointer select-none overflow-hidden',
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
