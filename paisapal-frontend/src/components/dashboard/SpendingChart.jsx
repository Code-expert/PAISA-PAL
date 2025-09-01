import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function SpendingChart({ transactions, period = '30d' }) {
  const chartData = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    
    // Create array of all dates in the period
    const allDates = eachDayOfInterval({ start: startDate, end: endDate })
    
    // Group transactions by date
    const dailyTotals = allDates.reduce((acc, date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      acc[dateStr] = {
        date: format(date, 'MMM dd'),
        income: 0,
        expenses: 0,
        net: 0
      }
      return acc
    }, {})

    // Add transaction data
    transactions.forEach(transaction => {
      const transactionDate = format(new Date(transaction.date), 'yyyy-MM-dd')
      if (dailyTotals[transactionDate]) {
        if (transaction.type === 'income') {
          dailyTotals[transactionDate].income += transaction.amount
        } else if (transaction.type === 'expense') {
          dailyTotals[transactionDate].expenses += transaction.amount
        }
        dailyTotals[transactionDate].net = dailyTotals[transactionDate].income - dailyTotals[transactionDate].expenses
      }
    })

    return Object.values(dailyTotals)
  }, [transactions, period])

  return (
    <Card>
      <Card.Header>
        <Card.Title>Spending Trends</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'expenses' ? 'Expenses' : 'Income']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  )
}
