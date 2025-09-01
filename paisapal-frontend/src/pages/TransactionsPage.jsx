import React, { useState } from 'react'
import { Plus, BarChart3 } from 'lucide-react'
import TransactionForm from '../components/transactions/TransactionForm'
import TransactionList from '../components/transactions/TransactionList'
import TransactionChart from '../components/transactions/TransactionChart'
import { useGetTransactionsQuery } from '../services/transactionApi'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal' // ✅ Now available!

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list', 'chart'

  // Fetch transactions using your existing API
  const { data: transactionsData } = useGetTransactionsQuery()
  const transactions = transactionsData?.transactions || []

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your income and expenses
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'chart' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('chart')}
            leftIcon={<BarChart3 className="w-4 h-4" />}
          >
            Chart
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Transactions
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {transactions.length}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              This Month Income
            </h3>
            <p className="text-2xl font-bold text-green-600">
              ${transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()
              }
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              This Month Expenses
            </h3>
            <p className="text-2xl font-bold text-red-600">
              ${transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <TransactionList onEdit={handleEdit} />
      ) : (
        <TransactionChart transactions={transactions} />
      )}

      {/* Transaction Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        size="lg"
      >
        <TransactionForm
          initialData={editingTransaction}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  )
}
