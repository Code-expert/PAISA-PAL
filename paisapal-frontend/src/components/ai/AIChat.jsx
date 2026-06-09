import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, X } from 'lucide-react'
import { useChatWithAIMutation } from '../../services/aiApi'
import Modal from '../ui/Modal'

export default function AIChat({ isOpen, onClose, userTransactions = [], userBudgets = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I am your AI financial assistant. Ask me anything about your spending or budgets.",
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

  const cleanMarkdown = (text) => {
    if (!text) return ''
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`(.*?)`/g, '$1').replace(/#{1,6}\s/g, '')
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

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
          transactions: userTransactions.slice(-10),
          budgets: userBudgets,
          user_goals: []
        }
      }).unwrap()

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: cleanMarkdown(response.message || response.response || "I received your message!"),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your request right now.",
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
    "What is my biggest spending category?",
    "Can you suggest a budget for entertainment?",
    "How are my savings looking this month?"
  ]

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-lg text-on-surface">Paisa-GPT</span>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="flex flex-col h-[500px] bg-background">
        
        {/* Chat Bubbles Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(q)}
                  className="px-3 py-1.5 text-xs font-medium bg-surface-container-high hover:bg-secondary/10 text-on-surface-variant hover:text-secondary rounded-full transition-colors border border-outline-variant/30"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-primary text-on-primary rounded-tr-sm shadow-sm'
                  : 'bg-surface-container-high text-on-surface rounded-tl-sm border border-outline-variant/30 shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-[10px] mt-1 text-right ${message.type === 'user' ? 'text-white/70' : 'text-on-surface-variant'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="bg-surface-container-high px-4 py-3 rounded-2xl rounded-tl-sm border border-outline-variant/30">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Minimalist Input Bar */}
        <div className="p-4 bg-surface-container border-t border-outline-variant/30">
          <div className="flex items-center gap-2 bg-background border border-outline-variant/50 rounded-full px-4 py-2 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-1.5 bg-primary text-on-primary rounded-full hover:brightness-110 disabled:opacity-50 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
      </div>
    </Modal>
  )
}
