const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/*.{tsx,jsx}');

files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  let original = c;

  // Pattern: 
  //   </div>
  //   <UrlPagination ... />
  // </div>
  // We want to move <UrlPagination ... /> before the first </div>
  
  c = c.replace(/<\/div>\n(\s*<UrlPagination[\s\S]*?\/>)\n\s*<\/div>/g, '$1\n      </div>\n    </div>');
  
  // Actually, let's be more precise.
  // The table container usually ends with:
  //         </table>
  //       </div>
  //       {totalCount > 0 && (
  //         <Pagination ... />
  //       )}
  //     </div>
  // In `quotations/page.tsx`, it's:
  //       </table>
  //     </div>
  //     <UrlPagination totalCount={count || 0} pageSize={pageSize} currentPage={currentPage} />
  //   </div>
  
  c = c.replace(/<\/table>\n\s*<\/div>\n\s*(<UrlPagination[\s\S]*?\/>)\n\s*<\/div>/g, '</table>\n      $1\n      </div>\n    </div>');

  if (c !== original) {
    fs.writeFileSync(file, c);
    console.log(`Fixed UrlPagination placement in ${file}`);
  }
});

