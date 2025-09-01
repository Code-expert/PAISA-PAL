import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Card from '../ui/Card'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export default function PortfolioChart({ investments }) {
  const portfolioData = useMemo(() => {
    if (!investments || investments.length === 0) return []

    // Group investments by type
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

    // Convert to array and calculate percentages
    const totalValue = Object.values(groupedByType)
      .reduce((sum, item) => sum + item.value, 0)

    return Object.values(groupedByType)
      .map(item => ({
        ...item,
        percentage: totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [investments])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            {data.name.charAt(0).toUpperCase() + data.name.slice(1)}
          </p>
          <p className="text-blue-600">
            Value: ${data.value.toLocaleString()}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {data.percentage}% of portfolio
          </p>
          <p className="text-xs text-gray-500">
            {data.count} investment{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  if (portfolioData.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Portfolio Allocation</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              No investment data to display
            </p>
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Portfolio Allocation</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Asset Distribution
            </h4>
            {portfolioData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {item.name.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${item.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
