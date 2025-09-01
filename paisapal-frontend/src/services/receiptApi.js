import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/receipts',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const receiptApi = createApi({
  reducerPath: 'receiptApi',
  baseQuery,
  tagTypes: ['Receipt'],
  endpoints: (builder) => ({
    uploadReceipt: builder.mutation({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Receipt'],
    }),
    
    getReceipts: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        return `/?${params.toString()}`
      },
      providesTags: ['Receipt'],
    }),
  }),
})

export const {
  useUploadReceiptMutation,
  useGetReceiptsQuery,
} = receiptApi
