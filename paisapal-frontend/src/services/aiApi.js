import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/ai',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    // Gemini API uses different headers
    headers.set('Content-Type', 'application/json')
    headers.set('x-goog-api-key', import.meta.env.VITE_GEMINI_API_KEY )
    return headers
  },
})

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery,
  tagTypes: ['AIInsight', 'AIChat', 'AITips'],
  endpoints: (builder) => ({
    // Get AI insights using Gemini's advanced reasoning
    getAIInsights: builder.query({
      query: (params = {}) => ({
        url: '/insights',
        method: 'POST',
        body: {
          model: 'gemini-2.5-pro',
          prompt: 'Analyze financial data and provide insights',
          context: params.financialData || {},
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        }
      }),
      providesTags: ['AIInsight'],
    }),
    
    // Chat with Gemini 2.5 Pro
    chatWithAI: builder.mutation({
      query: ({ message, context }) => ({
        url: '/chat',
        method: 'POST',
        body: {
          model: 'gemini-2.5-pro',
          messages: [
            {
              role: 'system',
              content: `You are a helpful financial assistant for PaisaPal app. 
                       Analyze user's financial data and provide personalized advice.
                       Context: ${JSON.stringify(context)}`
            },
            {
              role: 'user', 
              content: message
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          }
        }
      }),
    }),

    // Get personalized tips using Gemini's reasoning
    getPersonalizedTips: builder.query({
      query: (financialData) => ({
        url: '/tips',
        method: 'POST',
        body: {
          model: 'gemini-2.5-pro',
          prompt: `Based on this financial data, provide 5 personalized money-saving tips:
                   ${JSON.stringify(financialData)}`,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1024,
          }
        }
      }),
      providesTags: ['AITips'],
    }),

    // Financial predictions using Gemini's math capabilities
    getPredictions: builder.query({
      query: (transactionHistory) => ({
        url: '/predictions',
        method: 'POST',
        body: {
          model: 'gemini-2.5-pro',
          prompt: `Analyze spending patterns and predict next month's expenses:
                   ${JSON.stringify(transactionHistory)}`,
          generationConfig: {
            temperature: 0.4, // Lower for more consistent predictions
            maxOutputTokens: 1024,
          }
        }
      }),
    }),
  }),
})

export const {
  useGetAIInsightsQuery,
  useChatWithAIMutation,
  useGetPersonalizedTipsQuery,
  useGetPredictionsQuery,
} = aiApi
