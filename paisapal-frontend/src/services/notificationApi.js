import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/notifications',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery,
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    
    // ✅ CORRECT: Get all notifications
    getNotifications: builder.query({
      query: () => '/',
      providesTags: ['Notification'],
      // Optional: Poll for new notifications every 30 seconds
      pollingInterval: 30000,
    }),

    // ✅ CORRECT: Mark single notification as read
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
      
      // Optimistic update for instant UI feedback
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notification = draft.data?.find((n) => n._id === id)
            if (notification) {
              notification.isRead = true
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

    // ✅ CORRECT: Create notification (admin only)
    createNotification: builder.mutation({
      query: (notificationData) => ({
        url: '/',
        method: 'POST',
        body: notificationData,
      }),
      invalidatesTags: ['Notification'],
    }),

  }),
})

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useCreateNotificationMutation,
  
  
} = notificationApi
