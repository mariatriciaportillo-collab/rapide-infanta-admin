import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Replace ResolvePartModal with nothing (since PackageResolveModal is now correct, but I might have accidentally inserted both, or failed to replace the original).
pattern = r"      \{\/\* RESOLVE PART MODAL \*\/\}[\s\S]*?\n    <\/form>"
replacement = """      {/* RESOLVE PACKAGE MODAL */}
      {pendingPackage && (
        <PackageResolveModal
          pkg={pendingPackage}
          onClose={() => setPendingPackage(null)}
          onApply={(resolvedParts) => addPackageToItems(pendingPackage, resolvedParts)}
        />
      )}
    </form>"""

content = re.sub(pattern, replacement, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
