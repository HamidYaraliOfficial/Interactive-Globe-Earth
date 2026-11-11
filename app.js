/* Interactive Globe v2 — Hamid Yarali (حمید یارعلی) — MIT. Data: Natural Earth (public domain), mledoze/countries (ODbL) */
(async()=>{
const $=i=>document.getElementById(i),W=window.W,I=window.INFO||{},D=Math.PI/180,NS='http://www.w3.org/2000/svg';
const el=(p,t,a={},tx)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(tx!=null)e.textContent=tx;p.appendChild(e);return e};
const dec=s=>{let i=0,a=0,b=0;const o=[],n=()=>{let r=0,sh=0,c;do{c=s.charCodeAt(i++)-63;r|=(c&31)<<sh;sh+=5}while(c>=32);return r&1?~(r>>1):r>>1};while(i<s.length){a+=n();b+=n();o.push([b/100,a/100])}return o};
const nf=(n,l,d=0)=>Number(Number(n||0).toFixed(d)).toLocaleString(l==='fa'?'fa-IR':'en-US');
const tbl=s=>(s||'').trim().split('\n').filter(Boolean).map(r=>r.split('|'));
const loadScript=s=>new Promise(r=>{const e=document.createElement('script');e.src=s;e.onload=e.onerror=r;document.head.appendChild(e)});
if(location.protocol==='file:'&&!window.EARTH)await loadScript('data/earth.js');
const TEX=window.EARTH||'data/earth.jpg';
if(!window.INLINE)await loadScript('data/pop.js');
const CBQ={};window.CDATA=window.CDATA||{};window.CD=(a,d)=>{CDATA[a]=d;(CBQ[a]||[]).forEach(f=>f());CBQ[a]=[]};
const loadC=a=>new Promise(res=>{if(CDATA[a])return res(CDATA[a]);if(window.INLINE)return res({});(CBQ[a]=CBQ[a]||[]).push(()=>res(CDATA[a]));const s=document.createElement('script');s.src=`data/c/${a}.js`;s.onerror=()=>{CDATA[a]={};res({})};document.head.appendChild(s)});
const CONT={Asia:'آسیا',Europe:'اروپا',Africa:'آفریقا','North America':'آمریکای شمالی','South America':'آمریکای جنوبی',Oceania:'اقیانوسیه','Seven seas (open ocean)':'اقیانوس‌ها'};
const TX={c:['کشور','Country'],prov:['استان / بخش','Province / region'],riv:['رود','River'],lake:['دریاچه','Lake'],pk:['قله','Peak'],city:['شهر','City'],sea:['پهنهٔ آبی','Water body'],isl:['جزیره','Island'],reg:['عارضهٔ جغرافیایی','Geographic feature']};
const CLS={'Range/mtn':['رشته‌کوه','Mountain range'],Desert:['بیابان / کویر','Desert'],Plateau:['فلات','Plateau'],Plain:['دشت','Plain'],Basin:['حوضه','Basin'],Delta:['دلتا','Delta'],Peninsula:['شبه‌جزیره','Peninsula'],'Pen/cape':['شبه‌جزیره / دماغه','Peninsula / cape'],Island:['جزیره','Island'],'Island group':['مجمع‌الجزایر','Island group'],sea:['دریا','Sea'],gulf:['خلیج','Gulf'],bay:['خلیج کوچک','Bay'],strait:['تنگه','Strait'],sound:['آبراه','Sound'],channel:['کانال','Channel'],ocean:['اقیانوس','Ocean'],fjord:['فیورد','Fjord'],lagoon:['تالاب ساحلی','Lagoon'],generic:['پهنهٔ آبی','Water body']};
const rb=r=>{let a=180,b=90,c=-180,d=-90;r.forEach(([x,y])=>{a=Math.min(a,x);b=Math.min(b,y);c=Math.max(c,x);d=Math.max(d,y)});return[a,b,c,d]};
const ar=b=>(b[2]-b[0])*(b[3]-b[1]),bbOf=ps=>rb(ps.flatMap(p=>p[0]));
let ui='fa',cur=null,moved=0,drag=null,dr=null,pending=null,busy=false;
const C=W.c.map(([a3,en,fa,formal,cont,sub,pop,gdp,inc,eco,a2,area,caps,flag,langs,curr,call,borders,tld,demo,tz,pl])=>{const polys=pl.map(p=>p.map(dec)),bbs=polys.map(p=>rb(p[0]));
 return{k:'c',a3,en,fa:fa||en,formal,cont,sub,pop,gdp,inc,eco,a2,area,caps,flag,langs,curr,call,borders,tld,demo,tz,polys,bbs,n:0,bb:[Math.min(...bbs.map(b=>b[0])),Math.min(...bbs.map(b=>b[1])),Math.max(...bbs.map(b=>b[2])),Math.max(...bbs.map(b=>b[3]))]}});
const byA3=Object.fromEntries(C.map(c=>[c.a3,c]));W.s.forEach(s=>s[0]==='p'&&byA3[s[3]]&&byA3[s[3]].n++);
const MR=W.m.map(([en,fa,cl,sr,pl,lx,ly])=>{const ps=pl.map(p=>p.map(dec));return{k:'sea',en,fa:fa||en,cl,sr,ps,lx,ly,bb:bbOf(ps)}}).sort((a,b)=>a.sr-b.sr);
const RG=W.g.map(([en,fa,cl,area,pl,lx,ly])=>{const ps=pl.map(p=>p.map(dec));return{k:cl.startsWith('Island')?'isl':'reg',en,fa:fa||en,cl,area,ps,lx,ly,bb:bbOf(ps)}});
const mainBB=c=>{const m=Math.max(...c.bbs.map(ar)),B=c.bbs.find(b=>ar(b)===m),lx=(B[0]+B[2])/2,ly=(B[1]+B[3])/2,d=Math.max(B[2]-B[0],B[3]-B[1],1);
 let s=c.bbs.filter(b=>ar(b)>=m*.03&&Math.hypot((b[0]+b[2])/2-lx,(b[1]+b[3])/2-ly)<=2.5*d);if(c.bbs.some(b=>b[2]>179.9))s=s.filter(b=>b[0]>-179.9);
 return[Math.min(...s.map(b=>b[0])),Math.min(...s.map(b=>b[1])),Math.max(...s.map(b=>b[2])),Math.max(...s.map(b=>b[3]))]};
const inRing=(x,y,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const[a,b]=r[i],[p,q]=r[j];if((b>y)!==(q>y)&&x<(p-a)*(y-b)/(q-b)+a)c=!c}return c};
const inPoly=(x,y,ps)=>ps.some(p=>inRing(x,y,p[0])&&!p.slice(1).some(h=>inRing(x,y,h)));
const which=(x,y)=>C.find(c=>x>=c.bb[0]&&x<=c.bb[2]&&y>=c.bb[1]&&y<=c.bb[3]&&c.bbs.some((b,i)=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3]&&inPoly(x,y,[c.polys[i]])));
const IR={};tbl(I.prov).forEach(([n,fa,en,cf,ce,pop])=>IR['IR-'+n]={cf,ce,pop:+pop});
const NOTE={'persian gulf':['seas','gulf'],'gulf of oman':['seas','oman'],'caspian sea':['seas','caspian'],'dasht-e kavir':['ter','kavir'],'dasht-e lut':['ter','lut'],'elburz mountains':['ter','alborz'],'zagros mountains':['ter','zagros'],'kopet dag':['ter','kopet']};
const noteFor=e=>{const m=NOTE[(e.en||'').toLowerCase()],r=m&&tbl(I[m[0]]).find(r=>r[0]===m[1]);return r?(m[0]==='seas'?[r[5],r[6],r[1]]:[r[3],r[4],r[1]]):null};
const tip=$('tip');
const showTip=(v,e)=>{tip.style.display='block';tip.innerHTML=(e.fa||e.en)+(e.fa&&e.fa!==e.en?' — '+e.en:'');tip.style.left=Math.min(v.clientX+14,innerWidth-200)+'px';tip.style.top=v.clientY+14+'px'};
const bind=(n,e)=>{n.addEventListener('mousemove',v=>showTip(v,e));n.addEventListener('mouseleave',()=>tip.style.display='none');n.addEventListener('click',()=>{if(moved<5)open(e)})};

