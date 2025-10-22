import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/bills',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const billReminderApi = createApi({
  reducerPath: 'billReminderApi',
  baseQuery,
  tagTypes: ['BillReminder'],
  endpoints: (builder) => ({
    getBillReminders: builder.query({
      query: ({ status, upcoming } = {}) => {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        if (upcoming) params.append('upcoming', 'true')
        return `/?${params.toString()}`
      },
      providesTags: ['BillReminder'],
    }),
    
    getBillReminder: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'BillReminder', id }],
    }),
    
    createBillReminder: builder.mutation({
      query: (billData) => ({
        url: '/',
        method: 'POST',
        body: billData,
      }),
      invalidatesTags: ['BillReminder'],
    }),
    
    updateBillReminder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BillReminder'],
    }),
    
    markBillPaid: builder.mutation({
      query: (id) => ({
        url: `/${id}/mark-paid`,
        method: 'PATCH',
      }),
      invalidatesTags: ['BillReminder'],
    }),
    
    deleteBillReminder: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BillReminder'],
    }),
  }),
})

export const {
  useGetBillRemindersQuery,
  useGetBillReminderQuery,
  useCreateBillReminderMutation,
  useUpdateBillReminderMutation,
  useMarkBillPaidMutation,
  useDeleteBillReminderMutation,
} = billReminderApi
