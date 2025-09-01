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
  tagTypes: ['Transaction'],
  endpoints: (builder) => ({
    // Get Transactions with filters and pagination
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
    
    // Create Transaction
    createTransaction: builder.mutation({
      query: (transactionData) => ({
        url: '/',
        method: 'POST',
        body: transactionData,
      }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
      // Optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          transactionApi.util.updateQueryData('getTransactions', {}, (draft) => {
            if (draft?.transactions) {
              draft.transactions.unshift({ 
                ...arg, 
                _id: 'temp-' + Date.now(),
                createdAt: new Date().toISOString()
              })
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    
    // Update Transaction
    updateTransaction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transaction', id }],
    }),
    
    // Delete Transaction
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
      // Optimistic delete
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          transactionApi.util.updateQueryData('getTransactions', {}, (draft) => {
            if (draft?.transactions) {
              draft.transactions = draft.transactions.filter(t => t._id !== id)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi
