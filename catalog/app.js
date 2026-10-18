const deck=document.getElementById('deck');
const pages=[...document.querySelectorAll('.page')];
const dots=document.getElementById('dots');
let idx=0;

pages.forEach((_,i)=>{
  const b=document.createElement('button');
  b.className=i===0?'active':'';
  b.setAttribute('aria-label',`${i+1}. sayfa`);
  b.onclick=()=>go(i);
  dots.appendChild(b);
});
const dotEls=[...dots.children];
const prev=document.getElementById('prev');
const next=document.getElementById('next');

function updateNav(){
  dotEls.forEach((d,n)=>d.classList.toggle('active',n===idx));
  pages.forEach((p,n)=>p.classList.toggle('is-active',n===idx));
  prev.disabled=idx===0;
  next.disabled=idx===pages.length-1;
}
function go(i){
  idx=Math.max(0,Math.min(pages.length-1,i));
  pages[idx].scrollTop=0;
  pages[idx].scrollIntoView({behavior:'smooth',inline:'start',block:'nearest'});
  updateNav();
}
prev.onclick=()=>go(idx-1);
next.onclick=()=>go(idx+1);
document.getElementById('startBtn').onclick=()=>go(1);
document.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>go(Number(b.dataset.target)));
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>go(Number(b.dataset.back)));

let raf=0;
deck.addEventListener('scroll',()=>{
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    const n=Math.round(deck.scrollLeft/deck.clientWidth);
    if(n!==idx){idx=n;updateNav()}
  });
},{passive:true});
addEventListener('keydown',e=>{
  if(e.key==='ArrowRight')go(idx+1);
  if(e.key==='ArrowLeft')go(idx-1);
});
updateNav();

const original={};
document.querySelectorAll('[data-i]').forEach(el=>original[el.dataset.i]=el.innerHTML);

