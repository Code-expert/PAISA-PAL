import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/transactions',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery,
  tagTypes: ['Transaction', 'Budget'],
  endpoints: (builder) => ({
    
    getTransactions: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        category, 
        type, 
        startDate, 
        endDate,
        search 
      } = {}) => {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        
        if (category) params.append('category', category)
        if (type) params.append('type', type)
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        if (search) params.append('search', search)
        
        return `/?${params.toString()}`
      },
      providesTags: (result) =>
        result?.transactions
          ? [
              ...result.transactions.map(({ _id }) => ({ type: 'Transaction', id: _id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),
    
    createTransaction: builder.mutation({
      query: (transactionData) => ({
        url: '/',
        method: 'POST',
        body: transactionData,
      }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Budget', id: 'LIST' }, 
      ],
      // ✅ REMOVED optimistic update - let tag invalidation handle it
      // Optimistic updates with complex cache keys are error-prone
    }),
    
    updateTransaction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        { type: 'Budget', id: 'LIST' },
      ],
    }),
    
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        { type: 'Budget', id: 'LIST' },
      ],
      // ✅ REMOVED optimistic update - let tag invalidation handle it
    }),
  }),
})


export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi
