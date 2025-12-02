import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/receipts`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    let token = getState().auth?.token
    if (!token) {
      token = localStorage.getItem('token')
    }
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    
    return headers
  },
})

// Enhanced base query with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    localStorage.removeItem('token')
    api.dispatch({ type: 'auth/logout' })
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
  
  return result
}

export const receiptApi = createApi({
  reducerPath: 'receiptApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Receipt'],
  endpoints: (builder) => ({
    
    // ✅ ADD: Get all receipts (for gallery)
    getReceipts: builder.query({
      query: ({ page = 1, limit = 100, category, processed } = {}) => {
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('limit', limit)
        if (category && category !== 'all') params.append('category', category)
        if (processed) params.append('processed', processed)
        
        return `/?${params.toString()}`
      },
      providesTags: ['Receipt'],
    }),
    
    // ✅ Get single receipt status
    getReceiptStatus: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Receipt', id }],
    }),
    
    // ✅ Upload receipt
    uploadReceipt: builder.mutation({
      query: (formData) => ({
        url: '/uploads',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Receipt'], // Refreshes gallery after upload
    }),
    
    // ✅ Process receipt OCR
    processReceipt: builder.mutation({
      query: (id) => ({
        url: `/process/${id}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Receipt', id }, 'Receipt'],
    }),
    
    // ✅ Reprocess receipt OCR
    reprocessReceipt: builder.mutation({
      query: (id) => ({
        url: `/${id}/reprocess`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Receipt', id }, 'Receipt'],
    }),
    
    // ✅ Delete receipt
    deleteReceipt: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Receipt'], // Refreshes gallery after delete
    }),
  }),
})

export const {
  useGetReceiptsQuery,           // ✅ ADD: For gallery
  useGetReceiptStatusQuery,      
  useUploadReceiptMutation,
  useProcessReceiptMutation,    
  useReprocessReceiptMutation,
  useDeleteReceiptMutation,
} = receiptApi
