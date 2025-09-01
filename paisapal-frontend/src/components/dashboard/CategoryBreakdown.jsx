import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Card from '../ui/Card'

export default function CategoryBreakdown({ transactions }) {
  const categoryData = useMemo(() => {
    const categories = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Other'
        acc[category] = (acc[category] || 0) + transaction.amount
        return acc
      }, {})

    return Object.entries(categories)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: 0 // Will be calculated below
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Top 6 categories
  }, [transactions])

  const total = categoryData.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercentages = categoryData.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }))

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

  return (
    <Card>
      <Card.Header>
        <Card.Title>Category Breakdown</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithPercentages}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataWithPercentages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            {dataWithPercentages.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${category.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {category.percentage}%
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
