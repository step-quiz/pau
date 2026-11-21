const fs=require('fs'),vm=require('vm'),path=require('path');
const [KATEX,OUT]=process.argv.slice(2);
const DIR=path.join(__dirname,'..','..');
for (const f of ['mates.js','formules.js','dades.js','matrius.js','grafiques.js','grafica-funcio.js']) vm.runInThisContext(fs.readFileSync(path.join(DIR,f),'utf8'),{filename:f});
const PROP=require('./propostes.js');
const P=GraficaFuncio;
const COLORS={mes:'cfeee2',menys:'f9d4d4',tria:'faeab0',solucio:'e3dcf2',actual:'e3dcf2',cami0:'d4e3fc',cami1:'f7d3e5',cami2:'cdf0f6'};
function senseClaus(tex){let s='',i=0;while(i<tex.length){const j=tex.indexOf('\\htmlData{',i);if(j<0){s+=tex.slice(i);break;}s+=tex.slice(i,j);const fi=tex.indexOf('}',j);const marca=(/marca=(\w+)/.exec(tex.slice(j+10,fi))||[])[1];let k=fi+1,n=0;const ini=k;do{if(tex[k]==='\\')k++;else if(tex[k]==='{')n++;else if(tex[k]==='}')n--;k++;}while(n>0&&k<tex.length);const dins=senseClaus(tex.slice(ini+1,k-1));s+=marca&&COLORS[marca]?`\\colorbox{#${COLORS[marca]}}{$${dins}$}`:`{${dins}}`;i=k;}return s;}
const textNet=t=>t.slice(1).replace(/\{\{[^|}]*\|[^|}]*\|([^}]*)\}\}/g,'$1');
const taula=[],lloc=new Map();
const fila=tex=>{if(!tex)return -1;const net=tex.startsWith('<svg')?tex:tex.startsWith('§')?'§'+textNet(tex):senseClaus(tex);if(!lloc.has(net)){lloc.set(net,taula.length);taula.push(net);}return lloc.get(net);};
const pl=t=>t.replace(/\$[^$]*\$/g,'$·$').replace(/\d+(?:[.,]\d+)?/g,'#');
const SECCIONS=['Inici','Domini i asímptotes verticals','Límits en l\'infinit i asímptotes','Punts de tall amb els eixos','Creixement i extrems','Concavitat i inflexió','Taula de valors','Gràfica'];
const exemples=[];
const usos={};
for(const e of P.exemples){const v=Object.assign({},P.perDefecte,e);const ps=P.passos(v);let sec=0;
 const passos=ps.map(p=>{const m=/^(\d)\. /.exec(p.text);if(m)sec=+m[1];
  const pr=PROP.find(o=>o.re.some(r=>r.test(p.text)));
  const ini=pr&&pr.inici&&pr.inici.some(r=>r.test(p.text));
  if(pr) usos[pr.id]=(usos[pr.id]||0)+1;
  return {t:p.text,f:p.files.map(fila),c:p.classes.map(c=>c||''),s:sec,pl:pl(p.text),pr:pr?pr.id:'',ini:ini?1:0};});
 exemples.push({id:e.p,nom:P.nomExemple(v),enunciat:P.enunciat(v),adreca:'?p='+e.p,passos});}
const propostes=PROP.map(o=>({id:o.id,cat:o.cat,titol:o.titol,passa:o.passa,proposta:o.proposta,pregunta:o.pregunta,ambAnterior:!!o.ambAnterior,elimina:!!o.elimina,n:usos[o.id]||0}));
// KaTeX
const katex=require(path.resolve(KATEX,'katex.js'));let err=0;
const prova=t=>{try{katex.renderToString(t,{throwOnError:true,strict:'ignore'})}catch(e){err++;console.error(e.message.slice(0,120))}};
taula.forEach(t=>t.startsWith('<svg')?0:t.startsWith('§')?[...t.matchAll(/\$([^$]+)\$/g)].forEach(m=>prova(m[1])):prova(t));
for(const o of PROP)for(const k of ['titol','passa','proposta','pregunta'])[...o[k].matchAll(/\$([^$]+)\$/g)].forEach(m=>prova(m[1]));
for(const e of exemples)e.passos.forEach(s=>[...s.t.matchAll(/\$([^$]+)\$/g)].forEach(m=>prova(m[1])));
if(err){console.error(err+' errors');process.exit(1);}
let css=fs.readFileSync(path.join(KATEX,'katex.min.css'),'utf8');
css=css.replace(/src:url\(fonts\/([\w-]+)\.woff2\) format\("woff2"\)[^}]*/g,(_,n)=>`src:url(data:font/woff2;base64,${fs.readFileSync(path.join(KATEX,'fonts',n+'.woff2')).toString('base64')}) format("woff2")`);
const dades=JSON.stringify({generat:new Date().toISOString().slice(0,10),files:taula,seccions:SECCIONS,exemples,propostes});
const pla=fs.readFileSync(path.join(__dirname,'plantilla.html'),'utf8');
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'index.html'),pla.replace('/*__KATEX_CSS__*/',()=>css).replace('/*__PISSARRA_CSS__*/',()=>fs.readFileSync(path.join(__dirname,'pissarra.css'),'utf8')).replace('/*__DADES__*/',()=>dades.replace(/</g,'\\u003c')));
// estimació amb totes les propostes (sobre els passos que dona la pàgina ara)
for(const e of exemples){let n=0,prev=null;for(const s of e.passos){const o=PROP.find(x=>x.id===s.pr);if(o&&o.elimina)continue;if(o&&o.ambAnterior){continue;}if(s.pr&&s.pr===prev&&!s.ini)continue;n++;prev=s.pr||null;}console.log(e.id,e.passos.length,'→',n);}
console.log(JSON.stringify(usos));
console.log(Math.round(fs.statSync(path.join(OUT,'index.html')).size/1024)+' kB');
