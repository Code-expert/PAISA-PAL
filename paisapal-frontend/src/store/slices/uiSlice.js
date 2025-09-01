import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  darkMode: false,
  sidebarOpen: false,
  notifications: [],
  loading: false,
  error: null,
  modals: {
    transactionForm: false,
    budgetForm: false,
    investmentForm: false,
  },
  filters: {
    transactions: {},
    budgets: {},
    investments: {},
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    
    setDarkMode: (state, action) => {
      state.darkMode = action.payload
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    
    // Notifications (local UI notifications, not backend notifications)
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      })
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    // Modals
    openModal: (state, action) => {
      const { modalName } = action.payload
      if (state.modals[modalName] !== undefined) {
        state.modals[modalName] = true
      }
    },
    
    closeModal: (state, action) => {
      const { modalName } = action.payload
      if (state.modals[modalName] !== undefined) {
        state.modals[modalName] = false
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false
      })
    },
    
    // Filters
    setFilter: (state, action) => {
      const { filterType, filters } = action.payload
      if (state.filters[filterType] !== undefined) {
        state.filters[filterType] = { ...state.filters[filterType], ...filters }
      }
    },
    
    clearFilter: (state, action) => {
      const { filterType } = action.payload
      if (state.filters[filterType] !== undefined) {
        state.filters[filterType] = {}
      }
    },
    
    // Global loading and error states
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setFilter,
  clearFilter,
  setLoading,
  setError,
  clearError,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectDarkMode = (state) => state.ui.darkMode
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectNotifications = (state) => state.ui.notifications
export const selectModals = (state) => state.ui.modals
export const selectFilters = (state) => state.ui.filters
export const selectUiLoading = (state) => state.ui.loading
export const selectUiError = (state) => state.ui.error
