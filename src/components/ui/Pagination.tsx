'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

type Props = {
  totalCount: number
  pageSize?: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function Pagination({
  totalCount,
  pageSize = 25,
  currentPage,
  onPageChange,
}: Props) {
  if (totalCount === 0) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

  const startRecord = (safeCurrentPage - 1) * pageSize + 1
  const endRecord = Math.min(safeCurrentPage * pageSize, totalCount)

  // Generate page numbers
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages]
  }

  const pages = getPageNumbers()

  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-4 border-t border-slate-200 bg-slate-50 px-6 gap-4 text-sm rounded-b-lg">
      
      {/* LEFT: Info */}
      <div className="text-slate-600 font-medium">
        Showing <span className="font-bold text-slate-900">{startRecord}–{endRecord}</span> of <span className="font-bold text-slate-900">{totalCount}</span> records
      </div>

      {/* RIGHT: Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1}
            className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="First Page"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1 mx-2">
            {pages.map((p, i) => (
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-slate-400">…</span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => onPageChange(p as number)}
                  className={`w-7 h-7 flex items-center justify-center rounded font-bold transition ${
                    safeCurrentPage === p 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Next Page"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Last Page"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
