const fs=require('fs');

const homeFiles=['index.html','en/index.html','tr/index.html','ar/index.html'];
const academyFiles=['en/academy/index.html','tr/akademi/index.html','ar/academy/index.html'];

for(const file of homeFiles){
  let s=fs.readFileSync(file,'utf8');
  const needle="const plCorners   = document.querySelectorAll('.pl-corner');";
  if(!s.includes(needle)) throw new Error(`${file}: preloader anchor missing`);
  if(!s.includes('const skipIntroMotion = window.matchMedia')){
    s=s.replace(needle, needle+"\nconst skipIntroMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\nif(skipIntroMotion){ pl.classList.add('done'); document.body.classList.remove('loading'); }");
  }
  fs.writeFileSync(file,s);
  console.log(`${file}: reduced-motion preloader bypass added`);
}

const oldReveal=`.rv{opacity:0;transform:translateY(32px) scale(.98);filter:blur(4px);\n  transition:opacity .75s cubic-bezier(.22,1,.36,1),transform .75s cubic-bezier(.22,1,.36,1),filter .75s cubic-bezier(.22,1,.36,1)}\n.rv.on{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}`;
const newReveal=`.rv{opacity:0;transform:translateY(32px) scale(.98);\n  transition:opacity .75s cubic-bezier(.22,1,.36,1),transform .75s cubic-bezier(.22,1,.36,1)}\n.rv.on{opacity:1;transform:translateY(0) scale(1)}`;
const canvasNeedle="var canvas=document.getElementById('neural-canvas');\n  if(!canvas)return;";
const canvasReplace="var canvas=document.getElementById('neural-canvas');\n  if(!canvas)return;\n  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768){canvas.style.display='none';return;}";

for(const file of academyFiles){
  let s=fs.readFileSync(file,'utf8');
  if(!s.includes(oldReveal)) throw new Error(`${file}: reveal block missing`);
  s=s.replace(oldReveal,newReveal);
  if(!s.includes(canvasNeedle)) throw new Error(`${file}: neural canvas anchor missing`);
  s=s.replace(canvasNeedle,canvasReplace);
  fs.writeFileSync(file,s);
  console.log(`${file}: removed blur repaint + disabled decorative canvas on mobile/reduced-motion`);
}
