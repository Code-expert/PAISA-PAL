import React, { useState } from 'react'
import { Plus, BarChart3 } from 'lucide-react'
import TransactionForm from '../components/transactions/TransactionForm'
import TransactionList from '../components/transactions/TransactionList'
import TransactionChart from '../components/transactions/TransactionChart'
import { useGetTransactionsQuery } from '../services/transactionApi'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'chart'

  // New: Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all') // all, income, expense

  const { data: transactionsData } = useGetTransactionsQuery()
  const transactions = transactionsData?.transactions || []

  // Filter transactions based on search and category
  const filteredTransactions = transactions.filter(t => {
  const typeFilter = (categoryFilter || '').toLowerCase();
  const searchFilter = (searchTerm || '').toLowerCase();

  const txType = (t.type || '').toLowerCase();
  const txCategory = (t.category || '').toLowerCase();
  const txDescription = (t.description || '').toLowerCase();

  const matchesCategory = !typeFilter || typeFilter === 'all' || txType === typeFilter;
  const matchesSearch = !searchFilter || txDescription.includes(searchFilter) || txCategory.includes(searchFilter);

  return matchesCategory && matchesSearch;
});


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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your income and expenses
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-4 sm:mt-0">
          {/* Search */}
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1 min-w-[200px]"
          />
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* View Mode Buttons */}
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

          {/* Add Transaction */}
          <Button onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Transactions</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredTransactions.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">This Month Income</h3>
            <p className="text-2xl font-bold text-green-600">
              $
              {filteredTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">This Month Expenses</h3>
            <p className="text-2xl font-bold text-red-600">
              $
              {filteredTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <TransactionList transactions={filteredTransactions} onEdit={handleEdit} />
      ) : (
        <TransactionChart transactions={filteredTransactions} />
      )}

      {/* Modal for Transaction Form */}
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
