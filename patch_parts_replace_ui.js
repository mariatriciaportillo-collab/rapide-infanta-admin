const fs = require('fs');

function patchParts(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add replacingItemId state if missing
  if (!content.includes('const [replacingItemId, setReplacingItemId]')) {
    const stateAnchor = `const [items, setItems] = useState<LineItem[]>([])`;
    content = content.replace(stateAnchor, `${stateAnchor}\n  const [replacingItemId, setReplacingItemId] = useState<string | null>(null)`);
  }

  // Find the exact block
  // We'll search for this chunk of code in the PARTS section:
  /*
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Part description..."
                    className={`w-full border border-slate-300 rounded-md p-2 bg-emerald-50/50 font-medium text-emerald-900 ${item.item_type === 'PACKAGE_ITEM' ? 'pl-8' : ''}`}
                    disabled={item.item_type === 'PACKAGE_ITEM'}
                  />
                  {item.item_type === 'PACKAGE_ITEM' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                       <span className="w-4 h-4 bg-emerald-200 text-emerald-700 flex items-center justify-center rounded-full text-[10px] font-bold" title="Package Component">P</span>
                    </div>
                  )}
  */

  const target = /<input\s+type="text"\s+value=\{item\.description\}\s+onChange=\{e => updateItem\(item\.id, 'description', e\.target\.value\)\}\s+placeholder="Part description\.\.\."\s+className=\{\`w-full border border-slate-300 rounded-md p-2 bg-emerald-50\/50 font-medium text-emerald-900 \$\{item\.item_type === 'PACKAGE_ITEM' \? 'pl-8' : ''\}\`\}\s+disabled=\{item\.item_type === 'PACKAGE_ITEM'\}\s+\/>\s+\{item\.item_type === 'PACKAGE_ITEM' && \(\s+<div className="absolute left-2 top-1\/2 -translate-y-1\/2">\s+<span className="w-4 h-4 bg-emerald-200 text-emerald-700 flex items-center justify-center rounded-full text-\[10px\] font-bold" title="Package Component">P<\/span>\s+<\/div>\s+\)\}/m;

  const replacement = `
                  {item.item_type === 'PACKAGE_ITEM' ? (
                    <div 
                      className="w-full border border-slate-300 rounded-md p-2 bg-emerald-50/50 font-medium text-emerald-900 pl-8 pr-10 cursor-pointer hover:bg-emerald-100 flex items-center relative"
                      onClick={() => setReplacingItemId(replacingItemId === item.id ? null : item.id)}
                      title="Click to Replace Part"
                    >
                      <span className="truncate flex-1">{item.description}</span>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <span className="w-4 h-4 bg-emerald-200 text-emerald-700 flex items-center justify-center rounded-full text-[10px] font-bold" title="Package Component">P</span>
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Edit size={14} className="text-emerald-700" />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Part description..."
                      className="w-full border border-slate-300 rounded-md p-2 bg-emerald-50/50 font-medium text-emerald-900"
                    />
                  )}

                  {replacingItemId === item.id && (
                    <div className="absolute top-full left-0 mt-1 z-[100] w-full min-w-[300px] bg-white border border-slate-200 shadow-xl rounded-md p-3">
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
                  )}
`;

  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content);
}

patchParts('src/components/quotations/QuotationForm.tsx');
patchParts('src/components/estimates/EstimateForm.tsx');
