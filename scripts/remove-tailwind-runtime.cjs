const fs=require('fs');
const files=['index.html','en/index.html','tr/index.html','ar/index.html','en/academy/index.html','tr/akademi/index.html','ar/academy/index.html','en/contact/index.html','tr/iletisim/index.html','ar/contact/index.html'];
for(const f of files){let s=fs.readFileSync(f,'utf8');const before=s;
s=s.replace(/\n?<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*/g,'\n');
s=s.replace(/\n?<script>\s*tailwind\.config=\{theme:\{extend:\{colors:[\s\S]*?\}\}\}\}\s*<\/script>\s*/g,'\n');
if(s===before) throw new Error('No Tailwind runtime block removed from '+f);fs.writeFileSync(f,s);console.log('cleaned',f);}
