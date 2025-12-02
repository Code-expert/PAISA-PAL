import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery,
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getCategoryAnalytics: builder.query({
      query: () => '/category',
      providesTags: ['Analytics'],
    }),
    
    getMonthlyAnalytics: builder.query({
      query: () => '/monthly',
      providesTags: ['Analytics'],
    }),
    
    getBudgetVsActual: builder.query({
      query: () => '/budget-vs-actual',
      providesTags: ['Analytics'],
    }),
  }),
})

export const {
  useGetCategoryAnalyticsQuery,
  useGetMonthlyAnalyticsQuery,
  useGetBudgetVsActualQuery,
} = analyticsApi
