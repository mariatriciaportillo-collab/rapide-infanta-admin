import re

with open('src/components/parts/PartSearchSelector.tsx', 'r') as f:
    content = f.read()

# Fix the hook invocation
old_hook = """  const { refs, floatingStyles, placement } = useFloating({
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

# Fix the rendering style
old_style = """          style={{ 
            ...floatingStyles,
            maxHeight: '350px',
            marginTop: isFlipped ? '1px' : '-1px', // Seamless overlap
            zIndex: 99999
          }}"""

new_style = """          style={{ 
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            maxHeight: '350px',
            marginTop: isFlipped ? '1px' : '-1px',
            zIndex: 99999
          }}"""

content = content.replace(old_style, new_style)

with open('src/components/parts/PartSearchSelector.tsx', 'w') as f:
    f.write(content)
