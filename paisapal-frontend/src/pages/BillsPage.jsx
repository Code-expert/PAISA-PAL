import React, { useState } from 'react'
import { Calendar, Plus, Check, Edit2, Trash2, Bell, AlertCircle } from 'lucide-react'
import { 
  useGetBillRemindersQuery, 
  useMarkBillPaidMutation,
  useDeleteBillReminderMutation 
} from '../services/billReminderApi'
import { toast } from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import BillReminderForm from '../components/bills/BillReminderForm'

export default function BillsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [filter, setFilter] = useState('all')

  const { data: billsData, isLoading } = useGetBillRemindersQuery({ 
    status: filter === 'paid' ? 'paid' : undefined,
    upcoming: filter === 'upcoming' ? true : undefined 
  })
  const [markPaid] = useMarkBillPaidMutation()
  const [deleteBill] = useDeleteBillReminderMutation()

  const bills = billsData?.bills || []

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
      toast.success('Bill marked as paid!', { icon: '✅' })
    } catch (error) {
      toast.error('Failed to mark bill as paid')
    }
  }

  const handleDelete = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill reminder?')) {
      try {
        await deleteBill(billId).unwrap()
        toast.success('Bill reminder deleted', { icon: '🗑️' })
      } catch (error) {
        toast.error('Failed to delete bill reminder')
      }
    }
  }

  const handleEdit = (bill) => {
    setEditingBill(bill)
    setShowForm(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      housing: '🏠',
      utilities: '💡',
      insurance: '🛡️',
      subscriptions: '📱',
      loans: '💳',
      other: '📦'
    }
    return emojis[category] || '📦'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Bill Reminders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Never miss a payment with automated reminders
            </p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setEditingBill(null)
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Bill Reminder
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-1">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All Bills', count: bills.length },
            { value: 'upcoming', label: 'Upcoming', count: bills.filter(b => !b.isPaid && Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) >= 0).length },
            { value: 'overdue', label: 'Overdue', count: bills.filter(b => !b.isPaid && Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) < 0).length },
            { value: 'paid', label: 'Paid', count: bills.filter(b => b.isPaid).length }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                filter === tab.value
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Bills List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No bills found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all' 
              ? 'Add your first bill reminder to get started'
              : `No ${filter} bills at the moment`
            }
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Bill Reminder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill, index) => {
            const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
            const isOverdue = daysUntilDue < 0 && !bill.isPaid
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && !bill.isPaid

            return (
              <div 
                key={bill._id} 
                className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 hover:shadow-xl transition-all duration-300 ${
                  isOverdue ? 'border-red-500 dark:border-red-600' : 
                  isDueSoon ? 'border-yellow-500 dark:border-yellow-600' : 
                  'border-gray-200 dark:border-gray-700'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{getCategoryEmoji(bill.category)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {bill.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {bill.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Due: {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Bell className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Remind {bill.reminderDays} day{bill.reminderDays !== 1 ? 's' : ''} before</span>
                  </div>

                  {bill.frequency !== 'once' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mt-2">
                      Repeats {bill.frequency}
                    </span>
                  )}
                </div>

                {!bill.isPaid && (
                  <div className={`p-3 rounded-xl mb-4 ${
                    isOverdue ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                    isDueSoon ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                    'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  }`}>
                    <p className={`text-sm font-semibold flex items-center gap-2 ${
                      isOverdue ? 'text-red-700 dark:text-red-400' :
                      isDueSoon ? 'text-yellow-700 dark:text-yellow-400' :
                      'text-blue-700 dark:text-blue-400'
                    }`}>
                      {isOverdue && <AlertCircle className="w-4 h-4" />}
                      {isOverdue 
                        ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                        : daysUntilDue === 0
                        ? '⏰ Due today!'
                        : daysUntilDue === 1
                        ? '⚠️ Due tomorrow'
                        : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                )}

                {bill.isPaid && (
                  <div className="p-3 rounded-xl mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      ✅ Paid on {new Date(bill.lastPaidDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {!bill.isPaid && (
                    <button
                      onClick={() => handleMarkPaid(bill._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(bill)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bill._id)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
        size="lg"
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