/* ---------- 3D globe ---------- */
const ll2v=(lo,la,r=1)=>{const a=la*D,b=lo*D;return[r*Math.cos(a)*Math.cos(b),r*Math.sin(a),-r*Math.cos(a)*Math.sin(b)]};
const ren=new THREE.WebGLRenderer({antialias:true,alpha:true}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1,.1,200),cv=ren.domElement;
ren.setPixelRatio(Math.min(devicePixelRatio,2));$('globe').appendChild(cv);cam.position.z=3.4;
const earth=new THREE.Group();sc.add(earth);earth.rotation.x=.45;earth.rotation.y=-.9;
const sph=new THREE.Mesh(new THREE.SphereGeometry(1,128,96),new THREE.MeshPhongMaterial({map:new THREE.TextureLoader().load(TEX),shininess:6,specular:0x223344}));earth.add(sph);
sc.add(new THREE.AmbientLight(0xffffff,.9));const sun=new THREE.DirectionalLight(0xffffff,.5);sun.position.set(-3,2,4);sc.add(sun);
sc.add(new THREE.Mesh(new THREE.SphereGeometry(1.14,64,64),new THREE.ShaderMaterial({vertexShader:'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 n;void main(){float i=pow(.74-dot(n,vec3(0.,0.,1.)),3.);gl_FragColor=vec4(.3,.6,1.,1.)*i;}',side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true})));
const st=[];for(let i=0;i<1800;i++){const u=Math.random()*2-1,t=Math.random()*6.283,r=Math.sqrt(1-u*u);st.push(60*r*Math.cos(t),60*u,60*r*Math.sin(t))}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(st,3));sc.add(new THREE.Points(sg,new THREE.PointsMaterial({size:.25,color:0xffffff})));
const seg=(polys,r)=>{const o=[];polys.forEach(p=>p.forEach(ring=>{for(let i=1;i<ring.length;i++)o.push(...ll2v(ring[i-1][0],ring[i-1][1],r),...ll2v(ring[i][0],ring[i][1],r))}));const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(o,3));return g};
earth.add(new THREE.LineSegments(seg(C.flatMap(c=>c.polys),1.001),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.5})));
let hl=null,hlA=null;const setHL=c=>{if(hlA===c)return;hlA=c;if(hl){earth.remove(hl);hl.geometry.dispose();hl=null}if(c){hl=new THREE.LineSegments(seg(c.polys,1.004),new THREE.LineBasicMaterial({color:0xffd34d}));earth.add(hl)}};
/* globe labels (sprites) */
const LB=[...C.map(c=>{const b=mainBB(c);return{o:c,v:new THREE.Vector3(...ll2v((b[0]+b[2])/2,(b[1]+b[3])/2,1.012)),min:c.area,oc:0}}),...MR.filter(m=>m.cl==='ocean').map(m=>({o:m,v:new THREE.Vector3(...ll2v(m.lx,m.ly,1.012)),min:0,oc:1}))];
const mkSprite=(text,oc)=>{const c=document.createElement('canvas'),x=c.getContext('2d'),f=`${oc?'italic ':''}bold 44px Vazirmatn,Tahoma,sans-serif`;x.font=f;const w=Math.ceil(x.measureText(text).width)+20;c.width=w;c.height=64;x.font=f;x.textBaseline='middle';x.lineJoin='round';x.lineWidth=8;x.strokeStyle='rgba(0,0,0,.8)';x.fillStyle=oc?'#9fd4ff':'#fff';x.strokeText(text,10,34);x.fillText(text,10,34);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.userData.ar=w/64;return s};
const relabel=()=>{LB.forEach(l=>{if(l.s){earth.remove(l.s);l.s.material.map.dispose();l.s.material.dispose()}l.s=mkSprite(ui==='fa'?(l.o.fa||l.o.en):l.o.en,l.oc);l.s.position.copy(l.v);earth.add(l.s)})};
const tmp=new THREE.Vector3();
const updLabels=()=>{earth.updateMatrixWorld();const z=cam.position.z,h=.04*z/3.4,thr=4e5*Math.pow(Math.max(z-1.4,.05)/2,2.5);
 LB.forEach(l=>{if(!l.s)return;tmp.copy(l.v).applyMatrix4(earth.matrixWorld);const vis=tmp.z>1/z+.08&&(l.oc?z>2.4:l.min>=thr);l.s.visible=vis;if(vis)l.s.scale.set(h*l.s.userData.ar,h,1)})};
