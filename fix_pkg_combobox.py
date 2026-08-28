import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# We want to replace the exact onChange in the Packages section.
# The previous script failed because I probably matched something that had changed whitespace.
# Let's use regex to find the SearchableCombobox for packages and replace its onChange.

pattern = r"(placeholder=\"Search package to add\.\.\.\"\s*searchPlaceholder=\"Search packages by name or category\.\.\.\")"
# Wait, let's find the onChange block for packages
pattern = r"onChange=\{\(pkgId\) => \{[\s\S]*?setItems\(prev => \[\.\.\.prev, newItem\]\)\s*\}\s*\}\}"

replacement = """onChange={(pkgId) => {
              const pkg = packages.find(p => p.id === pkgId)
              if (pkg) {
                const needsResolution = (pkg.package_items || []).some((pi: any) => pi.is_category)
                if (needsResolution) {
                  setPendingPackage(pkg)
                } else {
                  addPackageToItems(pkg)
                }
              }
            }}"""

content = re.sub(pattern, replacement, content)

# Also fix disabled package price input:
disabled_pattern = r"(className=\"w-full border border-slate-300 rounded-md p-2 text-right bg-white\"\s*\/>)"
disabled_replacement = r"className=\"w-full border border-slate-300 rounded-md p-2 text-right bg-white\"\n                  disabled\n                />"
content = re.sub(disabled_pattern, disabled_replacement, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
