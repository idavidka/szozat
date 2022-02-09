import React, { CSSProperties } from 'react'

type Props = {
  component: React.ElementType
  onClick?: (...args: any[]) => void
  className?: string
  isStandalone?: boolean
  style?: CSSProperties
}

export const Icon = ({
  component: IconComponent,
  onClick,
  isStandalone,
  className = 'h-6 w-6',
  style,
}: Props) => {
  return (
    <div
      className={`transition duration-500 ease-in-out rounded-full ${
        isStandalone ? 'mx-auto' : 'ml-1'
      } ${className}`}
      style={style}
    >
      <IconComponent
        className="cursor-pointer text-slate-800 dark:text-gray-300 hover:text-slate-600 hover:dark:text-gray-100"
        onClick={onClick}
      />
    </div>
  )
}