const rc=new THREE.Raycaster(),mv=new THREE.Vector2();
const pick=e=>{const b=cv.getBoundingClientRect();mv.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);rc.setFromCamera(mv,cam);earth.updateMatrixWorld();const h=rc.intersectObject(sph)[0];if(!h)return null;const p=earth.worldToLocal(h.point.clone());return which(Math.atan2(-p.z,p.x)/D,Math.asin(p.y)/D)};
let idle=true;
const pts=new Map();let pd=0;
addEventListener('pointerdown',e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);pd=0},true);
addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const[a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd)$('cv').hidden?zoomG(pd/d):zoomC(pd/d);pd=d;moved=99;drag=null;dr=null}},true);
['pointerup','pointercancel'].forEach(t=>addEventListener(t,e=>{pts.delete(e.pointerId);pd=0},true));
cv.addEventListener('pointerdown',e=>{if(pts.size>1)return;drag={x:e.clientX,y:e.clientY};moved=0;idle=false});
addEventListener('pointermove',e=>{if(!$('cv').hidden||pts.size>1)return;if(drag){const k=.005*cam.position.z/3.4,dx=e.clientX-drag.x,dy=e.clientY-drag.y;earth.rotation.y+=dx*k;earth.rotation.x=Math.max(-1.4,Math.min(1.4,earth.rotation.x+dy*k));moved+=Math.abs(dx)+Math.abs(dy);drag={x:e.clientX,y:e.clientY};tip.style.display='none'}
 else if(e.target===cv&&!busy){const c=pick(e);setHL(c);if(c)showTip(e,c);else tip.style.display='none'}});
addEventListener('pointerup',e=>{if(drag&&moved<5&&e.target===cv&&$('cv').hidden){const c=pick(e);if(c)go(c.a3)}drag=null});
cv.addEventListener('wheel',e=>{e.preventDefault();zoomG(e.deltaY>0?1.1:.9)},{passive:false});
const zoomG=f=>cam.position.z=Math.max(1.7,Math.min(6,cam.position.z*f));
const fitR=()=>{const b=$('globe').getBoundingClientRect();if(!b.width)return;ren.setSize(b.width,b.height);cam.aspect=b.width/b.height;cam.updateProjectionMatrix()};
(function loop(){requestAnimationFrame(loop);if($('globe').hidden)return;if(idle&&!drag)earth.rotation.y+=.0012;updLabels();ren.render(sc,cam)})();
addEventListener('resize',()=>{fitR();layout()});fitR();
const go=(a3,opt)=>{const c=byA3[a3];if(!c||busy)return;busy=true;idle=false;pending=opt||null;tip.style.display='none';if(!$('cv').hidden)back(true);setHL(c);const b=mainBB(c),lo=(b[0]+b[2])/2,la=(b[1]+b[3])/2,[x,,z]=ll2v(lo,la),ty=Math.atan2(-x,z),tx=la*D,t0=performance.now(),y0=earth.rotation.y,x0=earth.rotation.x,z0=cam.position.z,dy=Math.atan2(Math.sin(ty-y0),Math.cos(ty-y0));
 const step=t=>{const k=Math.min(1,(t-t0)/900),e=k*k*(3-2*k);earth.rotation.y=y0+dy*e;earth.rotation.x=x0+(tx-x0)*e;cam.position.z=z0+(1.8-z0)*e;if(k<1)requestAnimationFrame(step);else{busy=false;show(c,b)}};requestAnimationFrame(step)};

