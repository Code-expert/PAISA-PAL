import React, { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function PerformanceChart({ investments }) {
  const [timeframe, setTimeframe] = useState('30d') // 7d, 30d, 90d, 1y

  const performanceData = useMemo(() => {
    if (!investments || investments.length === 0) return []

    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    
    // Create array of all dates in the period
    const allDates = eachDayOfInterval({ start: startDate, end: endDate })
    
    // Calculate portfolio value for each day
    return allDates.map(date => {
      const portfolioValue = investments.reduce((total, investment) => {
        // For demo purposes, we'll simulate historical prices
        // In real app, you'd fetch historical price data
        const daysDiff = Math.floor((endDate - date) / (1000 * 60 * 60 * 24))
        const priceVariation = 1 + (Math.sin(daysDiff * 0.1) * 0.1) // Simulate price changes
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-blue-600">
            Portfolio Value: ${data.portfolioValue.toLocaleString()}
          </p>
          <p className={`${data.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Gain/Loss: {data.gain >= 0 ? '+' : ''}${data.gain.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <Card.Title>Portfolio Performance</Card.Title>
          <div className="flex space-x-2">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <Button
                key={period}
                size="sm"
                variant={timeframe === period ? 'primary' : 'secondary'}
                onClick={() => setTimeframe(period)}
              >
                {period === '7d' ? '7D' : 
                 period === '30d' ? '1M' : 
                 period === '90d' ? '3M' : '1Y'}
              </Button>
            ))}
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        {performanceData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              No performance data available
            </p>
          </div>
        ) : (
          <>
            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${currentValue.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Gain/Loss</p>
                <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Return %</p>
                <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGain >= 0 ? '+' : ''}{totalGainPercentage}%
                </p>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="portfolioValue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Card.Content>
    </Card>
  )
}
