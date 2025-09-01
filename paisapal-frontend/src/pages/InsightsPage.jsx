import React, { useState, useMemo, useRef, useEffect } from 'react'
import { 
  Brain, MessageSquare, TrendingUp, Lightbulb, Target, 
  Sparkles, Send, RefreshCw, Mic, MicOff, Download
} from 'lucide-react'
import { 
  useGetAIInsightsQuery, 
  useChatWithAIMutation, 
  useGetPersonalizedTipsQuery 
} from '../services/aiApi'
import { useGetTransactionsQuery } from '../services/transactionApi'
import { useGetBudgetsQuery } from '../services/budgetApi'
import { toast } from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import AIInsightCard from '../components/ai/AIInsightCard'

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('insights') // 'insights', 'chat', 'tips'
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI financial assistant. I can help you analyze your spending, create budgets, and answer questions about your finances. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)

  // API Hooks
  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useGetAIInsightsQuery()
  const { data: tipsData, isLoading: tipsLoading } = useGetPersonalizedTipsQuery()
  const { data: transactionsData } = useGetTransactionsQuery({ limit: 100 })
  const { data: budgetsData } = useGetBudgetsQuery()
  const [chatWithAI, { isLoading: chatLoading }] = useChatWithAIMutation()

  const insights = insightsData?.insights || []
  const tips = tipsData?.tips || []
  const transactions = transactionsData?.transactions || []
  const budgets = budgetsData?.budgets || []

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Quick suggestions for chat
  const quickSuggestions = [
    "How much did I spend on food this month?",
    "What's my biggest spending category?",
    "Can you suggest a budget for entertainment?",
    "Am I on track with my savings goals?",
    "Show me unusual transactions this week"
  ]
// In your InsightsPage.jsx
const getTopCategories = (transactions) => {
  const categories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
    
  return Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }))
}

const getBudgetStatus = (budgets, transactions) => {
  return budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      category: budget.category,
      budgeted: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentage: (spent / budget.amount) * 100
    }
  })
}

 const handleSendMessage = async (message = inputMessage) => {
  if (!message.trim()) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: message,
    timestamp: new Date()
  }

  setChatMessages(prev => [...prev, userMessage])
  setInputMessage('')

  try {
    const response = await chatWithAI({
      message,
      context: {
        // ✅ ADD: Send actual financial data
        transactions: transactions.slice(-30), // Last 30 transactions
        budgets: budgets,                      // All user budgets
        recentInsights: insights.slice(0, 3), // Recent insights
        totalIncome: transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions
          .filter(t => t.type === 'expense') 
          .reduce((sum, t) => sum + t.amount, 0),
        topSpendingCategories: getTopCategories(transactions),
        budgetStatus: getBudgetStatus(budgets, transactions)
      }
    }).unwrap()

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message || response.response,
        suggestions: response.suggestions,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get AI response')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInputMessage(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      toast.error('Speech recognition error')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const exportInsights = () => {
    const data = insights.map(insight => ({
      title: insight.title,
      description: insight.description,
      type: insight.type,
      priority: insight.priority,
      confidence: insight.confidence,
      date: new Date().toLocaleDateString()
    }))
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\n" +
      data.map(row => Object.values(row).join(",")).join("\n")
    
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", "ai_insights.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Financial Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get personalized financial advice powered by artificial intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            variant="secondary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={refetchInsights}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={exportInsights}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'insights'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lightbulb className="w-4 h-4 inline mr-2" />
            Smart Insights
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'chat'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'tips'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Personalized Tips
          </button>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {insightsLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" text="Analyzing your financial data..." />
            </div>
          ) : insights.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No insights available yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add more transactions and budgets to get personalized AI insights about your finances.
                </p>
                <Button onClick={refetchInsights}>Generate Insights</Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <AIInsightCard key={insight.id || index} insight={insight} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <Card className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs opacity-75">Try asking:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className="block text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 mb-1 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs opacity-50 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {chatMessages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick questions to get started:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full px-3 py-1 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your finances..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  rows={2}
                />
                <button
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className={`absolute right-3 top-3 p-1 rounded ${
                    isListening 
                      ? 'text-red-500 animate-pulse' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || chatLoading}
                loading={chatLoading}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'tips' && (
        <div className="space-y-6">
          {tipsLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" text="Generating personalized tips..." />
            </div>
          ) : tips.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No personalized tips available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your AI assistant will generate personalized financial tips based on your spending patterns.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {tip.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {tip.description}
                      </p>
                      {tip.impact && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="success" size="sm">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {tip.impact}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
