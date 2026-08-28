const fs = require('fs')

let nav = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8')
nav = nav.replace('Users,', 'Users, User,')
fs.writeFileSync('src/components/SidebarNav.tsx', nav)
