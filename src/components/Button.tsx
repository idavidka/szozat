import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import Hammer from 'hammerjs'

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

export const Button = ({
  disabled,
  style,
  className,
  onShortClick,
  onClick,
  children,
  onDevClick,
  onDrop: onDropProp,
  noDrag,
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const manager = useRef<HammerManager>()

  const onDrop = useCallback(
    (target: HTMLElement) => {
      if (target.parentNode) {
        const index = Array.from(target.parentNode.children).indexOf(target)

        onDropProp?.(index)
      }
    },
    [onDropProp]
  )

  useDragAndDrop({
    enabled: !noDrag,
    source: buttonRef.current,
    manager: manager.current,
    target: 'current-row-cell',
    targetedClassNames: [
      'bg-cyan-600',
      'border-cyan-800',
      'dark:bg-cyan-600',
      'dark:border-cyan-800',
      'targeted-button',
    ],
    onDrop,
  })

  useLayoutEffect(() => {
    if (!disabled && !manager.current && buttonRef.current) {
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
    }

    manager.current?.on('short_tap', (e) => {
      onShortClick?.()
      e.target.blur()
    })

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
      manager.current?.off('short_tap long_tap dev_tap')
    }
  }, [onDevClick, onClick, onShortClick, noDrag, disabled])

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
