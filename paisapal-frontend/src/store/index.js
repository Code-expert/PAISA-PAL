import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Slices
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'

// RTK Query APIs
import { authApi } from '../services/authApi'
import { userApi } from '../services/userApi'
import { transactionApi } from '../services/transactionApi'
import { budgetApi } from '../services/budgetApi'
import { investmentApi } from '../services/investmentApi'
import { receiptApi } from '../services/receiptApi'
import { analyticsApi } from '../services/analyticsApi'
import { notificationApi } from '../services/notificationApi'
import { financialApi } from '../services/financialApi'
import { fcmApi } from '../services/fcmApi'
import { stripeApi } from '../services/stripeApi'
import { aiApi } from '../services/aiApi'
import { billReminderApi } from '../services/billReminderApi'

// Persist config for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'isAuthenticated', 'user']
}

// Persist config for UI preferences
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['darkMode', 'language', 'currency'] // Add other UI preferences
}

const store = configureStore({
  reducer: {
    // Persisted reducers
    auth: persistReducer(authPersistConfig, authSlice),
    ui: persistReducer(uiPersistConfig, uiSlice),
    
    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [budgetApi.reducerPath]: budgetApi.reducer,
    [investmentApi.reducerPath]: investmentApi.reducer,
    [receiptApi.reducerPath]: receiptApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [financialApi.reducerPath]: financialApi.reducer,
    [fcmApi.reducerPath]: fcmApi.reducer,
    [stripeApi.reducerPath]: stripeApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
    [billReminderApi.reducerPath]: billReminderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'persist/PERSIST',
          'persist/REHYDRATE'
        ],
      },
    }).concat([
      // RTK Query middlewares
      authApi.middleware,
      userApi.middleware,
      transactionApi.middleware,
      budgetApi.middleware,
      investmentApi.middleware,
      receiptApi.middleware,
      analyticsApi.middleware,
      notificationApi.middleware,
      financialApi.middleware,
      fcmApi.middleware,
      stripeApi.middleware,
      aiApi.middleware,
      billReminderApi.middleware,
    ]),
  devTools: import.meta.env.MODE !== 'production',
})

export const persistor = persistStore(store)
export { store }

// Export types for TypeScript
