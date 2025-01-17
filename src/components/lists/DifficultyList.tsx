import { Fragment, useMemo, useRef } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { SelectorIcon } from '@heroicons/react/solid'
import { Difficulty } from '../../hooks/gameReducer'

type Props = {
  selected: number
  onChange: (selected: Difficulty) => void
}

type DifficultyMap = { id: Difficulty; label: string; className?: string }

const defaultDifficulty: DifficultyMap = {
  id: 5,
  label: '5 betű',
  className: 'text-amber-900 bg-amber-100',
}

const options: DifficultyMap[] = [
  { id: 3, label: '3 betű', className: 'text-sky-900 bg-sky-100' },
  { id: 4, label: '4 betű', className: 'text-lime-900 bg-lime-100' },
  defaultDifficulty,
  { id: 6, label: '6 betű', className: 'text-red-900 bg-red-100' },
  { id: 7, label: '7 betű', className: 'text-violet-900 bg-violet-100' },
  { id: 8, label: '8 betű', className: 'text-indigo-900 bg-indigo-100' },
  { id: 9, label: '9 betű', className: 'text-purple-900 bg-purple-100' },
]

export const DifficultyList = ({ selected, onChange }: Props) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const selectedOption = useMemo(
    () => options.find((option) => option.id === selected) ?? defaultDifficulty,
    [selected]
  )
  return (
    <div className="mx-auto relative w-[85px] h-[36px]">
      <Listbox
        value={selected}
        onChange={(value: Difficulty) => {
          if (document.activeElement?.nodeName === 'LI') {
            ;(document.activeElement as HTMLLIElement).blur()
            buttonRef?.current?.blur()
          }
          onChange(value)
        }}
      >
        <div className="absolute ml-1">
          <Listbox.Button
            ref={buttonRef}
            className="relative py-2 pl-3 pr-8 text-left bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-200 rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75  focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
          >
            <span className="block truncate">{selectedOption.label}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon className="w-5 h-5 " aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-200 rounded-md shadow-lg max-h-60 ring-1 ring-gray-200 dark:ring-slate-800 ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `${
                      active
                        ? option.className ??
                          'text-gray-900 dark:text-slate-200'
                        : 'text-gray-900 dark:text-slate-200'
                    }
                          cursor-default select-none relative py-2 pl-4 pr-4 id-${
                            option.id
                          }`
                  }
                  value={option.id}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`${
                          selected ? 'font-medium' : 'font-normal'
                        } block truncate`}
                      >
                        {option.label}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
