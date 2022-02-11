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
import { debounce, isEmpty } from 'lodash'
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
  const lastTarget = useRef<HTMLElement | null>()
  const original = useRef({ x: 0, y: 0, w: 0, h: 0, f: 0 })

  const targeting = debounce((center: HammerInput['center']) => {
    const targetCell = document
      .elementsFromPoint(center.x, center.y)
      .find((targetElement) =>
        targetElement.classList.contains('current-row-cell')
      ) as HTMLElement | undefined

    if (targetCell && targetCell !== lastTarget.current) {
      lastTarget.current?.classList.remove(
        'bg-cyan-600',
        'border-cyan-800',
        'dark:bg-cyan-600',
        'dark:border-cyan-800'
      )
      lastTarget.current = targetCell
    }

    return targetCell
  }, 2)

  const handlePan = useCallback(
    (type: 'start' | 'move' | 'end', event: HammerInput) => {
      const sourceElement =
        event.target.tagName === 'BUTTON'
          ? event.target
          : event.target.closest('button')

      const targetCell = targeting(event.center)

      if (type === 'start' && sourceElement) {
        buttonCloneRef.current = sourceElement.cloneNode(true) as HTMLElement
        original.current = {
          ...event.center,
          w: parseInt(buttonCloneRef.current.style.width),
          h: parseInt(buttonCloneRef.current.style.height),
          f: parseInt(buttonCloneRef.current.style.fontSize),
        }
        copyStyle(sourceElement, buttonCloneRef.current)
        buttonCloneRef.current.style.position = 'absolute'
        buttonCloneRef.current.style.transform = 'translate(-50%,-50%)'
        buttonCloneRef.current.style.zIndex = '2000'
        buttonCloneRef.current.style.width = `${original.current.w * 1.5}px`
        buttonCloneRef.current.style.height = `${original.current.h * 1.5}px`
        buttonCloneRef.current.style.fontSize = `${original.current.f * 1.5}px`
        document.body.appendChild(buttonCloneRef.current)
      }

      if (buttonCloneRef.current) {
        buttonCloneRef.current.style.top = `${event.center.y}px`
        buttonCloneRef.current.style.left = `${event.center.x}px`
      }

      if (type === 'move') {
        if (targetCell) {
          targetCell.classList.add(
            'bg-cyan-600',
            'border-cyan-800',
            'dark:bg-cyan-600',
            'dark:border-cyan-800'
          )
        }
      }

      if (type === 'end' && buttonCloneRef.current) {
        targetCell?.classList.remove(
          'bg-cyan-600',
          'border-cyan-800',
          'dark:bg-cyan-600',
          'dark:border-cyan-800'
        )

        if (targetCell && targetCell.parentNode) {
          const index = Array.from(targetCell.parentNode.children).indexOf(
            targetCell
          )

          onDrop?.(index)
          document.body.removeChild(buttonCloneRef.current)
          buttonCloneRef.current = null
        } else {
          buttonCloneRef.current.classList.add('dropped-key')
          buttonCloneRef.current.style.left = `${original.current.x}px`
          buttonCloneRef.current.style.top = `${original.current.y}px`
          buttonCloneRef.current.style.fontSize = `${original.current.f}px`
          buttonCloneRef.current.style.width = `${original.current.w}px`
          buttonCloneRef.current.style.height = `${original.current.h}px`
          buttonCloneRef.current.style.opacity = '0'
          setTimeout(() => {
            if (buttonCloneRef.current) {
              document.body.removeChild(buttonCloneRef.current)
              buttonCloneRef.current = null
            }
          }, 500)
        }
      }
    },
    [onDrop, targeting]
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
