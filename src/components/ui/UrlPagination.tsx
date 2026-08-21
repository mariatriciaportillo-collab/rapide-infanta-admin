'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Pagination } from './Pagination'

type Props = {
  totalCount: number
  pageSize?: number
  currentPage: number
}

export function UrlPagination({ totalCount, pageSize = 25, currentPage }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(pathname + '?' + params.toString())
  }

  return (
    <Pagination
      totalCount={totalCount}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    />
  )
}
