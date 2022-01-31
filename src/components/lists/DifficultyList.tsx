import { Fragment, useMemo } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { SelectorIcon } from '@heroicons/react/solid'

type Props = {
  selected: number
  onChange: (selected: number) => void
}

const defaultDifficulty = {
  id: 5,
  label: '5 betű',
  className: 'text-amber-900 bg-amber-100',
}

const options: { id: number; label: string; className?: string }[] = [
  { id: 3, label: '3 betű', className: 'text-sky-900 bg-sky-100' },
  { id: 4, label: '4 betű', className: 'text-lime-900 bg-lime-100' },
  defaultDifficulty,
  { id: 6, label: '6 betű', className: 'text-red-900 bg-red-100' },
  { id: 7, label: '7 betű', className: 'text-violet-900 bg-violet-100' },
  { id: 8, label: '8 betű', className: 'text-indigo-900 bg-indigo-100' },
  { id: 9, label: '9 betű', className: 'text-purple-900 bg-purple-100' },
]

export const DifficultyList = ({ selected, onChange }: Props) => {
  const selectedOption = useMemo(
    () => options.find((option) => option.id === selected) ?? defaultDifficulty,
    [selected]
  )
  return (
    <div className="mr-2 relative w-[85px] h-[36px]">
      <Listbox value={selected} onChange={onChange}>
        <div className="absolute mt-1">
          <Listbox.Button className="relative py-2 pl-3 pr-8 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
            <span className="block truncate">{selectedOption.label}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base  bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `${
                      active
                        ? option.className ?? 'text-gray-900'
                        : 'text-gray-900'
                    }
                          cursor-default select-none relative py-2 pl-4 pr-4`
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
