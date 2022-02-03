import React from 'react'

type Props = {
  component: React.ElementType
  onClick?: () => void
  isGroupEnd?: boolean
}

export const Icon = ({
  component: IconComponent,
  onClick,
  isGroupEnd,
}: Props) => {
  return (
    <div className="transition duration-500 ease-in-out rounded-full ml-1">
      <IconComponent
        className={`h-6 w-6 cursor-pointer text-slate-800 dark:text-gray-300 hover:text-slate-600 hover:dark:text-gray-100 ${
          isGroupEnd
            ? 'pr-1 w-7 border-r-2 border-slate-800 dark:border-gray-300'
            : ''
        }`}
        onClick={onClick}
      />
    </div>
  )
}
