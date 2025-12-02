import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/investments`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const investmentApi = createApi({
  reducerPath: 'investmentApi',
  baseQuery,
  tagTypes: ['Investment'],
  endpoints: (builder) => ({
    getInvestments: builder.query({
      query: ({ page = 1, limit = 10, type } = {}) => {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        if (type) params.append('type', type)
        return `/?${params.toString()}`
      },
      providesTags: ['Investment'],
    }),
    
    getInvestment: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Investment', id }],
    }),
    
    createInvestment: builder.mutation({
      query: (investmentData) => ({
        url: '/',
        method: 'POST',
        body: investmentData,
      }),
      invalidatesTags: ['Investment'],
    }),
    
    updateInvestment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Investment'],
    }),
    
    deleteInvestment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Investment'],
    }),
  }),
})

export const {
  useGetInvestmentsQuery,
  useGetInvestmentQuery,
  useCreateInvestmentMutation,
  useUpdateInvestmentMutation,
  useDeleteInvestmentMutation,
} = investmentApi
