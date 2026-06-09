import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TrendingDown } from 'lucide-react'
import EmptyState from '../common/EmptyState'

export default function CategoryBreakdown({ transactions }) {
  const categoryData = useMemo(() => {
    const categories = transactions
      ?.filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Other'
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount)
        return acc
      }, {})

    return Object.entries(categories || {})
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [transactions])

  const total = categoryData.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercentages = categoryData.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }))

  const COLORS = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#14b8a6', // Teal
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container/40 backdrop-blur-md border border-outline-variant/30 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-on-surface mb-1">
            {payload[0].name}
          </p>
          <p className="text-sm text-secondary font-bold">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-on-surface-variant">
            {((payload[0].value / total) * 100).toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  if (!transactions || transactions.length === 0 || dataWithPercentages.length === 0) {
    return (
      <div className="bg-surface-container/40 backdrop-blur-md rounded-3xl border border-outline-variant/30 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-on-surface flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-secondary" />
            Category Breakdown
          </h3>
        </div>
        <EmptyState 
          icon={TrendingDown}
          title="No expense data"
          message="Start adding expenses to see your spending breakdown by category"
        />
      </div>
    )
  }

  return (
    <div className="bg-surface-container/40 backdrop-blur-md rounded-3xl border border-outline-variant/30 p-6 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-on-surface flex items-center">
          <TrendingDown className="w-5 h-5 mr-2 text-secondary" />
          Category Breakdown
        </h3>
        <span className="text-sm font-semibold text-on-surface-variant">
          Top {dataWithPercentages.length} Categories
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="h-72 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {dataWithPercentages.map((category, index) => (
            <div 
              key={category.name} 
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-all duration-200 animate-in slide-in-from-right"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className="w-4 h-4 rounded-full shadow-md group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-semibold text-on-surface">
                  {category.name}
                </span>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface">
                  {formatCurrency(category.value)}
                </p>
                <div className="flex items-center justify-end space-x-2">
                  <div className="w-12 bg-outline-variant rounded-full h-1.5 mt-1">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Total */}
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-on-surface">
                Total Expenses
              </span>
              <span className="text-lg font-bold text-secondary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
