const fs = require('fs');

function patchPartsEdit(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add state for replacingItemId
  if (!content.includes('const [replacingItemId, setReplacingItemId]')) {
    const stateAnchor = `const [items, setItems] = useState<LineItem[]>([])`;
    content = content.replace(stateAnchor, `${stateAnchor}\n  const [replacingItemId, setReplacingItemId] = useState<string | null>(null)`);
  }

  const target = `                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Part description..."
                    className={\`w-full border border-slate-300 rounded-md p-2 \${item.item_type === 'PACKAGE_ITEM' ? 'bg-emerald-50/50 font-medium text-emerald-900 pl-8' : ''}\`}
                    disabled={item.item_type === 'PACKAGE_ITEM'}
                  />
                  {item.item_type === 'PACKAGE_ITEM' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                       <span className="w-4 h-4 bg-emerald-200 text-emerald-700 flex items-center justify-center rounded-full text-[10px] font-bold" title="Package Component">P</span>
                    </div>
                  )}`;

  const replacement = `                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Part description..."
                    className={\`w-full border border-slate-300 rounded-md p-2 \${item.item_type === 'PACKAGE_ITEM' ? 'bg-emerald-50/50 font-medium text-emerald-900 pl-8 pr-10' : ''}\`}
                    disabled={item.item_type === 'PACKAGE_ITEM'}
                  />
                  {item.item_type === 'PACKAGE_ITEM' && (
                    <>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                         <span className="w-4 h-4 bg-emerald-200 text-emerald-700 flex items-center justify-center rounded-full text-[10px] font-bold" title="Package Component">P</span>
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                         <button type="button" onClick={() => setReplacingItemId(replacingItemId === item.id ? null : item.id)} className="text-blue-500 hover:text-blue-700 bg-white shadow-sm border border-slate-200 rounded p-1" title="Replace Part">
                           <Edit size={14} />
                         </button>
                      </div>
                    </>
                  )}
                  {replacingItemId === item.id && (
                    <div className="absolute top-full left-0 mt-1 z-50 w-full min-w-[300px] bg-white border border-slate-200 shadow-xl rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold uppercase text-slate-500">Replace {item.part_category_id ? 'in Category' : 'Part'}</span>
                        <button type="button" onClick={() => setReplacingItemId(null)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                      </div>
                      <PartSearchSelector 
                        categoryIdFilter={item.part_category_id || undefined}
                        selectedPartId={""}
                        setSelectedPartId={() => {}}
                        onSelectPart={(part) => {
                          if (part) {
                            updateItem(item.id, 'description', part.name);
                            updateItem(item.id, 'part_id', part.id);
                            updateItem(item.id, 'resolved_part_id', part.id);
                            setReplacingItemId(null);
                          }
                        }}
                      />
                    </div>
                  )}`;

  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content);
}

patchPartsEdit('src/components/quotations/QuotationForm.tsx');
patchPartsEdit('src/components/estimates/EstimateForm.tsx');
