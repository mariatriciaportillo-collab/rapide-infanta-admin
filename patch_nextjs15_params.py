import os
import re

def fix_params_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Match server components with synchronous params access:
    # export default function InventoryDetailPage({ params }: { params: { id: string } }) {
    #   return <InventoryDetailClient id={params.id} />
    # }
    
    # We will search for standard page.tsx signatures:
    # export default function ...({ params }: { params: { id: string } }) {
    
    pattern = r"export default (async )?function ([a-zA-Z0-9_]+)\(\{\s*params\s*\}?:\s*\{\s*params:\s*\{\s*id:\s*string\s*\}\s*\}\) \{"
    
    def repl(m):
        is_async = "async "
        func_name = m.group(2)
        return f"export default async function {func_name}({{ params }}: {{ params: Promise<{{ id: string }}> }}) {{\n  const resolvedParams = await params;"
    
    if re.search(pattern, content):
        new_content = re.sub(pattern, repl, content)
        new_content = new_content.replace("params.id", "resolvedParams.id")
        
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Patched: {filepath}")

for root, _, files in os.walk('src/app'):
    for file in files:
        if file == 'page.tsx' and '[id]' in root:
            fix_params_in_file(os.path.join(root, file))

