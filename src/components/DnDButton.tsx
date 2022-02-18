import { debounce } from 'lodash'
import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react'
import { copyStyle } from '../lib/utils'
import Hammer from 'hammerjs'

type DnDButtonProps = {
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

export const DnDButton = ({
  disabled,
  style,
  className,
  onShortClick,
  onClick,
  children,
  onDevClick,
  onDrop,
  noDrag,
}: DnDButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const manager = useRef<HammerManager>()
  const buttonCloneRef = useRef<HTMLElement | null>()
  const lastTarget = useRef<HTMLElement | null>()
  const original = useRef({ x: 0, y: 0, w: 0, h: 0, f: 0 })

  const targeting = debounce((element?: HTMLElement | null) => {
    if (!element) {
      return undefined
    }

    const positions = {
      center: {
        x: element.offsetLeft,
        y: element.offsetTop,
      },
      top: {
        x: element.offsetLeft,
        y: element.offsetTop - element.offsetHeight * 0.1,
      },
      bottom: {
        x: element.offsetLeft,
        y: element.offsetTop + element.offsetHeight * 0.7,
      },
      left: {
        x: element.offsetLeft - element.offsetWidth / 2,
        y: element.offsetTop,
      },
      right: {
        x: element.offsetLeft + element.offsetWidth / 2,
        y: element.offsetTop,
      },
      topLeft: {
        x: element.offsetLeft - element.offsetWidth / 2,
        y: element.offsetTop - element.offsetHeight * 0.7,
      },
      topRight: {
        x: element.offsetLeft + element.offsetWidth / 2,
        y: element.offsetTop - element.offsetHeight * 0.7,
      },
      bottomLeft: {
        x: element.offsetLeft - element.offsetWidth / 2,
        y: element.offsetTop + element.offsetHeight * 0.1,
      },
      bottomRight: {
        x: element.offsetLeft + element.offsetWidth / 2,
        y: element.offsetTop + element.offsetHeight * 0.1,
      },
    }
    const targetCell = Object.entries(positions).reduce<
      HTMLElement | undefined
    >((acc, [_, { x, y }]) => {
      if (acc) {
        return acc
      }
      return document
        .elementsFromPoint(x, y)
        .find((targetElement) =>
          targetElement.classList.contains('current-row-cell')
        ) as HTMLElement | undefined
    }, undefined)

    if (!targetCell || (targetCell && targetCell !== lastTarget.current)) {
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

      const targetCell = targeting(buttonCloneRef.current)

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
        buttonCloneRef.current.style.transform = 'translate(-50%,-80%)'
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
