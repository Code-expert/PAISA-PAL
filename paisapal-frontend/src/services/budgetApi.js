import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/budgets',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const budgetApi = createApi({
  reducerPath: 'budgetApi',
  baseQuery,
  tagTypes: ['Budget'],
  endpoints: (builder) => ({
    getBudgets: builder.query({
      query: () => '/',
      providesTags: [{ type: 'Budget', id: 'LIST' }],
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),
   
    createBudget: builder.mutation({
      query: (budgetData) => ({
        url: '/',
        method: 'POST',
        body: budgetData,
      }),
      invalidatesTags: ['Budget'],
    }), 
    
    updateBudget: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Budget'],
    }),
    
    deleteBudget: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Budget'],
    }),
  }),
})

export const {
  useGetBudgetsQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
} = budgetApi