const strings={
en:{
coverEyebrow:"INDUSTRIAL SOURCING · PROJECT SUPPLY MANAGEMENT",cover1:'From Requirement',cover2:'to Delivery',coverLead:"We research sources, compare options and manage supply for your project",coverTag:"Multi-sector Supplier Network · From Requirement to Delivery",v1:"Supplier Research",v2:"Technical & Commercial Review",v3:"Quote & Price Comparison",v4:"Logistics & Delivery Tracking",discover:'Explore the Catalog',
idEyebrow:'WHO WE ARE',id1:'Technical & Commercial',id2:'Coordination',idText:"VORQA is your single point of contact with a verified supplier network. We bring technical and commercial decisions, orders and logistics into one controlled process.",s1:"Single Point of Contact",sd1:"We manage communication with all parties",s2:"Controlled Process",sd2:"We track scope, approvals and progress",s3:"Verified Network",sd3:"We work with suitable manufacturers and specialist partners",s4:"Quotation & Order Management",sd4:"We coordinate terms, approvals and order flow",s6:"Logistics Management",sd6:"We track shipment plans, documents and delivery",
scopeEyebrow:'SUPPLY SCOPE',scope1:'Priority',scope2:'Supply Categories',scopeLead:'Coordinated multi-category industrial supply',g1:'Steel, Metals & Raw Materials',g2:'Pipes, Tubes, Fittings & Flanges',g3:'Pumps, Valves & Flow Control Equipment',g4:'Motors, Gear Reducers & Power Transmission',g5:'Bearings, Couplings & Mechanical Components',g6:'Electrical Equipment & Power Distribution',g7:'Automation, Instrumentation & Control',g8:'Hydraulic & Pneumatic Systems',g9:'Fasteners, Gaskets & Industrial Hardware',g10:'Silos, Conveyors & Bulk Handling Equipment',g11:'Filtration, Ventilation & Dust Collection',g12:'Fabricated Steel & Custom Manufacturing',
sysEyebrow:'SOLUTION AREAS',sys1:'System',sys2:'Solutions',sysLead:'Engineering, sourcing and coordination are managed together',sysA:'Concrete Plants',sysB:'Complete Galvanizing Plants',sysC:'Asphalt Plants & Equipment',sysD:'Waste-to-Energy Plants',sysE:'Crushing & Screening Plants',tap:'View details',
solutionEyebrow:'SYSTEM SOLUTION',backSystems:'System Solutions',detailSupply:'Supply Scope',
con1:'Concrete',con2:'Plants',conLead:'Coordinated sourcing and technical-commercial execution support for concrete plant projects',conP1:'Project Scope Clarification',conP2:'Main Equipment & Auxiliary Systems',conP3:'Manufacturer / Partner Matching',conP4:'Shipment & Site Coordination',conS1:'Mixer and aggregate bunkers',conS2:'Silo and screw conveyor systems',conS3:'Filter and dosing equipment',conS4:'Automation and electrical solutions',
galv1:'Complete',galv2:'Galvanizing Plants',galvLead:'Coordinated sourcing and technical-commercial execution for galvanizing line projects',galvP1:'Line Configuration',galvP2:'Main Equipment & Auxiliary Units',galvP3:'Manufacturer / Partner Matching',galvP4:'Installation & Logistics Coordination',galvS1:'Kettle, furnace and heating systems',galvS2:'Chemical pretreatment lines',galvS3:'Handling and lifting equipment',galvS4:'Automation and energy integration',
asp1:'Asphalt Plants &',asp2:'Equipment',aspLead:'Coordinated technical and commercial execution with the right suppliers for asphalt plant projects',aspP1:'Application & Capacity Adaptation',aspP2:'Main Equipment & Auxiliary Systems',aspP3:'Manufacturer / Partner Matching',aspP4:'Shipment & Commissioning Coordination',aspS1:'Dryer drum and burner system',aspS2:'Screen, bunker and elevator groups',aspS3:'Bitumen and filler equipment',aspS4:'Filter, automation and control',
waste1:'Waste-to-',waste2:'Energy Plants',wasteLead:'Coordinated sourcing and technical-commercial execution for sustainable waste-to-energy projects',wasteP1:'Technical Scope Alignment',wasteP2:'Main Equipment & Process Components',wasteP3:'Manufacturer / Partner Matching',wasteP4:'Shipment & Documentation Tracking',wasteS1:'Boiler and process equipment',wasteS2:'Filtration, fan and stack systems',wasteS3:'Piping, valves and flow equipment',wasteS4:'Electrical, automation and control',
crush1:'Crushing & Screening',crush2:'Plants',crushLead:'End-to-end sourcing and technical-commercial coordination tailored to crushing and screening requirements',crushP1:'System Configuration',crushP2:'Main Equipment & Auxiliary Units',crushP3:'Manufacturer / Partner Matching',crushP4:'Logistics & Installation Coordination',crushS1:'Crushers and vibrating screens',crushS2:'Conveyor and feeding systems',crushS3:'Steel structures and platforms',crushS4:'Auxiliary equipment and automation',
contactEyebrow:'CONTACT',contact1:'Contact',contact2:'Us',contactLead:'Contact our team for industrial sourcing and project coordination',phoneLabel:'Phone / WhatsApp',purchasingLabel:'Purchasing',emailLabel:'E-mail',addressLabel:'Address',rfq:'Request a Quote'
},
ar:{
coverEyebrow:"التوريد الصناعي · إدارة توريد المشاريع",cover1:'من الاحتياج',cover2:'إلى التسليم',coverLead:"نبحث عن المصادر ونقارن الخيارات وندير التوريد لمشروعكم",coverTag:"شبكة موردين متعددة القطاعات · من الاحتياج إلى التسليم",v1:"البحث عن الموردين",v2:"التقييم الفني والتجاري",v3:"مقارنة العروض والأسعار",v4:"متابعة الشحن والتسليم",discover:'استكشف الكتالوج',
idEyebrow:'من نحن',id1:'التنسيق الفني',id2:'والتجاري',idText:"VORQA هي نقطة اتصالكم الموحدة مع شبكة موردين معتمدين. نجمع القرارات الفنية والتجارية والطلبات والخدمات اللوجستية ضمن عملية مضبوطة.",s1:"نقطة اتصال واحدة",sd1:"ندير التواصل مع جميع الأطراف من نقطة واحدة",s2:"عملية مضبوطة",sd2:"نتابع النطاق والموافقات والتقدم",s3:"شبكة معتمدة",sd3:"نعمل مع المصنعين والشركاء المتخصصين المناسبين",s4:"إدارة العروض والطلبات",sd4:"ننسق الشروط والموافقات ومراحل الطلب",s6:"إدارة اللوجستيات",sd6:"نتابع خطة الشحن والوثائق والتسليم",
scopeEyebrow:'نطاق التوريد',scope1:'فئات',scope2:'التوريد الرئيسية',scopeLead:'توريد صناعي منسق متعدد الفئات',g1:'الصلب والمعادن والمواد الخام',g2:'الأنابيب والوصلات والفلنجات',g3:'المضخات والصمامات والتحكم بالتدفق',g4:'المحركات وعلب التروس ونقل الحركة',g5:'المحامل والوصلات والمكونات الميكانيكية',g6:'المعدات الكهربائية وتوزيع الطاقة',g7:'الأتمتة وأجهزة القياس والتحكم',g8:'الأنظمة الهيدروليكية والهوائية',g9:'المثبتات والحشيات والمستلزمات الصناعية',g10:'الصوامع والسيور ومناولة المواد السائبة',g11:'الترشيح والتهوية وتجميع الغبار',g12:'الهياكل الفولاذية والتصنيع الخاص',
sysEyebrow:'مجالات الحلول',sys1:'حلول',sys2:'الأنظمة',sysLead:'الهندسة والتوريد والتنسيق تُدار معاً',sysA:'محطات الخرسانة',sysB:'مصانع الجلفنة المتكاملة',sysC:'محطات الأسفلت ومعداتها',sysD:'محطات تحويل النفايات إلى طاقة',sysE:'محطات التكسير والغربلة',tap:'عرض التفاصيل',
solutionEyebrow:'حل النظام',backSystems:'حلول الأنظمة',detailSupply:'نطاق التوريد',
con1:'محطات',con2:'الخرسانة',conLead:'دعم توريد منسق وتنفيذ فني وتجاري لمشاريع محطات الخرسانة',conP1:'توضيح نطاق المشروع',conP2:'المعدات الرئيسية والأنظمة المساعدة',conP3:'مطابقة المصنع / الشريك',conP4:'تنسيق الشحن والموقع',conS1:'الخلاطات وحاويات الركام',conS2:'الصوامع وأنظمة الناقل اللولبي',conS3:'معدات الترشيح والجرعات',conS4:'حلول الأتمتة والكهرباء',
galv1:'مصانع الجلفنة',galv2:'المتكاملة',galvLead:'توريد منسق وتنفيذ فني وتجاري لمشاريع خطوط الجلفنة',galvP1:'تهيئة الخط',galvP2:'المعدات الرئيسية والوحدات المساعدة',galvP3:'مطابقة المصنع / الشريك',galvP4:'تنسيق التركيب واللوجستيات',galvS1:'حوض الزنك والفرن وأنظمة التسخين',galvS2:'خطوط المعالجة الكيميائية المسبقة',galvS3:'معدات المناولة والرفع',galvS4:'الأتمتة وتكامل الطاقة',
asp1:'محطات الأسفلت',asp2:'ومعداتها',aspLead:'تنفيذ فني وتجاري منسق مع الموردين المناسبين لمشاريع محطات الأسفلت',aspP1:'مواءمة التطبيق والطاقة',aspP2:'المعدات الرئيسية والأنظمة المساعدة',aspP3:'مطابقة المصنع / الشريك',aspP4:'تنسيق الشحن والتشغيل',aspS1:'أسطوانة التجفيف ونظام الحارق',aspS2:'مجموعات الغربال والحاوية والرافع',aspS3:'معدات البيتومين والفيلر',aspS4:'الترشيح والأتمتة والتحكم',
waste1:'محطات تحويل',waste2:'النفايات إلى طاقة',wasteLead:'توريد منسق وتنفيذ فني وتجاري لمشاريع مستدامة لتحويل النفايات إلى طاقة',wasteP1:'مواءمة النطاق الفني',wasteP2:'المعدات الرئيسية ومكونات العملية',wasteP3:'مطابقة المصنع / الشريك',wasteP4:'متابعة الشحن والوثائق',wasteS1:'الغلايات ومعدات العملية',wasteS2:'الترشيح والمراوح والمداخن',wasteS3:'الأنابيب والصمامات ومعدات التدفق',wasteS4:'الكهرباء والأتمتة والتحكم',
crush1:'محطات التكسير',crush2:'والغربلة',crushLead:'إدارة التوريد والتنسيق الفني والتجاري من البداية للنهاية وفق احتياجات التكسير والغربلة',crushP1:'تهيئة النظام',crushP2:'المعدات الرئيسية والوحدات المساعدة',crushP3:'مطابقة المصنع / الشريك',crushP4:'تنسيق اللوجستيات والتركيب',crushS1:'الكسارات والغرابيل الاهتزازية',crushS2:'السيور وأنظمة التغذية',crushS3:'الهياكل والمنصات الفولاذية',crushS4:'المعدات المساعدة والأتمتة',
contactEyebrow:'اتصل بنا',contact1:'تواصل',contact2:'معنا',contactLead:'تواصل مع فريقنا للتوريد الصناعي وتنسيق المشاريع',phoneLabel:'الهاتف / واتساب',purchasingLabel:'المشتريات',emailLabel:'البريد الإلكتروني',addressLabel:'العنوان',rfq:'طلب عرض سعر'
}};