/* ---------- country view ---------- */
const svg=$('map'),stage=$('stage'),can=$('rc');let vb,S,HH,f=1,ma,mb,lonMin,lonMax,latMin,latMax,labs=[],scal=[],L={},ENT=[],minW=110;
const my=la=>Math.log(Math.tan(Math.PI/4+la*D/2)),img=u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=u});
const EIMG=await img(TEX);
async function relief(){const span=lonMax-lonMin;
 if(!window.INLINE&&span*60<=4400){const x0=(lonMin+180)*60,x1=(lonMax+180)*60,y0=(90-latMax)*60,y1=(90-latMin)*60,cs=[],rs=[];
  for(let c=Math.floor(x0/2700);c<=Math.min(7,Math.floor((x1-.01)/2700));c++)cs.push(c);for(let r=Math.floor(y0/2700);r<=Math.min(3,Math.floor((y1-.01)/2700));r++)rs.push(r);
  const tl=await Promise.all(rs.flatMap(r=>cs.map(async c=>({r,c,i:await img(`data/tiles/${r}${c}.jpg`)}))));
  if(tl.every(t=>t.i)){const s=document.createElement('canvas');s.width=Math.ceil(x1-x0);s.height=Math.ceil(y1-y0);const x=s.getContext('2d');tl.forEach(t=>x.drawImage(t.i,t.c*2700-x0,t.r*2700-y0));minW=50;
   return{src:s,sx:0,sw:s.width,sy:la=>(latMax-la)/(latMax-latMin)*s.height,H:s.height}}}
 minW=110;return{src:EIMG,sx:(lonMin+180)/360*EIMG.width,sw:span/360*EIMG.width,sy:la=>(90-la)/180*EIMG.height,H:EIMG.height}}
