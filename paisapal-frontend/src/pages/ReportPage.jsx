import React from 'react';
import { useGetMonthlyReportQuery } from '../services/aiApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Printer, Sparkles, TrendingDown, Target, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportPage() {
  const { data: report, isLoading, isError, refetch } = useGetMonthlyReportQuery();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <p className="mt-4 text-on-surface-variant font-medium animate-pulse">Generating your AI Monthly Report...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-16 h-16 text-error mb-4" />
        <h2 className="text-xl font-bold text-on-surface mb-2">Failed to Generate Report</h2>
        <p className="text-on-surface-variant mb-6 text-center max-w-md">
          We couldn't generate your report right now. This usually happens due to high server demand.
        </p>
        <button onClick={refetch} className="px-6 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:brightness-110 transition-all shadow-md">
          Try Again
        </button>
      </div>
    );
  }

  const currentDate = format(new Date(), 'MMMM yyyy');

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 print:py-0 print:px-0">
      
      {/* Header Actions (Hidden when printing) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Monthly Report</h1>
          <p className="text-on-surface-variant mt-1 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" /> AI-Generated Financial Analysis
          </p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all active:scale-95"
        >
          <Printer className="w-5 h-5" />
          Download PDF
        </button>
      </div>

      {/* Actual Report Document */}
      {/* The `print:shadow-none` and `print:bg-white` ensures it looks like a clean physical paper when printed */}
      <div className="bg-surface rounded-3xl shadow-xl border border-outline-variant p-10 md:p-14 print:p-8 print:shadow-none print:border-none print:bg-white text-on-surface">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-outline-variant pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg print:hidden">
               <img src="/logo.png" alt="PaisaPal" className="h-full w-full object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-on-surface print:text-black">PaisaPal</h2>
              <p className="text-on-surface-variant font-medium tracking-widest uppercase text-sm mt-1 print:text-gray-600">Financial Health Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary print:text-black">{currentDate}</p>
            <p className="text-on-surface-variant text-sm font-medium mt-1 print:text-gray-500">Prepared by AI Assistant</p>
          </div>
        </div>

        {/* Executive Summary & Grade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-2 print:text-black">
              <Target className="w-5 h-5 text-secondary print:text-black" /> 
              Executive Summary
            </h3>
            <p className="text-on-surface-variant leading-relaxed text-lg print:text-gray-800">
              {report.executiveSummary}
            </p>
          </div>
          <div className="bg-surface-container rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-outline-variant print:bg-gray-100 print:border-gray-300">
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 print:text-gray-600">Overall Grade</p>
            <div className="text-6xl font-black text-primary drop-shadow-md print:text-black">
              {report.grade}
            </div>
          </div>
        </div>

        {/* Critical Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-error/10 border border-error/20 rounded-2xl p-6 print:bg-white print:border-gray-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-error/20 rounded-xl text-error print:text-black print:bg-gray-200">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-error print:text-black">Biggest Drain</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed print:text-gray-800 font-medium">
              {report.biggestDrain}
            </p>
          </div>

          <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6 print:bg-white print:border-gray-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/20 rounded-xl text-secondary print:text-black print:bg-gray-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-secondary print:text-black">Savings Opportunity</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed print:text-gray-800 font-medium">
              {report.savingsOpportunity}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="text-xl font-bold text-on-surface mb-6 print:text-black">Category Breakdown</h3>
          <div className="overflow-hidden border border-outline-variant rounded-2xl print:border-gray-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high print:bg-gray-100 text-on-surface-variant text-sm font-bold tracking-wider uppercase">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant print:divide-gray-200">
                {report.topCategories?.map((cat, idx) => (
                  <tr key={idx} className="bg-surface print:bg-white">
                    <td className="px-6 py-4 font-bold text-on-surface print:text-black">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-on-surface-variant print:text-gray-800">
                      ₹{cat.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${
                        cat.status === 'over_budget' 
                          ? 'bg-error/10 text-error print:border print:border-gray-400 print:text-black' 
                          : cat.status === 'under_budget'
                            ? 'bg-green-500/10 text-green-500 print:border print:border-gray-400 print:text-black'
                            : 'bg-primary/10 text-primary print:border print:border-gray-400 print:text-black'
                      }`}>
                        {cat.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!report.topCategories || report.topCategories.length === 0) && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-on-surface-variant print:text-gray-500">
                      Not enough transaction data this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-outline-variant text-center text-on-surface-variant text-sm print:text-gray-500 print:border-gray-300">
          <p>This report was automatically generated by PaisaPal's AI Engine.</p>
          <p className="mt-1">For more details, visit your Dashboard.</p>
        </div>

      </div>
    </div>
  );
}
