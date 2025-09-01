import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/finance',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const financialApi = createApi({
  reducerPath: 'financialApi',
  baseQuery,
  tagTypes: ['FinancialSummary'],
  endpoints: (builder) => ({
    getFinancialSummary: builder.query({
      query: () => '/summary',
      providesTags: ['FinancialSummary'],
    }),
    
    upsertFinancialSummary: builder.mutation({
      query: (summaryData) => ({
        url: '/summary',
        method: 'POST',
        body: summaryData,
      }),
      invalidatesTags: ['FinancialSummary'],
    }),
  }),
})

export const {
  useGetFinancialSummaryQuery,
  useUpsertFinancialSummaryMutation,
} = financialApi
