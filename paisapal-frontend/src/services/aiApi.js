import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/ai',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    // ✅ REMOVED: Gemini API key (backend handles this)
    return headers
  },
})

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery,
  tagTypes: ['AIInsight', 'AIChat', 'AITips', 'AIPredictions'],
  endpoints: (builder) => ({
    
    // ✅ FIXED: Changed from POST to GET, removed extra params
    getAIInsights: builder.query({
      query: () => '/insights',
      providesTags: ['AIInsight'],
    }),

    // ✅ FIXED: Changed from POST to GET
    getPersonalizedTips: builder.query({
      query: () => '/tips',
      providesTags: ['AITips'],
    }),

    // ✅ CORRECT: POST method (as backend expects)
    getPredictions: builder.mutation({
      query: (params) => ({
        url: '/predictions',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['AIPredictions'],
    }),

    // ✅ CORRECT: Chat endpoint
    chatWithAI: builder.mutation({
      query: ({ message, context }) => ({
        url: '/chat',
        method: 'POST',
        body: { message, context },
      }),
      invalidatesTags: ['AIChat'],
    }),

    // ✅ CORRECT: Latest insight
    getLatestInsight: builder.query({
      query: () => '/insights/latest',
      providesTags: ['AIInsight'],
    }),

  }),
})

export const {
  useGetAIInsightsQuery,
  useGetPersonalizedTipsQuery,
  useGetPredictionsMutation,
  useChatWithAIMutation,
  useGetLatestInsightQuery,
} = aiApi
