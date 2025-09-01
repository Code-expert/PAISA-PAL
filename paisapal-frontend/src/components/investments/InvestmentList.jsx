import React, { useState } from 'react'
import { Edit2, Trash2, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function InvestmentList({ investments = [], onEdit, onDelete }) {
  const [sortBy, setSortBy] = useState('purchaseDate')
  const [sortOrder, setSortOrder] = useState('desc')

  const sortedInvestments = [...investments].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  const getGainLoss = (investment) => {
    const currentValue = investment.currentPrice * investment.quantity
    const purchaseValue = investment.purchasePrice * investment.quantity
    const gain = currentValue - purchaseValue
    const percentage = ((gain / purchaseValue) * 100).toFixed(2)
    
    return { gain, percentage }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Investment Holdings</Card.Title>
      </Card.Header>
      <Card.Content>
        {investments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No investments added yet.
            </p>
            <Button onClick={() => onEdit(null)}>
              Add Your First Investment
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    Symbol
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    Name
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    Type
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-900 dark:text-white text-right">
                    Quantity
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-900 dark:text-white text-right">
                    Current Value
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-900 dark:text-white text-right">
                    Gain/Loss
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-900 dark:text-white text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedInvestments.map((investment) => {
                  const { gain, percentage } = getGainLoss(investment)
                  const currentValue = investment.currentPrice * investment.quantity
                  const isPositive = gain >= 0

                  return (
                    <tr key={investment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {investment.symbol}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700 dark:text-gray-300 truncate max-w-32">
                          {investment.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" size="sm">
                          {investment.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-gray-900 dark:text-white">
                          {investment.quantity}
                        </div>
                        <div className="text-xs text-gray-500">
                          @ ${investment.currentPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ${currentValue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Cost: ${(investment.purchasePrice * investment.quantity).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={`flex items-center justify-end space-x-1 ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="font-medium">
                            {isPositive ? '+' : ''}${gain.toFixed(2)}
                          </span>
                        </div>
                        <div className={`text-xs ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? '+' : ''}{percentage}%
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700 dark:text-gray-300">
                          {format(new Date(investment.purchaseDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(investment)}
                            className="p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(investment)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