Object.assign(strings.en, {
coverEyebrow:'INDUSTRIAL SOURCING · PROJECT SUPPLY',
coverLead:'The right sources, a strong supplier network and controlled execution',
coverTag:'Industrial Sourcing · Project Supply Management · One Accountable Partner',
v1:'Project Management',v2:'Supplier Research',v3:'Quotation & Price Comparison',v4:'Commercial Coordination',v5:'Technical Evaluation',v6:'Logistics & Delivery Tracking',
idEyebrow:'Who We Are & How We Work',
id1:'One Point of Contact,',id2:'A Controlled Process'
});
Object.assign(strings.ar, {
coverEyebrow:'التوريد الصناعي · توريد المشاريع',
coverLead:'مصادر مناسبة، وشبكة موردين قوية، وتنفيذ منضبط',
coverTag:'التوريد الصناعي · إدارة توريد المشاريع · شريك واحد مسؤول',
v1:'إدارة المشاريع',v2:'البحث عن الموردين',v3:'مقارنة العروض والأسعار',v4:'التنسيق التجاري',v5:'التقييم الفني',v6:'متابعة اللوجستيات والتسليم',
idEyebrow:'من نحن وكيف نعمل',
id1:'نقطة اتصال واحدة،',id2:'عملية منضبطة'
});

