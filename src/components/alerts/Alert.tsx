import { Fragment, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'

type Props = {
  isOpen: boolean
  message: string
  variant?: 'success' | 'warning'
  className?: string
}

export const Alert = ({
  isOpen,
  message,
  variant = 'warning',
  className = '',
}: Props) => {
  const classes = classNames(
    'fixed top-20 left-1/2 transform -translate-x-1/2 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden z-[1000]',
    {
      'bg-rose-200': variant === 'warning',
      'bg-green-200 z-40': variant === 'success',
    },
    className
  )

  const [state, setState] = useState(isOpen)

  useEffect(() => {
    setState(isOpen)
  }, [isOpen])

  return (
    <Transition
      show={state}
      as={Fragment}
      enter="ease-out duration-300 transition"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={classes}
        onClick={() => setState(false)}
        data-html2canvas-ignore
      >
        <div className="p-4">
          <p className="text-sm text-center font-medium text-gray-900">
            {message}
          </p>
        </div>
      </div>
    </Transition>
  )
}
