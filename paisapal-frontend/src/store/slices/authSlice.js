import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isEmailVerified: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      state.isEmailVerified = user?.isEmailVerified || false
      state.error = null
    },
    
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isEmailVerified = false
      state.error = null
    },
    
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    setEmailVerified: (state) => {
      state.isEmailVerified = true
      if (state.user) {
        state.user.isEmailVerified = true
      }
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { 
  setCredentials, 
  logout, 
  updateProfile, 
  setEmailVerified, 
  setLoading, 
  setError, 
  clearError 
} = authSlice.actions

export default authSlice.reducer

// Selectors
export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsEmailVerified = (state) => state.auth.isEmailVerified
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error