Object.assign(strings.en,{sysA:'Concrete Batching Plants',sysB:'Galvanizing Plants',sysC:'Asphalt & Bitumen Plants',sysD:'Waste-to-Energy',sysE:'Crushing & Screening Plants',sysF:'Energy & Petroleum'});
Object.assign(strings.ar,{sysA:'محطات خلط الخرسانة',sysB:'منشآت الجلفنة',sysC:'مصانع الأسفلت والبيتومين',sysD:'تحويل النفايات إلى طاقة',sysE:'منشآت التكسير والغربلة',sysF:'الطاقة والنفط'});

Object.assign(strings.en,{
coverEyebrow:'Vorqa Global Supply',coverTag:'Supply Chain Management',
localTitle:'Local expertise. National strength. Global supply.',
localText:'We bring the value produced in Türkiye to the world through trusted partnerships.',
sys1:'Specialist',sys2:'Systems',solutionEyebrow:'SPECIALIST SYSTEMS',backSystems:'Specialist Systems',phoneLabel:'Phone'
});
Object.assign(strings.ar,{
coverEyebrow:'Vorqa Global Supply',coverTag:'إدارة سلسلة التوريد',
localTitle:'خبرة محلية. قوة وطنية. توريد عالمي.',
localText:'نوصل القيمة المنتجة في تركيا إلى العالم من خلال شراكات موثوقة.',
sys1:'أنظمة',sys2:'متخصصة',solutionEyebrow:'أنظمة متخصصة',backSystems:'أنظمة متخصصة',phoneLabel:'الهاتف'
});
let currentLang='tr';
function setLang(l){
  currentLang=l;
  const energyPath=l==='tr'?'/tr/sektorler/enerji-petrol/':'/'+l+'/industries/energy-petroleum/';
  document.querySelector('[data-energy-link]').href='https://www.vorqaglobal.com'+energyPath;
  document.documentElement.lang=l;
  document.documentElement.dir='ltr';
  document.body.classList.toggle('rtl',l==='ar');
  document.querySelectorAll('.lang').forEach(b=>b.classList.toggle('active',b.dataset.lang===l));
  document.querySelectorAll('[data-i]').forEach(el=>{
    const k=el.dataset.i;
    el.innerHTML=l==='tr'?(original[k]??el.innerHTML):(strings[l]?.[k]??original[k]??el.innerHTML);
  });
  updateWhatsAppLinks();
}
document.querySelectorAll('.lang').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));

const waMessages={
tr:'Merhaba VORQA, bir teklif talebim var',
en:'Hello VORQA, I would like to request a quotation',
ar:'مرحباً VORQA، أود طلب عرض سعر'
};
function updateWhatsAppLinks(){
  document.querySelectorAll('[data-wa]').forEach(a=>{
    a.href='https://wa.me/905400086772?text='+encodeURIComponent(waMessages[currentLang]||waMessages.en);
  });
}

document.getElementById('shareBtn').onclick=async()=>{
  try{
    if(navigator.share) await navigator.share({title:'VORQA Global Supply',text:'VORQA Interactive Catalog',url:location.href});
    else{
      await navigator.clipboard.writeText(location.href);
      alert(currentLang==='tr'?'Bağlantı kopyalandı':'Link copied');
    }
  }catch(e){}
};

let resizeTimer;
addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>pages[idx].scrollIntoView({behavior:'auto',inline:'start',block:'nearest'}),120);
});

setLang('tr');