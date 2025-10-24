import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sun, Moon } from 'lucide-react'
import { selectDarkMode, toggleDarkMode } from '../../store/slices/uiSlice'

export default function ThemeToggle() {
  const darkMode = useSelector(selectDarkMode)
  const dispatch = useDispatch()

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun className="h-5 w-5 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  )
}
