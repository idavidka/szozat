import React from 'react'
import { ThemeContext } from './ThemeContext'
import { MoonIcon, SunIcon } from '@heroicons/react/solid'
import { ThemeValue } from '../../lib/theme'

export const ThemeToggle = ({
  className,
  onClick,
}: {
  className?: string
  onClick?: (value: ThemeValue) => void
}) => {
  const { theme, setTheme } = React.useContext(ThemeContext)

  return theme === 'dark' ? (
    <SunIcon
      onClick={() => {
        setTheme('light')
        onClick?.('light')
      }}
      className={className}
    />
  ) : (
    <MoonIcon
      onClick={() => {
        setTheme('dark')
        onClick?.('dark')
      }}
      className={className}
    />
  )
}
