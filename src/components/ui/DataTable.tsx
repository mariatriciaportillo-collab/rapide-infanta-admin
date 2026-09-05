import React from 'react'

export function DataTable({ children, header }: { children: React.ReactNode, header?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col">
      {header}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          {children}
        </table>
      </div>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
      <tr>{children}</tr>
    </thead>
  )
}

export function TableHead({ children, align = 'left', width }: { children: React.ReactNode, align?: 'left'|'center'|'right', width?: string }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  const widthClass = width ? `w-${width}` : ''
  return (
    <th className={`px-4 py-3 font-semibold ${alignClass} ${widthClass}`}>
      {children}
    </th>
  )
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-slate-100">
      {children}
    </tbody>
  )
}

export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={`hover:bg-slate-50 transition-colors ${className}`}>
      {children}
    </tr>
  )
}

export function TableCell({ children, align = 'left', className = '' }: { children: React.ReactNode, align?: 'left'|'center'|'right', className?: string }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <td className={`px-4 py-3 text-slate-600 ${alignClass} ${className}`}>
      {children}
    </td>
  )
}

export function EmptyState({ colSpan, message = "No records found" }: { colSpan: number, message?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-slate-400 text-sm bg-slate-50/50">
        {message}
      </td>
    </tr>
  )
}
