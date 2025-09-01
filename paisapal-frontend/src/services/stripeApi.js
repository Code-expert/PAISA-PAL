import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/stripe',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const stripeApi = createApi({
  reducerPath: 'stripeApi',
  baseQuery,
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    createSubscriptionSession: builder.mutation({
      query: (sessionData) => ({
        url: '/create-subscription-session',
        method: 'POST',
        body: sessionData,
      }),
    }),
    
    getPaymentStatus: builder.query({
      query: (sessionId) => `/payment-status/${sessionId}`,
      providesTags: ['Payment'],
    }),
  }),
})

export const {
  useCreateSubscriptionSessionMutation,
  useGetPaymentStatusQuery,
} = stripeApi
