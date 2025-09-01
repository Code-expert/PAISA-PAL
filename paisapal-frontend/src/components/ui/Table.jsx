import React from 'react'
import clsx from 'clsx'

const Table = ({ children, className = '' }) => (
  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
    <table className={clsx('min-w-full divide-y divide-gray-300 dark:divide-gray-700', className)}>
      {children}
    </table>
  </div>
)

const TableHeader = ({ children, className = '' }) => (
  <thead className={clsx('bg-gray-50 dark:bg-gray-800', className)}>
    {children}
  </thead>
)

const TableBody = ({ children, className = '' }) => (
  <tbody className={clsx('bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700', className)}>
    {children}
  </tbody>
)

const TableRow = ({ children, className = '', hover = true }) => (
  <tr className={clsx(
    hover && 'hover:bg-gray-50 dark:hover:bg-gray-800',
    className
  )}>
    {children}
  </tr>
)

const TableHead = ({ children, className = '' }) => (
  <th
    scope="col"
    className={clsx(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
      className
    )}
  >
    {children}
  </th>
)

const TableCell = ({ children, className = '' }) => (
  <td className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white', className)}>
    {children}
  </td>
)

Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell

export default Table
