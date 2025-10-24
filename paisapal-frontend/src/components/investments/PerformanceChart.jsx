import React, { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { TrendingUp, BarChart3 } from 'lucide-react'

export default function PerformanceChart({ investments }) {
  const [timeframe, setTimeframe] = useState('30d')

  const performanceData = useMemo(() => {
    if (!investments || investments.length === 0) return []

    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    
    const allDates = eachDayOfInterval({ start: startDate, end: endDate })
    
    return allDates.map(date => {
      const portfolioValue = investments.reduce((total, investment) => {
        const daysDiff = Math.floor((endDate - date) / (1000 * 60 * 60 * 24))
        const priceVariation = 1 + (Math.sin(daysDiff * 0.1) * 0.1)
        const simulatedPrice = investment.currentPrice * priceVariation
        
        return total + (simulatedPrice * investment.quantity)
      }, 0)
      
      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        portfolioValue: portfolioValue,
        gain: portfolioValue - investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0)
      }
    })
  }, [investments, timeframe])

  const totalInvestment = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0)
  const currentValue = performanceData[performanceData.length - 1]?.portfolioValue || 0
  const totalGain = currentValue - totalInvestment
  const totalGainPercentage = totalInvestment > 0 ? ((totalGain / totalInvestment) * 100).toFixed(2) : 0

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border-2 border-emerald-500 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
            Value: {formatCurrency(data.portfolioValue)}
          </p>
          <p className={`text-sm font-semibold ${data.gain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {data.gain >= 0 ? '↗' : '↘'} {data.gain >= 0 ? '+' : ''}{formatCurrency(data.gain)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Portfolio Performance
        </h3>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                timeframe === period
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {period === '7d' ? '7D' : 
               period === '30d' ? '1M' : 
               period === '90d' ? '3M' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {performanceData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <TrendingUp className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No performance data available
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Add investments to see performance trends
          </p>
        </div>
      ) : (
        <>
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(currentValue)}
              </p>
            </div>
            
            <div className={`text-center p-4 rounded-xl border ${
              totalGain >= 0
                ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-green-200 dark:border-green-800'
                : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-xs font-semibold mb-1 ${
                totalGain >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                Total Gain/Loss
              </p>
              <p className={`text-2xl font-bold ${
                totalGain >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
              }`}>
                {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
              </p>
            </div>
            
            <div className={`text-center p-4 rounded-xl border ${
              totalGain >= 0
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800'
                : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-xs font-semibold mb-1 ${
                totalGain >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
              }`}>
                Return %
              </p>
              <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                totalGain >= 0 ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'
              }`}>
                {totalGain >= 0 ? '↗' : '↘'} {totalGain >= 0 ? '+' : ''}{totalGainPercentage}%
              </p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="h-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="#94a3b8" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="portfolioValue" 
                  stroke="url(#gradient)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
