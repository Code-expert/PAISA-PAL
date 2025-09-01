// In your main BudgetsPage
import { useState } from 'react'
import BudgetForm from '../components/budgets/BudgetForm'
import BudgetList from '../components/budgets/BudgetList'

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

  return (
    <div className="space-y-8">
      {showForm ? (
        <BudgetForm
          initialData={editingBudget}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <BudgetList
          onEdit={handleEdit}
          onCreate={() => setShowForm(true)}
        />
      )}
    </div>
  )
}
export default BudgetsPage