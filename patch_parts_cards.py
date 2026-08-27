import re
import glob

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace overflow-hidden with overflow-visible in the specific card wrappers
    content = content.replace(
        'className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden',
        'className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible'
    )

    # Add rounded-t-lg to the header divs inside those cards
    content = content.replace(
        'className="px-6 py-4 border-b border-slate-100 bg-slate-50"',
        'className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg"'
    )

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/app/(dashboard)/parts/new/page.tsx')
patch_file('src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx')
