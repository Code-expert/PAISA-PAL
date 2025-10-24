import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import BudgetForm from '../components/budgets/BudgetForm'
import BudgetList from '../components/budgets/BudgetList'
import Modal from '../components/ui/Modal'

function BudgetsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  
  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Budgets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Set spending limits and track your financial goals
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Budget
        </button>
      </div>

      {/* Budget List */}
      <BudgetList
        onEdit={handleEdit}
        onCreate={() => setShowForm(true)}
      />

      {/* Budget Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
        size="lg"
      >
        <BudgetForm
          initialData={editingBudget}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  )
}

export default BudgetsPage