async function show(c,bb){cur=c;$('globe').hidden=true;$('cv').hidden=false;$('bk').hidden=false;$('ci').hidden=false;$('hint').hidden=true;$('ctitle').textContent=c.fa+' · '+c.en;if(location.hash.slice(1)!==c.a3)location.hash=c.a3;
 const cd=await loadC(c.a3),[x0,y0,x1,y1]=bb,cx=(x0+x1)/2,cy=(y0+y1)/2,sp=Math.max(x1-x0,2,(y1-y0)*.75),sq=Math.max(y1-y0,1.4,sp*.5),hx=sp/2*1.2,hy=sq/2*1.2;
 lonMin=Math.max(-180,cx-hx);lonMax=Math.min(180,cx+hx);latMin=Math.max(-80,cy-hy);latMax=Math.min(84,cy+hy);S=1000/((lonMax-lonMin)*D);ma=my(latMax);mb=my(latMin);HH=Math.round((ma-mb)*S);
 const pr=(lo,la)=>[(lo-lonMin)*D*S,(ma-my(la))*S],inW=(x,y)=>x>=lonMin&&x<=lonMax&&y>=latMin&&y<=latMax,hit=b=>b[2]>lonMin&&b[0]<lonMax&&b[3]>latMin&&b[1]<latMax;
 const pth=ps=>ps.map(p=>p.map(r=>'M'+r.map(([a,b])=>pr(a,b).map(v=>v.toFixed(1)).join(',')).join('L')+'Z').join('')).join('');
 const R=await relief();can.width=2000;can.height=Math.round(2*HH);const ctx=can.getContext('2d');ctx.imageSmoothingQuality='high';
 for(let y=0;y<can.height;y++){const m=ma-(y+.5)/can.height*(ma-mb),la=(2*Math.atan(Math.exp(m))-Math.PI/2)/D;ctx.drawImage(R.src,R.sx,Math.max(0,Math.min(R.H-1,R.sy(la)-.5)),R.sw,1,0,y,2000,1)}
 svg.innerHTML='';labs=[];scal=[];ENT=[];L={};['dim','sea','prov','lk','rv','isl','pk','ct','tl','lab'].forEach(k=>L[k]=el(svg,'g',{class:k}));
 const wa=(lonMax-lonMin)*(latMax-latMin)*12321*Math.cos(cy*D),add=(n,e)=>{ENT.push(e);bind(n,e);return n};
 el(L.dim,'path',{d:pth(C.filter(o=>o!==c&&o.bb[2]>lonMin&&o.bb[0]<lonMax&&o.bb[3]>latMin&&o.bb[1]<latMax).flatMap(o=>o.polys)),class:'dim'});
 MR.filter(m=>hit(m.bb)&&m.cl!=='river'&&m.cl!=='reef').forEach(m=>{const n=noteFor(m);if(n){m.nfa=n[0];m.nen=n[1];m.fa=n[2]}add(el(L.sea,'path',{d:pth(m.ps),class:'s'}),m);
  if(inW(m.lx,m.ly)){const[x,y]=pr(m.lx,m.ly),t=el(L.tl,'text',{x,y,class:'sea'});labs.push([t,m,m.cl==='ocean'?9:m.sr<3?.2:.02,'r'])}});
 if(c.a3==='IRN'&&I.hormuz){const r=tbl(I.seas).find(r=>r[0]==='hormuz'),e={k:'sea',en:r[2],fa:r[1],cl:'strait',nfa:r[5],nen:r[6]};add(el(L.sea,'path',{d:pth([[I.hormuz.concat([I.hormuz[0]])]]),class:'s hz'}),e)}
 let pv=(cd.p||[]).map(([en,fa,type,code,area,pl])=>({k:'prov',a3:c.a3,en:en||fa||'—',fa:(fa||en||'—').replace(/^استان /,''),type,code,area,polys:pl.map(q=>q.map(dec))}));
 if(!pv.length)pv=[{k:'prov',a3:c.a3,en:c.en,fa:c.fa,type:'Country',code:c.a3,area:c.area,polys:c.polys}];
 pv.forEach((p,i)=>{add(el(L.prov,'path',{d:pth(p.polys),fill:`hsl(${i*47%360} 55% 60% / .12)`}),p);
  const big=p.polys.map(q=>rb(q[0])).sort((a,b)=>ar(b)-ar(a))[0];if(big){const[a,b]=pr(big[0],big[3]),[a2,b2]=pr(big[2],big[1]);labs.push([el(L.lab,'text',{x:(a+a2)/2,y:(b+b2)/2}),p,Math.abs((a2-a)*(b2-b)),'p'])}});
 el(svg,'path',{d:pth(c.polys),class:'out'});
 const ISL={};tbl(I.isl).forEach(r=>ISL[r[2].toLowerCase()]=r);const used=new Set();
 RG.filter(g=>hit(g.bb)).forEach(g=>{if(g.k==='isl'&&g.cl!=='Island group'){const r=c.a3==='IRN'&&ISL[g.en.toLowerCase()];if(r){used.add(r[0]);Object.assign(g,{pf:r[6],pe:r[7],ar:+r[5]||g.area,nfa:r[8],nen:r[9]})}
   add(el(L.isl,'path',{d:pth(g.ps),class:'ip'}),g);const big=g.ps.map(q=>rb(q[0])).sort((a,b)=>ar(b)-ar(a))[0],[a,b]=pr(big[0],big[3]),[a2,b2]=pr(big[2],big[1]);labs.push([el(L.lab,'text',{x:(a+a2)/2,y:(b+b2)/2,class:'il'}),g,Math.abs((a2-a)*(b2-b))*.4,'p'])}
  else if(inW(g.lx,g.ly)&&g.area>wa*.0008){const n=noteFor(g);if(n){g.nfa=n[0];g.nen=n[1]}const[x,y]=pr(g.lx,g.ly),t=el(L.tl,'text',{x,y,class:g.cl==='Desert'?'desert':'mtn'});ENT.push(g);bind(t,g);labs.push([t,g,g.area/wa,'r'])}});
 if(c.a3==='IRN')tbl(I.isl).filter(r=>!used.has(r[0])).forEach(r=>{const[x,y]=pr(+r[3],+r[4]),n=el(L.ct,'circle',{r:4,class:'ic'});scal.push([n,x,y]);add(n,{k:'isl',en:r[2],fa:r[1],lo:+r[3],la:+r[4],ar:+r[5],pf:r[6],pe:r[7],nfa:r[8],nen:r[9]})});
 (cd.l||[]).forEach(([en,fa,ps])=>add(el(L.lk,'path',{d:pth(ps.map(p=>p.map(dec)))}),{k:'lake',en:en||'Lake',fa:fa||en||'دریاچه'}));
 if(c.a3==='IRN'){tbl(I.salt).forEach(([id,fa,en,lo,la,rx,ry,nfa,nen])=>{const[x,y]=pr(+lo,+la),k=D*S;add(el(L.lk,'ellipse',{cx:x,cy:y,rx:rx*k,ry:ry*k/Math.cos(la*D)}),{k:'lake',en,fa,nfa,nen})})}
 const river=(en,fa,d,e)=>{const g=el(L.rv,'g');el(g,'path',{d,class:'v'});if(en)add(el(g,'path',{d,class:'h'}),e)};
 (cd.r||[]).forEach(([en,fa,ls,len])=>river(en,fa,ls.map(dec).map(l=>'M'+l.map(p=>pr(p[0],p[1]).map(v=>v.toFixed(1)).join(',')).join('L')).join(''),{k:'riv',en,fa:fa||en,len}));
 if(c.a3==='IRN'){const RV={};tbl(I.riv).forEach(r=>RV[r[0]]=r);for(const k in I.lines){const r=RV[k];river(r[2],r[1],'M'+I.lines[k].map(p=>pr(p[0],p[1]).map(v=>v.toFixed(1)).join(',')).join('L'),{k:'riv',en:r[2],fa:r[1],nfa:r[3],nen:r[4]})}}
 (cd.k||[]).forEach(([en,fa,m,lo,la])=>{if(inW(lo,la)){const[x,y]=pr(lo,la),n=el(L.pk,'path',{d:'M0,-6L5,3.5L-5,3.5Z'});scal.push([n,x,y]);add(n,{k:'pk',en,fa:fa||en,m,lo,la})}});
 (cd.t||[]).filter(t=>inW(t[3],t[4])).forEach(([en,fa,pop,lo,la,cap,tz],i)=>{const[x,y]=pr(lo,la),n=cap?el(L.ct,'rect',{x:-4,y:-4,width:8,height:8}):el(L.ct,'circle',{r:3.5});scal.push([n,x,y]);const e={k:'city',en,fa:fa||en,pop,lo,la,cap,tz};add(n,e);
  if(i<14)labs.push([el(L.ct,'text',{x,y:y-8}),e,i,'c'])});
 vb={x:0,y:0,w:1000,h:HH};layout();applyUI();
 if(pending){const p=pending;pending=null;focusOn(p)}}
