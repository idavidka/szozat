import { useContext, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XCircleIcon } from '@heroicons/react/outline'
import { ThemeContext } from '../theme/ThemeContext'

export type ModalId =
  | 'info'
  | 'new-game'
  | 'new-game-confirm'
  | 'stat'
  | 'about'
  | 'create-puzzle'
  | 'dev'
  | false

export type ModalType = ModalId | [ModalId, ModalId]

type Props = {
  title: string
  subTitle?: string
  children: React.ReactNode
  isOpen: boolean
  handleClose: () => void
}

export const BaseModal = ({
  title,
  children,
  isOpen,
  handleClose,
  subTitle = '',
}: Props) => {
  const context = useContext(ThemeContext)
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={`${context.theme} base-modal fixed z-[1010] inset-0 overflow-y-auto`}
        onClose={handleClose}
      >
        <div className="flex items-center justify-center min-h-screen py-10 px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white  dark:bg-slate-500 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full sm:p-6">
              <div className="absolute right-4 top-4">
                <XCircleIcon
                  className="h-6 w-6 cursor-pointer text-gray-900 dark:text-slate-200"
                  onClick={() => handleClose()}
                />
              </div>
              <div>
                <div className="text-center">
                  {subTitle && (
                    <div className="text-xs absolute top-[4px] left-[4px] font-medium text-gray-900 dark:text-slate-200">
                      {subTitle}
                    </div>
                  )}
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900 dark:text-slate-200"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">{children}</div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
