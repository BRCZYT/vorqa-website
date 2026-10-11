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
coverEyebrow:'INDUSTRIAL SOURCING · PROJECT SUPPLY',cover1:'From Requirement',cover2:'to Delivery',coverLead:'Technical clarity, the right source and coordinated execution',coverTag:'Industrial Sourcing · Project Supply · One Accountable Partner',v1:'Technical Clarity',v2:'Reliable Supplier Network',v3:'Coordinated Execution',v4:'Reliable Delivery',discover:'Explore the Catalog',
idEyebrow:'WHO WE ARE',id1:'Technical & Commercial',id2:'Coordination',idText:'VORQA connects industrial requirements with verified suppliers and specialist plant partners, managing technical, commercial and delivery coordination from request to target.',s1:'Requirement Review',sd1:'We clarify scope and target',s2:'Technical Clarification',sd2:'We align specifications and critical details',s3:'Supplier / Partner Selection',sd3:'We match the right manufacturer or partner',s4:'Quotation & Order Coordination',sd4:'We coordinate technical and commercial offers',s6:'Logistics & Delivery Tracking',sd6:'We manage shipment through delivery',
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
coverEyebrow:'التوريد الصناعي · توريد المشاريع',cover1:'من الاحتياج',cover2:'إلى التسليم',coverLead:'وضوح فني، مصدر مناسب وتنفيذ منسق',coverTag:'التوريد الصناعي · توريد المشاريع · شريك واحد مسؤول',v1:'وضوح فني',v2:'شبكة موردين موثوقة',v3:'تنفيذ منسق',v4:'تسليم موثوق',discover:'استكشف الكتالوج',
idEyebrow:'من نحن',id1:'التنسيق الفني',id2:'والتجاري',idText:'تربط VORQA الاحتياجات الصناعية بالموردين المعتمدين وشركاء المنشآت المتخصصين، وتدير التنسيق الفني والتجاري وتنسيق التسليم من الطلب حتى الهدف.',s1:'مراجعة الطلب',sd1:'نوضح النطاق والهدف',s2:'التوضيح الفني',sd2:'نوائم المواصفات والتفاصيل الحرجة',s3:'اختيار المورد / الشريك',sd3:'نطابق المصنع أو الشريك المناسب',s4:'تنسيق العرض والطلب',sd4:'ننسق العروض الفنية والتجارية',s6:'اللوجستيات والتسليم',sd6:'ندير الشحن حتى التسليم',
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

let currentLang='tr';
function setLang(l){
  currentLang=l;
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