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
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: '/',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          filter: params.filter // 'all', 'unread', 'read'
        }
      }),
      providesTags: ['Notification'],
      // Poll for new notifications every 30 seconds
      pollingInterval: 30000,
    }),
    
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notification = draft.notifications?.find(n => n._id === id)
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
    
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            if (draft.notifications) {
              draft.notifications = draft.notifications.filter(n => n._id !== id)
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
    
    createNotification: builder.mutation({
      query: (notificationData) => ({
        url: '/',
        method: 'POST',
        body: notificationData,
      }),
      invalidatesTags: ['Notification'],
    }),

    getUnreadCount: builder.query({
      query: () => '/unread-count',
      providesTags: ['Notification'],
      // Poll more frequently for unread count
      pollingInterval: 15000,
    }),

    updateNotificationSettings: builder.mutation({
      query: (settings) => ({
        url: '/settings',
        method: 'PUT',
        body: settings,
      }),
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useCreateNotificationMutation,
  useGetUnreadCountQuery,
  useUpdateNotificationSettingsMutation,
} = notificationApi
