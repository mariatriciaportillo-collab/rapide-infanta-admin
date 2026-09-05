import React from 'react'

export function StatusBadge({ status, variant }: { status: string, variant?: 'success' | 'warning' | 'danger' | 'default' }) {
  let badgeClass = 'bg-slate-100 text-slate-600'
  const normalizedStatus = status?.toUpperCase() || ''

  if (variant === 'success' || ['PAID', 'COMPLETED', 'APPROVED', 'ACTIVE'].includes(normalizedStatus)) {
    badgeClass = 'bg-emerald-100 text-emerald-700'
  } else if (variant === 'warning' || ['PENDING', 'UNPAID', 'PARTIALLY PAID', 'LOW STOCK'].includes(normalizedStatus)) {
    badgeClass = 'bg-amber-100 text-amber-700'
  } else if (variant === 'danger' || ['CANCELLED', 'OUT OF STOCK', 'INACTIVE'].includes(normalizedStatus)) {
    badgeClass = 'bg-red-100 text-red-700'
  }

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${badgeClass}`}>
      {status}
    </span>
  )
}
