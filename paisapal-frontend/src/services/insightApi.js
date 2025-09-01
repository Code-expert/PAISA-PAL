import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/insights',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const insightApi = createApi({
  reducerPath: 'insightApi',
  baseQuery,
  tagTypes: ['Insight'],
  endpoints: (builder) => ({
    getInsights: builder.query({
      query: () => '/',
      providesTags: ['Insight'],
    }),
    
    chatWithAI: builder.mutation({
      query: (messages) => ({
        url: '/ai/chat',
        method: 'POST',
        body: { messages },
      }),
      invalidatesTags: ['Insight'],
    }),
    
    getLatestInsight: builder.query({
      query: () => '/ai/insights/latest',
      providesTags: ['Insight'],
    }),
  }),
})

export const {
  useGetInsightsQuery,
  useChatWithAIMutation,
  useGetLatestInsightQuery,
} = insightApi
