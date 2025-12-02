import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fcm`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const fcmApi = createApi({
  reducerPath: 'fcmApi',
  baseQuery,
  tagTypes: ['FCM'],
  endpoints: (builder) => ({
    saveFcmToken: builder.mutation({
      query: (tokenData) => ({
        url: '/save',
        method: 'POST',
        body: tokenData,
      }),
    }),
    
    deleteFcmToken: builder.mutation({
      query: (tokenData) => ({
        url: '/delete',
        method: 'POST',
        body: tokenData,
      }),
    }),
  }),
})

export const {
  useSaveFcmTokenMutation,
  useDeleteFcmTokenMutation,
} = fcmApi