const layout=()=>{if($('cv').hidden||!HH)return;const b=$('cv').getBoundingClientRect();f=Math.min(b.width/1000,b.height/HH);stage.style.width=1000*f+'px';stage.style.height=HH*f+'px';can.style.width=1000*f+'px';can.style.height=HH*f+'px';fit()};
const fit=()=>{if(!vb)return;svg.setAttribute('viewBox',`${vb.x} ${vb.y} ${vb.w} ${vb.h}`);const k=vb.w/1000,s=1/k;can.style.transform=`translate(${-vb.x*f*s}px,${-vb.y*f*s}px) scale(${s})`;
 L.lab.setAttribute('font-size',11*k);L.ct.setAttribute('font-size',10*k);L.tl.setAttribute('font-size',12*k);scal.forEach(([n,x,y])=>n.tagName==='circle'&&n.classList.contains('ic')||n.tagName==='path'||n.tagName==='rect'?n.setAttribute('transform',`translate(${x},${y}) scale(${k})`):(n.setAttribute('cx',x),n.setAttribute('cy',y),n.setAttribute('r',3.5*k)));
 labs.forEach(([t,e,a,g])=>{t.textContent=ui==='fa'?(e.fa||e.en):e.en;t.style.display=g==='p'?(a>2500*k*k?'':'none'):g==='r'?(a>.003*k*k?'':'none'):(a<3+3/k?'':'none')})};
const zoomC=(f2,cx=.5,cy=.5)=>{if(!vb)return;const w=Math.min(1000,Math.max(minW,vb.w*f2)),r=w/vb.w;vb.x+=vb.w*cx*(1-r);vb.y+=vb.h*cy*(1-r);vb.w=w;vb.h=w*HH/1000;vb.x=Math.max(0,Math.min(1000-vb.w,vb.x));vb.y=Math.max(0,Math.min(HH-vb.h,vb.y));fit()};
svg.addEventListener('wheel',v=>{v.preventDefault();const b=svg.getBoundingClientRect();zoomC(v.deltaY>0?1.2:1/1.2,(v.clientX-b.left)/b.width,(v.clientY-b.top)/b.height)},{passive:false});
svg.addEventListener('pointerdown',v=>{if(pts.size>1)return;dr={x:v.clientX,y:v.clientY};moved=0});
addEventListener('pointermove',v=>{if(!dr||$('cv').hidden||pts.size>1)return;const s=vb.w/(1000*f),dx=v.clientX-dr.x,dy=v.clientY-dr.y;moved+=Math.abs(dx)+Math.abs(dy);vb.x=Math.max(0,Math.min(1000-vb.w,vb.x-dx*s));vb.y=Math.max(0,Math.min(HH-vb.h,vb.y-dy*s));dr={x:v.clientX,y:v.clientY};fit()});
addEventListener('pointerup',()=>dr=null);
function focusOn(it){const e=ENT.find(x=>x.k===(it.t==='p'?'prov':it.t==='t'?'city':'pk')&&(x.en===it.en||x.fa===it.fa));const lo=it.lo,la=it.la,[px,py]=[(lo-lonMin)*D*S,(ma-my(la))*S],w=Math.max(minW,260);vb.w=w;vb.h=w*HH/1000;vb.x=Math.max(0,Math.min(1000-vb.w,px-w/2));vb.y=Math.max(0,Math.min(HH-vb.h,py-vb.h/2));fit();if(e)open(e)}
function back(silent){$('cv').hidden=true;$('globe').hidden=false;$('bk').hidden=true;$('ci').hidden=true;$('hint').hidden=false;cur=null;busy=false;vb=null;fitR();cam.position.z=3.4;tip.style.display='none';if(location.hash)history.pushState('',document.title,location.pathname+location.search);if(!silent){idle=true;setHL(null)}}

