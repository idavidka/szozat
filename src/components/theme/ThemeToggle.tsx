import React from 'react'
import { ThemeContext } from './ThemeContext'
import { MoonIcon, SunIcon } from '@heroicons/react/solid'

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme } = React.useContext(ThemeContext)

  return theme === 'dark' ? (
    <SunIcon onClick={() => setTheme('light')} className={className} />
  ) : (
    <MoonIcon onClick={() => setTheme('dark')} className={className} />
  )
}
