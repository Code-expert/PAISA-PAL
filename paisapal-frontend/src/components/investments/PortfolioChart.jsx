import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieIcon, TrendingUp } from 'lucide-react'

const COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#ef4444', // Red
  '#ec4899', // Pink
  '#84cc16'  // Lime
]

export default function PortfolioChart({ investments }) {
  const portfolioData = useMemo(() => {
    if (!investments || investments.length === 0) return []

    const groupedByType = investments.reduce((acc, investment) => {
      const currentValue = investment.currentPrice * investment.quantity
      
      if (!acc[investment.type]) {
        acc[investment.type] = {
          name: investment.type,
          value: 0,
          count: 0
        }
      }
      
      acc[investment.type].value += currentValue
      acc[investment.type].count += 1
      
      return acc
    }, {})

    const totalValue = Object.values(groupedByType)
      .reduce((sum, item) => sum + item.value, 0)

    return Object.values(groupedByType)
      .map(item => ({
        ...item,
        percentage: totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [investments])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeEmoji = (type) => {
    const emojis = {
      stock: '📈',
      bond: '📜',
      etf: '📊',
      mutual_fund: '💼',
      crypto: '₿',
      real_estate: '🏠'
    }
    return emojis[type] || '💰'
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border-2 border-emerald-500 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            {getTypeEmoji(data.name)}
            {data.name.charAt(0).toUpperCase() + data.name.slice(1).replace('_', ' ')}
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
            Value: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {data.percentage}% of portfolio
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.count} investment{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  if (portfolioData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-emerald-600" />
          Portfolio Allocation
        </h3>
        <div className="flex flex-col items-center justify-center h-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <PieIcon className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No investment data to display
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Add investments to see portfolio allocation
          </p>
        </div>
      </div>
    )
  }

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-emerald-600" />
          Portfolio Allocation
        </h3>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Asset Distribution
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {portfolioData.length} types
            </span>
          </div>
          
          {portfolioData.map((item, index) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xl">{getTypeEmoji(item.name)}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize block">
                    {item.name.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.count} investment{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(item.value)}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
