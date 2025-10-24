import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'
import App from './App'
import LoadingSpinner from './components/common/LoadingSpinner'
import './index.css'
import { Toaster } from 'react-hot-toast'

// Theme initializer component
export function ThemeInitializer() {
  useEffect(() => {
    // Get initial dark mode from Redux store
    const state = store.getState()
    const darkMode = state.ui?.darkMode || false
    
    // Apply to HTML element
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate 
        loading={<LoadingSpinner />} 
        persistor={persistor}
      >
        <ThemeInitializer />
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            className: '',
            style: {
              background: 'rgb(255, 255, 255)',
              color: 'rgb(17, 24, 39)',
            },
            // Light mode
            success: {
              style: {
                background: 'rgb(240, 253, 244)',
                color: 'rgb(5, 150, 105)',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                background: 'rgb(254, 242, 242)',
                color: 'rgb(220, 38, 38)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
