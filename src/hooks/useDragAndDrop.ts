import { debounce, get } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { copyStyle } from '../lib/utils'

type Props = {
  source: HTMLElement | null | undefined
  manager: HammerManager | null | undefined
  target: string | HTMLElement
  targetedClassNames?: string[]
  onDrop?: (element: HTMLElement) => void
  enabled?: boolean
}

export const useDragAndDrop = <TargetType extends HTMLElement>({
  source,
  target,
  targetedClassNames,
  manager,
  onDrop,
  enabled = true,
}: Props) => {
  const lastTarget = useRef<HTMLElement | null>()
  const targetCloneRef = useRef<HTMLElement | null>()
  const original = useRef({ x: 0, y: 0, w: 0, h: 0, f: 0 })
  const [recognizer, setRecognizer] = useState<Recognizer>()
  const [initialized, setInitialized] = useState(false)

  const usedManager = useMemo(() => {
    if (!source) {
      return undefined
    }

    return manager ?? new Hammer.Manager(source as TargetType)
  }, [manager, source])

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
    const targetElement =
      typeof target === 'string'
        ? Object.entries(positions).reduce<HTMLElement | undefined>(
            (acc, [_, { x, y }]) => {
              if (acc) {
                return acc
              }
              return document
                .elementsFromPoint(x, y)
                .find((targetElement) =>
                  targetElement.classList.contains(target)
                ) as HTMLElement | undefined
            },
            undefined
          )
        : target

    if (
      !targetElement ||
      (targetElement && targetElement !== lastTarget.current)
    ) {
      targetedClassNames &&
        lastTarget.current?.classList.remove(...targetedClassNames)
      lastTarget.current = targetElement
    }

    return targetElement
  }, 2)

  const handlePan = useCallback(
    (type: 'start' | 'move' | 'end', event: HammerInput) => {
      const sourceElement =
        event.target.tagName === 'BUTTON'
          ? event.target
          : event.target.closest('button')

      const targetElement = targeting(targetCloneRef.current)

      if (type === 'start' && sourceElement) {
        targetCloneRef.current = sourceElement.cloneNode(true) as HTMLElement
        original.current = {
          ...event.center,
          w: parseInt(targetCloneRef.current.style.width),
          h: parseInt(targetCloneRef.current.style.height),
          f: parseInt(targetCloneRef.current.style.fontSize),
        }
        copyStyle(sourceElement, targetCloneRef.current)
        targetCloneRef.current.style.position = 'absolute'
        targetCloneRef.current.style.transform = 'translate(-50%,-80%)'
        targetCloneRef.current.style.zIndex = '2000'
        targetCloneRef.current.style.width = `${original.current.w * 1.5}px`
        targetCloneRef.current.style.height = `${original.current.h * 1.5}px`
        targetCloneRef.current.style.fontSize = `${original.current.f * 1.5}px`
        document.body.appendChild(targetCloneRef.current)
      }

      if (targetCloneRef.current) {
        targetCloneRef.current.style.top = `${event.center.y}px`
        targetCloneRef.current.style.left = `${event.center.x}px`
      }

      if (type === 'move') {
        if (targetElement && targetedClassNames) {
          targetElement.classList.add(...targetedClassNames)
        }
      }

      if (type === 'end' && targetCloneRef.current) {
        targetedClassNames &&
          targetElement?.classList.remove(...targetedClassNames)

        if (targetElement && targetElement.parentNode) {
          onDrop?.(targetElement)
          document.body.removeChild(targetCloneRef.current)
          targetCloneRef.current = null
        } else {
          targetCloneRef.current.classList.add('dropped-key')
          targetCloneRef.current.style.left = `${original.current.x}px`
          targetCloneRef.current.style.top = `${original.current.y}px`
          targetCloneRef.current.style.fontSize = `${original.current.f}px`
          targetCloneRef.current.style.width = `${original.current.w}px`
          targetCloneRef.current.style.height = `${original.current.h}px`
          targetCloneRef.current.style.opacity = '0'
          setTimeout(() => {
            if (targetCloneRef.current) {
              document.body.removeChild(targetCloneRef.current)
              targetCloneRef.current = null
            }
          }, 500)
        }
      }
    },
    [onDrop, targetedClassNames, targeting]
  )

  useEffect(() => {
    if (!enabled) {
      return
    }

    let Pan: Recognizer | undefined = undefined

    if (!initialized && source && manager) {
      Pan = new Hammer.Pan({
        event: 'pan',
        taps: 1,
      })

      manager.add(Pan)

      setRecognizer(Pan)
      setInitialized(true)
    }

    manager?.on('panstart', (e) => {
      handlePan('start', e)
    })

    manager?.on('panmove', (e) => {
      handlePan('move', e)
    })

    manager?.on('panend', (e) => {
      handlePan('end', e)
    })

    const recognizers = get(manager, 'recognizers') as Recognizer[]

    recognizers?.forEach((cRecognizer) => {
      if (Pan && cRecognizer !== Pan) {
        cRecognizer.recognizeWith(Pan)
      }
    })

    return () => {
      manager?.off('panstart panmove panend')
    }
  }, [enabled, handlePan, initialized, manager, source])

  return { initialized, recognizer, manager: usedManager }
}
