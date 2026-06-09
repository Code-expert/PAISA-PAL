import React, { useMemo } from 'react';
import { Target, Calendar, Tag, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import Modal from '../ui/Modal';
import { useGetTransactionsQuery } from '../../services/transactionApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import Badge from '../ui/Badge';

export default function BudgetDetailsModal({ isOpen, onClose, budget }) {
  // We fetch transactions for this category. We limit it to a high number to get history.
  // In a real large app, we would paginate this.
  const { data: transactionsData, isLoading, error } = useGetTransactionsQuery(
    { 
      category: budget?.category, 
      limit: 100,
      startDate: budget?.startDate,
      endDate: budget?.endDate
    },
    { skip: !budget || !isOpen }
  );

  const transactions = transactionsData?.transactions || [];

  // Group transactions by month
  const groupedTransactions = useMemo(() => {
    if (!transactions.length) return {};
    
    return transactions.reduce((acc, transaction) => {
      // Only include expenses for the budget calculations
      if (transaction.type !== 'expense') return acc;
      
      const date = new Date(transaction.date);
      const monthKey = format(date, 'MMMM yyyy'); // e.g. "June 2026"
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          transactions: []
        };
      }
      
      acc[monthKey].total += transaction.amount;
      acc[monthKey].transactions.push(transaction);
      
      return acc;
    }, {});
  }, [transactions]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!budget) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Budget Details" size="xl">
      <div className="space-y-6">
        {/* Budget Overview Header */}
        <div className="bg-gradient-to-br from-surface-container to-surface-container-high rounded-2xl p-6 border border-outline-variant/30">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">
                {budget.name || budget.category}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" size="sm" className="capitalize">
                  {budget.period}
                </Badge>
                <span className="text-sm text-on-surface-variant">
                  Limit: {formatCurrency(budget.amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant/30 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">Total Spent</p>
              <p className="text-xl font-bold text-on-surface">
                {formatCurrency(budget.spent ?? budget.actual ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant mb-1">Remaining</p>
              <p className={`text-xl font-bold ${
                (budget.amount - (budget.spent ?? budget.actual ?? 0)) < 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {formatCurrency(budget.amount - (budget.spent ?? budget.actual ?? 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Month-wise Expenditures */}
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-4">Month-wise Expenditure</h3>
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner text="Loading transactions..." />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
              Failed to load transactions.
            </div>
          ) : Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-12 bg-surface-container rounded-2xl border border-outline-variant/30">
              <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-on-surface font-semibold">No expenses found</p>
              <p className="text-on-surface-variant text-sm mt-1">
                You haven't spent anything in this category yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([month, data]) => {
                const isOverBudget = data.total > budget.amount;
                
                return (
                  <div key={month} className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden">
                    <div className="bg-surface-container-highest px-5 py-4 border-b border-outline-variant/30 flex justify-between items-center">
                      <h4 className="font-bold text-on-surface flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        {month}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-on-surface">
                          {formatCurrency(data.total)}
                        </span>
                        {isOverBudget ? (
                          <Badge variant="error" size="sm">Over Budget</Badge>
                        ) : (
                          <Badge variant="success" size="sm">Under Budget</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="divide-y divide-outline-variant/20">
                      {data.transactions.map((tx) => (
                        <div key={tx._id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface text-sm">
                              {tx.description || tx.category}
                            </span>
                            <span className="text-xs text-on-surface-variant mt-0.5">
                              {format(new Date(tx.date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <span className="font-semibold text-on-surface text-sm">
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
