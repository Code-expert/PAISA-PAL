import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import Card from '../ui/Card'

export default function MonthlyOverview({ transactions, budgets }) {
  const monthlyData = useMemo(() => {
    const endDate = new Date()
    const startDate = subMonths(endDate, 5) // Last 6 months
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    
    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= monthStart && transactionDate <= monthEnd
      })
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const monthBudget = budgets
        .filter(b => b.period === 'monthly')
        .reduce((sum, b) => sum + b.amount, 0)
      
      return {
        month: format(month, 'MMM yyyy'),
        income,
        expenses,
        budget: monthBudget,
        net: income - expenses
      }
    })
  }, [transactions, budgets])

  return (
    <Card>
      <Card.Header>
        <Card.Title>Monthly Overview</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [`$${value.toFixed(2)}`, 
                  name === 'income' ? 'Income' : 
                  name === 'expenses' ? 'Expenses' : 'Budget']}
              />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expenses" fill="#ef4444" />
              <Bar dataKey="budget" fill="#f59e0b" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  )
}
