import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/auth',
  credentials: 'include',
})

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Register
    register: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    
    // Verify Email
    verifyEmail: builder.mutation({
      query: ({ email, code }) => ({
        url: '/verify-email',
        method: 'POST',
        body: { email, code },
      }),
    }),
    
    // Resend Verification Email
    resendVerification: builder.mutation({
      query: ({ email }) => ({
        url: '/resend-verification',
        method: 'POST',
        body: { email },
      }),
    }),
    
    // Verify Token (check if user is still authenticated)
    verifyToken: builder.query({
      query: () => '/verify',
      providesTags: ['User'],
    }),
    
    // Google OAuth initiate
    googleAuth: builder.query({
      query: () => '/google',
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useVerifyTokenQuery,
  useGoogleAuthQuery,
} = authApi
