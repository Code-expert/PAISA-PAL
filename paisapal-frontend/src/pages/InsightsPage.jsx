import React, { useState, useMemo, useRef, useEffect } from 'react'
import { 
  Brain, MessageSquare, TrendingUp, Lightbulb, Target, 
  Sparkles, Send, RefreshCw, Mic, MicOff, Download, Bot, User
} from 'lucide-react'
import { 
  useGetAIInsightsQuery, 
  useChatWithAIMutation, 
  useGetPersonalizedTipsQuery 
} from '../services/aiApi'
import { useGetTransactionsQuery } from '../services/transactionApi'
import { useGetBudgetsQuery } from '../services/budgetApi'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import AIInsightCard from '../components/ai/AIInsightCard'
import Badge from '../components/ui/Badge'

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('insights')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! 👋 I'm your AI financial assistant. I can help you analyze your spending, create budgets, and answer questions about your finances. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)

  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useGetAIInsightsQuery()
  const { data: tipsData, isLoading: tipsLoading } = useGetPersonalizedTipsQuery()
  const { data: transactionsData } = useGetTransactionsQuery({ limit: 100 })
  const { data: budgetsData } = useGetBudgetsQuery()
  const [chatWithAI, { isLoading: chatLoading }] = useChatWithAIMutation()

  const insights = insightsData?.insights || []
  const tips = tipsData?.tips || []
  const transactions = transactionsData?.transactions || []
  const budgets = budgetsData?.budgets || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const quickSuggestions = [
    "How much did I spend on food this month?",
    "What's my biggest spending category?",
    "Can you suggest a budget for entertainment?"
  ]

  const getTopCategories = (transactions) => {
    const categories = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      }, {})
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }))
  }

  const getBudgetStatus = (budgets, transactions) => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      return {
        category: budget.category,
        budgeted: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentage: Math.round((spent / budget.amount) * 100)
      }
    })
  }

  // Clean markdown from AI responses
  const cleanMarkdown = (text) => {
    if (!text) return ''
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
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
          recentTransactions: transactions.slice(-15).map(t => ({
            amount: t.amount,
            category: t.category,
            type: t.type,
            date: t.date
          })),
          
          budgets: budgets.map(b => ({
            category: b.category,
            limit: b.amount,
            spent: b.spent || 0
          })),
          
          summary: {
            totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0),
            totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0),
            topSpendingCategories: getTopCategories(transactions),
            budgetStatus: getBudgetStatus(budgets, transactions)
          }
        }
      }).unwrap()

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: cleanMarkdown(response.message || response.response || "I received your message!"),
        suggestions: response.suggestions,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error('AI Chat Error:', error)
      
      if (error.status === 429) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: "I'm getting too many requests right now. Please wait a minute and try again! ⏳",
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, errorMessage])
        toast.error('Rate limit reached. Wait 60 seconds.')
        return
      }
      
      const errorMsg = error?.data?.message || error?.message || 'AI service unavailable'
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Sorry, I encountered an error: ${errorMsg}. Please try again. 😔`,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, errorMessage])
      toast.error(errorMsg)
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
      toast.success('Voice captured! 🎤')
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
    if (insights.length === 0) {
      toast.error('No insights to export')
      return
    }

    const data = insights.map(insight => ({
      title: insight.title || 'Insight',
      description: insight.description,
      type: insight.type,
      priority: insight.priority,
      confidence: Math.round((insight.confidence || 0) * 100) + '%',
      date: new Date().toLocaleDateString()
    }))
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\n" +
      data.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n")
    
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `ai_insights_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Insights exported successfully!', { icon: '📥' })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Financial Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Get personalized financial advice powered by artificial intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refetchInsights}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportInsights}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-1">
        <div className="flex gap-2">
          {[
            { id: 'insights', icon: Lightbulb, label: 'Smart Insights' },
            { id: 'chat', icon: MessageSquare, label: 'AI Assistant' },
            { id: 'tips', icon: Target, label: 'Personalized Tips' }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {insightsLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" text="Analyzing your financial data..." />
            </div>
          ) : insights.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Brain className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No insights available yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add more transactions and budgets to get personalized AI insights
              </p>
              <button
                onClick={refetchInsights}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
              >
                Generate Insights
              </button>
            </div>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[650px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-t-2xl">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}>
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className={`text-xs font-semibold ${
                        message.type === 'user' ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Try asking:
                      </p>
                      <div className="flex flex-col gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(suggestion)}
                            className={`text-left text-xs px-3 py-2 rounded-lg transition-colors break-words ${
                              message.type === 'user'
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {chatMessages.length === 1 && (
            <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Quick questions:
              </p>
              <div className="flex flex-col gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-left text-sm px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all border border-emerald-200 dark:border-emerald-800"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your finances..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all"
                  rows={2}
                />
                <button
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className={`absolute right-3 top-3 p-1.5 rounded-lg transition-all ${
                    isListening 
                      ? 'text-red-500 bg-red-100 dark:bg-red-900/30 animate-pulse' 
                      : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || chatLoading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="space-y-4">
          {tipsLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" text="Generating personalized tips..." />
            </div>
          ) : tips.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Target className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No personalized tips available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your AI assistant will generate personalized financial tips based on your spending patterns
              </p>
            </div>
          ) : (
            tips.map((tip, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {tip.title || 'Financial Tip'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                      {tip.description}
                    </p>
                    {tip.impact && (
                      <Badge variant="success" size="sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {tip.impact}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
  