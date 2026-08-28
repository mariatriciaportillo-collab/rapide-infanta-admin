import React, { InputHTMLAttributes } from 'react'

export function UppercaseInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { onChange, className, ...rest } = props
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    
    e.target.value = e.target.value.toUpperCase();
    
    if (onChange) {
      onChange(e);
    }
    
    // Request animation frame ensures React has completed its render cycle
    // so we can put the cursor back where it belongs without jumping.
    window.requestAnimationFrame(() => {
      if (e.target && typeof e.target.setSelectionRange === 'function') {
        e.target.setSelectionRange(start, end);
      }
    });
  }

  return (
    <input 
      {...rest} 
      onChange={handleChange} 
      // We add uppercase class to immediately force visual uppercase 
      // just in case React batches updates slowly.
      className={`${className || ''} uppercase`.trim()} 
    />
  )
}
