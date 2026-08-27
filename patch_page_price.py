import re

with open('src/app/(dashboard)/packages/page.tsx', 'r') as f:
    content = f.read()

# Replace the packageTotal recalculation with direct pkg.package_price
new_content = re.sub(
    r"let packageTotal = 0;\s*items\.forEach\(\(item: any\) => \{\s*const qty = Number\(item\.quantity\) \|\| 1\s*const price = Number\(item\.price\) \|\| 0\s*packageTotal \+= \(price \* qty\)\s*\}\)\s*const pkgPrice = packageTotal // Since they are identical now",
    "const pkgPrice = Number(pkg.package_price) || 0",
    content,
    flags=re.DOTALL
)

# Update the render reference from packageTotal to pkgPrice
new_content = new_content.replace(
    "₱{packageTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}",
    "₱{pkgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"
)

with open('src/app/(dashboard)/packages/page.tsx', 'w') as f:
    f.write(new_content)