/* ---------- modal ---------- */
function rows(e){const r4=(a,b,c,d)=>[a,b,c,d],L2=(a,b,c)=>r4(a,b,c,c);
 const note=e.nfa?[r4('توضیحات','Description',e.nfa,e.nen)]:[],ll=e.lo!=null?[r4('مختصات','Coordinates',nf(e.la,'fa',2)+'° ، '+nf(e.lo,'fa',2)+'°',e.la+'° N/S, '+e.lo+'° E/W')]:[];
 if(e.k==='c'){const x=s=>(s||'—').replace(/^\d+\. /,''),nb=e.borders.map(b=>byA3[b]).filter(Boolean),j=(a,s)=>a.length?a.join(s):'—',gp=e.pop?e.gdp*1e6/e.pop:0;
  return[r4('نام رسمی','Official name',e.formal||e.en,e.formal||e.en),r4('قاره','Continent',CONT[e.cont]||e.cont,e.cont),r4('منطقه','Region',e.sub,e.sub),r4('پایتخت','Capital',j(e.caps,'، '),j(e.caps,', ')),
  r4('جمعیت (تخمین)','Population (est.)',nf(e.pop,'fa'),nf(e.pop,'en')),r4('مساحت','Area',nf(e.area,'fa')+' کیلومتر مربع',nf(e.area,'en')+' km²'),r4('تراکم جمعیت','Population density',nf(e.pop/e.area,'fa')+' نفر در کیلومتر مربع',nf(e.pop/e.area,'en')+' per km²'),
  r4('تولید ناخالص داخلی (میلیون دلار)','GDP (USD million)',nf(e.gdp,'fa'),nf(e.gdp,'en')),r4('سرانهٔ GDP (تقریبی، دلار)','GDP per capita (approx., USD)',nf(gp,'fa'),nf(gp,'en')),L2('گروه درآمدی','Income group',x(e.inc)),L2('نوع اقتصاد','Economy',x(e.eco)),
  L2('زبان‌ها','Languages',j(e.langs,', ')),L2('واحد پول','Currency',j(e.curr,', ')),L2('پیش‌شماره تلفن','Calling code',e.call||'—'),L2('دامنهٔ اینترنتی','Internet domain',e.tld||'—'),L2('عنوان شهروندان','Demonym',e.demo||'—'),L2('منطقهٔ زمانی (پایتخت)','Timezone (capital)',j(e.tz,', ')),
  r4('کشورهای همسایه','Neighbours',nb.map(b=>b.fa).join('، ')||'—',nb.map(b=>b.en).join(', ')||'—'),r4('تعداد استان‌ها / بخش‌ها','Administrative divisions',nf(e.n,'fa'),nf(e.n,'en')),L2('کدهای ISO','ISO codes',e.a2+' / '+e.a3)]}
 if(e.k==='prov'){const c=byA3[e.a3],z=IR[e.code],r=[],pp=!z&&(window.POP||{})[e.code];if(pp)r.push(r4('جمعیت (ویکی‌داده)','Population (Wikidata)',nf(pp,'fa'),nf(pp,'en')),r4('تراکم جمعیت','Population density',nf(pp/e.area,'fa')+' نفر در کیلومتر مربع',nf(pp/e.area,'en')+' per km²'));if(z)r.push(r4('مرکز استان','Capital',z.cf,z.ce),r4('جمعیت (سرشماری ۱۳۹۵)','Population (2016 census)',nf(z.pop,'fa'),nf(z.pop,'en')),r4('تراکم جمعیت','Population density',nf(z.pop/e.area,'fa')+' نفر در کیلومتر مربع',nf(z.pop/e.area,'en')+' per km²'));
  return r.concat([L2('نوع','Type',e.type||'—'),r4('کشور','Country',c.fa,c.en),r4('مساحت (تقریبی)','Area (approx.)',nf(e.area,'fa')+' کیلومتر مربع',nf(e.area,'en')+' km²'),r4('سهم از مساحت کشور','Share of country area',nf(e.area/c.area*100,'fa',1)+'٪',nf(e.area/c.area*100,'en',1)+'%'),L2('کد ISO 3166-2','ISO 3166-2',e.code||'—')])}
 if(e.k==='riv')return e.nfa?note:[r4('طول تقریبی','Approx. length',nf(e.len,'fa')+' کیلومتر',nf(e.len,'en')+' km')];
 if(e.k==='lake')return note.length?note:[r4('نوع','Type','دریاچه','Lake')];
 if(e.k==='pk')return[r4('ارتفاع','Elevation',nf(e.m,'fa')+' متر',nf(e.m,'en')+' m')].concat(ll);
 if(e.k==='city')return[r4('جمعیت','Population',nf(e.pop,'fa'),nf(e.pop,'en')),r4('پایتخت؟','Capital?',e.cap?'بله':'خیر',e.cap?'Yes':'No')].concat(e.tz?[L2('منطقهٔ زمانی','Timezone',e.tz)]:[],ll);
 const cl=CLS[e.cl]||TX[e.k],a=e.ar||e.area;
 return[r4('نوع','Type',cl[0],cl[1])].concat(e.pf?[r4('استان','Province',e.pf,e.pe)]:[],a?[r4('مساحت (تقریبی)','Area (approx.)',nf(a,'fa')+' کیلومتر مربع',nf(a,'en')+' km²')]:[],ll,note)}
const wk=(sec,l,q)=>{if(!/^https?:/.test(location.protocol))return;fetch(`https://${l}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=extracts&exintro=1&explaintext=1&exsentences=3&format=json&origin=*`).then(r=>r.json()).then(j=>{const p=Object.values(j.query.pages)[0];if(p&&p.extract){const d=document.createElement('p');d.className='wk';d.textContent=p.extract;sec.querySelector('dl').after(d)}}).catch(()=>{})};
function open(e){const R=rows(e),c=e.a3?byA3[e.a3]:null,q=e.en,flag=e.k==='c'?e.flag+' ':'';
 const col=(l,i,d)=>`<section lang="${l}" dir="${d}"><h2>${flag}${i?e.en:(e.fa||e.en)}</h2><span class="badge">${TX[e.k][i]}</span><dl>${R.map(r=>`<dt>${r[i]}</dt><dd>${r[i+2]}</dd>`).join('')}</dl><a target="_blank" rel="noopener" href="https://${l}.wikipedia.org/w/index.php?search=${encodeURIComponent(i?q:(e.fa||q))}">${i?'Read more on Wikipedia ↗':'مطالعهٔ بیشتر در ویکی‌پدیا ↗'}</a></section>`;
 $('mb').innerHTML=`<div class="cols">${col('fa',0,'rtl')}${col('en',1,'ltr')}</div><p class="src">${e.k==='prov'&&IR[e.code]?'منبع جمعیت ایران / Iran population: Statistical Centre of Iran, 2016 census (entered manually — verify). ':''}Natural Earth · mledoze/countries · Wikipedia (CC BY-SA)</p>`;$('modal').hidden=false;
 const ctx=e.k==='prov'||e.k==='city'?' '+(c?c.en:cur?cur.en:''):'';document.querySelectorAll('#mb section').forEach((s,i)=>wk(s,i?'en':'fa',i?q+ctx+(e.k==='prov'?' '+(e.type||''):''):(e.fa||q)+(ctx?' '+(cur?cur.fa:''):'')))}
const close=()=>$('modal').hidden=true;$('x').onclick=close;$('modal').onclick=v=>{if(v.target.id==='modal')close()};addEventListener('keydown',v=>v.key==='Escape'&&close());

