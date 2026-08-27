import re

with open('src/components/ui/SearchableCombobox.tsx', 'r') as f:
    content = f.read()

# Fix the hook invocation
old_hook = """  const { x, y, strategy, refs, placement } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [
      flip({ padding: 10 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  })"""

new_hook = """  const { x, y, strategy, refs, placement } = useFloating({
    placement: 'bottom-start',
    middleware: [
      flip({ padding: 10 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  })"""

content = content.replace(old_hook, new_hook)

with open('src/components/ui/SearchableCombobox.tsx', 'w') as f:
    f.write(content)

