import Link from 'next/link'
import React from 'react'

export function PrimaryActionButton({ href, icon: Icon, children, onClick }: { href?: string, icon?: any, children: React.ReactNode, onClick?: () => void }) {
  const className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition"
  
  if (href) {
    return (
      <Link href={href} className={className}>
        {Icon && <Icon size={18} />}
        {children}
      </Link>
    )
  }
  
  return (
    <button onClick={onClick} className={className}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}
