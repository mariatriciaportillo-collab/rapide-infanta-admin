const fs = require('fs');
let path = 'src/components/SidebarNav.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\} , Cpu \} from 'lucide-react'/, ", Cpu } from 'lucide-react'");
fs.writeFileSync(path, content);
