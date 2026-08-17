const fs=require('fs');
const replacements={
 en:['The right manufacturer, supplier or specialized plant partner is matched from our verified network.','The right manufacturer, supplier or specialized plant partner is identified through requirement-specific supplier and partner research.'],
 tr:['Doğrulanmış ağımızdan doğru üretici, tedarikçi veya uzman tesis partneri eşleştirilir.','Doğru üretici, tedarikçi veya uzman tesis partneri ihtiyaca özel tedarikçi ve partner araştırmasıyla belirlenir.'],
 ar:['يُختار المصنّع أو المورد أو شريك المنشأة المتخصص المناسب من شبكتنا المعتمدة.','يُحدَّد المصنّع أو المورد أو شريك المنشأة المتخصص المناسب من خلال بحث الموردين والشركاء وفق متطلبات المشروع.']
};
const files=[['index.html','en'],['en/index.html','en'],['tr/index.html','tr'],['ar/index.html','ar']];
for(const [file,lang] of files){let s=fs.readFileSync(file,'utf8');const [oldText,newText]=replacements[lang];const n=s.split(oldText).length-1;if(n<1)throw new Error(`${file}: expected old truth claim not found`);s=s.split(oldText).join(newText);fs.writeFileSync(file,s);console.log(`${file}: replaced ${n} occurrence(s)`)}
