import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import Card from '../ui/Card'

export default function TransactionChart({ transactions, period = '7d' }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return []
    
    // Group transactions by date
    const dailyTotals = transactions.reduce((acc, transaction) => {
      const date = format(parseISO(transaction.date), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = { date, income: 0, expenses: 0, net: 0 }
      }
      
      if (transaction.type === 'income') {
        acc[date].income += transaction.amount
      } else if (transaction.type === 'expense') {
        acc[date].expenses += transaction.amount
      }
      
      acc[date].net = acc[date].income - acc[date].expenses
      return acc
    }, {})
    
    // Convert to array and sort by date
    return Object.values(dailyTotals)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        date: format(new Date(item.date), 'MMM dd')
      }))
  }, [transactions])

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Spending Trend</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-64">
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
                formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'net' ? 'Net' : name === 'income' ? 'Income' : 'Expenses']}
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
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  )
}
