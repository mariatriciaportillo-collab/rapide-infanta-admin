import re

def patch():
    with open('src/app/(dashboard)/stock-swaps/new/page.tsx', 'r') as f:
        code = f.read()

    # Fix Qty Out Input
    code = code.replace(
        'className="w-full h-[42px] px-3 border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-md font-bold text-lg text-center bg-white"',
        'className="w-full h-[42px] pl-3 pr-12 border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-md font-bold text-lg text-left bg-white"'
    )

    # Fix Qty In Input
    code = code.replace(
        'className="w-full h-[42px] px-3 border border-slate-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-md font-bold text-lg text-center bg-white"',
        'className="w-full h-[42px] pl-3 pr-12 border border-slate-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-md font-bold text-lg text-left bg-white"'
    )
    
    # Fix suffix spans just in case they need to be slightly cleaner
    code = code.replace(
        '{partOut?.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{partOut.unit}</span>}',
        '{partOut?.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">{partOut.unit}</span>}'
    )
    code = code.replace(
        '{partIn?.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{partIn.unit}</span>}',
        '{partIn?.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">{partIn.unit}</span>}'
    )

    with open('src/app/(dashboard)/stock-swaps/new/page.tsx', 'w') as f:
        f.write(code)

patch()
