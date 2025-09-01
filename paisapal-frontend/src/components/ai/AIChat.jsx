import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, X } from 'lucide-react'
import { useChatWithAIMutation } from '../../services/aiApi'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

export default function AIChat({ isOpen, onClose, userTransactions, userBudgets }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI financial assistant. I can help you analyze your spending, suggest budgets, and answer questions about your finances. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  
  const [chatWithAI, { isLoading }] = useChatWithAIMutation()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await chatWithAI({
        message: inputMessage,
        context: {
          transactions: userTransactions.slice(-10), // Last 10 transactions for context
          budgets: userBudgets,
          user_goals: [] // Add user goals if available
        }
      }).unwrap()

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response.message,
        suggestions: response.suggestions || [],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    "How much did I spend on food this month?",
    "What's my biggest spending category?",
    "Can you suggest a budget for entertainment?",
    "Am I on track with my savings goals?",
    "Show me unusual transactions this week"
  ]

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary-500 text-white rounded-full">
            <Bot className="w-4 h-4" />
          </div>
          <span>AI Financial Assistant</span>
          <Sparkles className="w-4 h-4 text-primary-500" />
        </div>
      }
      size="lg"
    >
      <div className="flex flex-col h-96">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}>
                <p className="text-sm">{message.content}</p>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium opacity-75">Suggestions:</p>
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="secondary"
                        onClick={() => setInputMessage(suggestion)}
                        className="text-xs mr-1 mb-1"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="secondary"
                  onClick={() => setInputMessage(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your finances..."
              className="flex-1 resize-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              loading={isLoading}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