/* ---------- compare ---------- */
function compare(){const L=ui;$('mb').innerHTML=`<h2>${L==='fa'?'مقایسهٔ دو کشور':'Compare two countries'}</h2><div class="cmpin"><input id="ca" list="cl" placeholder="${L==='fa'?'کشور اول':'First country'}"><input id="cb" list="cl" placeholder="${L==='fa'?'کشور دوم':'Second country'}"></div><div id="cmpout"></div>`;$('modal').hidden=false;
 const find=v=>{v=v.trim().toLowerCase();return C.find(c=>`${c.fa} — ${c.en}`.toLowerCase()===v||c.en.toLowerCase()===v||c.fa===v)};
 const draw=()=>{const a=find($('ca').value),b=find($('cb').value);if(!a||!b)return;const n=(x,d=0)=>nf(x,L,d),g=c=>c.pop?c.gdp*1e6/c.pop:0;
  const rs=[['جمعیت','Population',c=>n(c.pop)],['مساحت (km²)','Area (km²)',c=>n(c.area)],['تراکم (نفر/km²)','Density (per km²)',c=>n(c.pop/c.area)],['GDP (میلیون دلار)','GDP (USD million)',c=>n(c.gdp)],['سرانهٔ GDP (دلار)','GDP per capita (USD)',c=>n(g(c))],['پایتخت','Capital',c=>c.caps.join(', ')||'—'],['زبان‌ها','Languages',c=>c.langs.join(', ')||'—'],['واحد پول','Currency',c=>c.curr.join(', ')||'—'],['قاره','Continent',c=>L==='fa'?(CONT[c.cont]||c.cont):c.cont],['تعداد همسایه‌ها','Neighbours',c=>n(c.borders.length)],['تعداد استان‌ها','Divisions',c=>n(c.n)]];
  $('cmpout').innerHTML=`<table class="cmp"><tr><th></th><th>${a.flag} ${L==='fa'?a.fa:a.en}</th><th>${b.flag} ${L==='fa'?b.fa:b.en}</th></tr>${rs.map(r=>`<tr><td>${r[L==='fa'?0:1]}</td><td>${r[2](a)}</td><td>${r[2](b)}</td></tr>`).join('')}</table>`};
 $('ca').onchange=$('cb').onchange=draw}

/* ---------- search, UI, hash ---------- */
$('cl').innerHTML=C.slice().sort((a,b)=>a.en.localeCompare(b.en)).map(c=>`<option value="${c.fa} — ${c.en}">`).join('');
const SI=[...C.map(c=>({t:'c',en:c.en,fa:c.fa,a3:c.a3})),...W.s.filter(s=>byA3[s[3]]).map(([t,en,fa,a3,lo,la])=>({t,en,fa:fa||en,a3,lo,la}))];
const nz=s=>(s||'').toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک'),ICON={c:'🏳️',p:'🗺️',t:'🏙️',k:'⛰️'};
$('q').addEventListener('input',e=>{const q=nz(e.target.value.trim()),box=$('sr');if(q.length<2){box.hidden=true;return}
 const m=SI.filter(x=>nz(x.en).includes(q)||nz(x.fa).includes(q)).sort((a,b)=>(nz(a.en).startsWith(q)||nz(a.fa).startsWith(q)?0:1)-(nz(b.en).startsWith(q)||nz(b.fa).startsWith(q)?0:1)||(a.t==='c'?0:1)-(b.t==='c'?0:1)).slice(0,12);
 box.innerHTML=m.map((x,i)=>`<li data-i="${i}">${ICON[x.t]} <b>${ui==='fa'?x.fa:x.en}</b> <small>${ui==='fa'?x.en:x.fa}${x.t!=='c'?' · '+(ui==='fa'?byA3[x.a3].fa:byA3[x.a3].en):''}</small></li>`).join('');box.hidden=!m.length;box._m=m});
$('sr').addEventListener('click',e=>{const li=e.target.closest('li');if(!li)return;const x=$('sr')._m[+li.dataset.i];$('sr').hidden=true;$('q').value='';go(x.a3,x.t==='c'?null:x)});
$('q').addEventListener('keydown',e=>{if(e.key==='Enter'){const x=($('sr')._m||[])[0];if(x){$('sr').hidden=true;$('q').value='';go(x.a3,x.t==='c'?null:x)}}});
document.addEventListener('click',e=>{if(!e.target.closest('.tools'))$('sr').hidden=true});
function applyUI(){document.documentElement.lang=ui;document.documentElement.dir=ui==='fa'?'rtl':'ltr';document.querySelectorAll('[data-fa]').forEach(n=>n.textContent=n.dataset[ui]);$('q').placeholder=ui==='fa'?'جست‌وجوی کشور، استان، شهر، قله…':'Search country, province, city, peak…';relabel();fit()}
$('bk').onclick=()=>back();$('ci').onclick=()=>cur&&open(cur);$('cmp').onclick=compare;
$('zi').onclick=()=>$('cv').hidden?zoomG(.8):zoomC(1/1.5);$('zo').onclick=()=>$('cv').hidden?zoomG(1.25):zoomC(1.5);
$('lb').onclick=()=>{ui=ui==='fa'?'en':'fa';applyUI()};
addEventListener('hashchange',()=>{const h=location.hash.slice(1).toUpperCase();if(h&&byA3[h]&&(!cur||cur.a3!==h))go(h);else if(!h&&cur)back()});
relabel();applyUI();
{const h=location.hash.slice(1).toUpperCase();if(h&&byA3[h])setTimeout(()=>go(h),300)}
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)&&document.querySelector('link[rel=manifest]'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
