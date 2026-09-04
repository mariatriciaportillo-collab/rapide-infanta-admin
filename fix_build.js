const fs = require('fs');

// 1. Fix Parts New page data variable
let path = 'src/app/(dashboard)/parts/new/page.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/\$\{data\.id\}/g, '${newPart.id}');
fs.writeFileSync(path, content);

// 2. Fix duplicate is_auto_suggested
['src/components/quotations/QuotationForm.tsx', 'src/components/estimates/EstimateForm.tsx'].forEach(path => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/is_auto_suggested\?: boolean\n\s*is_auto_suggested\?: boolean/g, 'is_auto_suggested?: boolean');
  fs.writeFileSync(path, content);
});

// 3. Fix SidebarNav Cpu import
path = 'src/components/SidebarNav.tsx';
content = fs.readFileSync(path, 'utf8');
if (!content.includes('import { Cpu')) {
  // It probably imports specific icons like import { LayoutDashboard, Users, ... } from 'lucide-react'
  // I will just append Cpu to it.
  content = content.replace(/from 'lucide-react'/, ", Cpu } from 'lucide-react'");
  content = content.replace(/import \{ (.*?)\} , Cpu \} from 'lucide-react'/, "import { $1, Cpu } from 'lucide-react'");
}
fs.writeFileSync(path, content);

