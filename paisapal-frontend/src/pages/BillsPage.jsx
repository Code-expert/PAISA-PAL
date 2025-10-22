import React, { useState } from 'react'
import { Calendar, Plus, Check, X, Edit2, Trash2, Bell } from 'lucide-react'
import { 
  useGetBillRemindersQuery, 
  useCreateBillReminderMutation,
  useMarkBillPaidMutation,
  useDeleteBillReminderMutation 
} from '../services/billReminderApi'
import { toast } from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import BillReminderForm from '../components/bills/BillReminderForm'

export default function BillsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'upcoming', 'paid', 'overdue'

  const { data: billsData, isLoading } = useGetBillRemindersQuery({ 
    status: filter === 'paid' ? 'paid' : filter === 'upcoming' ? undefined : undefined,
    upcoming: filter === 'upcoming' ? true : undefined 
  })
  const [markPaid] = useMarkBillPaidMutation()
  const [deleteBill] = useDeleteBillReminderMutation()

  const bills = billsData?.bills || []

  // Filter bills based on selected filter
  const filteredBills = bills.filter(bill => {
    const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    
    if (filter === 'overdue') return daysUntilDue < 0 && !bill.isPaid
    if (filter === 'upcoming') return daysUntilDue >= 0 && !bill.isPaid
    if (filter === 'paid') return bill.isPaid
    return true
  })

  const handleMarkPaid = async (billId) => {
    try {
      await markPaid(billId).unwrap()
      toast.success('Bill marked as paid!')
    } catch (error) {
      toast.error('Failed to mark bill as paid')
    }
  }

  const handleDelete = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill reminder?')) {
      try {
        await deleteBill(billId).unwrap()
        toast.success('Bill reminder deleted')
      } catch (error) {
        toast.error('Failed to delete bill reminder')
      }
    }
  }

  const handleEdit = (bill) => {
    setEditingBill(bill)
    setShowForm(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bill Reminders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Never miss a payment with automated reminders
          </p>
        </div>
        
        <Button
          onClick={() => {
            setEditingBill(null)
            setShowForm(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="mt-4 sm:mt-0"
        >
          Add Bill Reminder
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { value: 'all', label: 'All Bills', count: bills.length },
          { value: 'upcoming', label: 'Upcoming', count: bills.filter(b => !b.isPaid && Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) >= 0).length },
          { value: 'overdue', label: 'Overdue', count: bills.filter(b => !b.isPaid && Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) < 0).length },
          { value: 'paid', label: 'Paid', count: bills.filter(b => b.isPaid).length }
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(tab.value)}
          >
            {tab.label} ({tab.count})
          </Button>
        ))}
      </div>

      {/* Bills List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredBills.length === 0 ? (
        <Card>
          <Card.Content className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bills found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add your first bill reminder to get started
            </p>
            <Button onClick={() => setShowForm(true)}>
              Add Bill Reminder
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBills.map((bill) => {
            const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
            const isOverdue = daysUntilDue < 0
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

            return (
              <Card key={bill._id} className={`${
                isOverdue ? 'border-red-500 border-2' : 
                isDueSoon ? 'border-yellow-500 border-2' : ''
              }`}>
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {bill.name}
                      </h3>
                      <Badge variant="secondary" size="sm" className="mt-1">
                        {bill.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${bill.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Bell className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Remind {bill.reminderDays} days before
                      </span>
                    </div>

                    {bill.frequency !== 'once' && (
                      <Badge variant="info" size="sm">
                        Repeats {bill.frequency}
                      </Badge>
                    )}
                  </div>

                  {!bill.isPaid && (
                    <div className={`p-3 rounded-lg mb-4 ${
                      isOverdue ? 'bg-red-50 dark:bg-red-900/20' :
                      isDueSoon ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                      'bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      <p className={`text-sm font-medium ${
                        isOverdue ? 'text-red-700 dark:text-red-400' :
                        isDueSoon ? 'text-yellow-700 dark:text-yellow-400' :
                        'text-blue-700 dark:text-blue-400'
                      }`}>
                        {isOverdue 
                          ? `⚠️ Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                          : daysUntilDue === 0
                          ? '⚠️ Due today!'
                          : daysUntilDue === 1
                          ? '⚠️ Due tomorrow'
                          : `Due in ${daysUntilDue} days`
                        }
                      </p>
                    </div>
                  )}

                  {bill.isPaid && (
                    <div className="p-3 rounded-lg mb-4 bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        ✓ Paid on {new Date(bill.lastPaidDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {!bill.isPaid && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleMarkPaid(bill._id)}
                        leftIcon={<Check className="w-4 h-4" />}
                        className="flex-1"
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(bill)}
                      leftIcon={<Edit2 className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(bill._id)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Bill Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingBill(null)
        }}
        title={editingBill ? 'Edit Bill Reminder' : 'Add Bill Reminder'}
      >
        <BillReminderForm
          initialData={editingBill}
          onSuccess={() => {
            setShowForm(false)
            setEditingBill(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingBill(null)
          }}
        />
      </Modal>
    </div>
  )
}
