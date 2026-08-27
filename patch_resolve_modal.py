import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Add import
import_code = """import { SearchableCombobox, ComboboxOption } from '@/components/ui/SearchableCombobox'
import { NewLaborModal } from '@/components/quotations/NewLaborModal'
import { ResolvePartModal } from '@/components/quotations/ResolvePartModal'"""
content = content.replace("import { NewLaborModal } from '@/components/quotations/NewLaborModal'", "import { NewLaborModal } from '@/components/quotations/NewLaborModal'\nimport { ResolvePartModal } from '@/components/quotations/ResolvePartModal'")

# Update onResolve logic inside the JSX rendering
modal_code = """
      {/* RESOLVE PART MODAL */}
      {resolvePartInfo && (
        <ResolvePartModal
          categoryId={resolvePartInfo.categoryId}
          parentItemId={resolvePartInfo.parentItemId}
          childItemId={resolvePartInfo.childItemId}
          onClose={() => setResolvePartInfo(null)}
          onResolve={(part) => {
            setItems(prev => prev.map(item => {
              if (item.id === resolvePartInfo.parentItemId && item.package_items) {
                return {
                  ...item,
                  package_items: item.package_items.map(child => {
                    if (child.id === resolvePartInfo.childItemId) {
                      return {
                        ...child,
                        resolved_part_id: part.id,
                        resolved_part_name: part.name
                      }
                    }
                    return child;
                  })
                }
              }
              return item;
            }))
            setResolvePartInfo(null)
          }}
        />
      )}
    </form>"""

content = content.replace("    </form>", modal_code)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
