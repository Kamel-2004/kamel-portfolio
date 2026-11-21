"use strict";
/* Marquee: endless sliding row, used for logos and skills. make(i, isClone) returns one item. */
class Marquee{
  constructor(el,make,n,o={}){this.el=el;this.make=make;this.n=n;this.speed=o.speed||40;this.rev=!!o.reverse}
  async run(){
    const t=h("div","track");this.el.replaceChildren(t);
    const fill=k=>{t.replaceChildren();for(let r=0;r<k*2;r++)for(let i=0;i<this.n;i++)t.append(this.make(i,r>=k))};
    fill(1);await Promise.all($("img",t).map(i=>i.decode().catch(()=>0)));
    const k=Math.max(1,Math.ceil(this.el.clientWidth/(t.scrollWidth/2)));if(k>1)fill(k);
    t.style.setProperty("--dur",(t.scrollWidth/2/this.speed)+"s");if(this.rev)t.classList.add("rev");
  }
}
(async()=>{
  const S=(await load("site"))[0]||{};applySite(S);
  const hd=$("header")[0],hero=$(".hero")[0];
  const f=()=>hd.classList.toggle("at-top",scrollY<hero.offsetHeight-hd.offsetHeight);f();addEventListener("scroll",f,{passive:true});addEventListener("resize",f);
  $(".portrait img").forEach(optImg);
  $("[data-share]").forEach(b=>b.addEventListener("click",async()=>{const t=b.textContent,u=location.href.split("#")[0];
    try{await navigator.clipboard.writeText(u)}catch(e){const x=document.createElement("input");x.value=u;document.body.append(x);x.select();document.execCommand("copy");x.remove()}
    b.textContent="Link copied";setTimeout(()=>b.textContent=t,1800)}));

  /* LOGOS: data/logos.txt lists the files in photos/logos (kept up to date by the GitHub Action) */
  const txt=(window.DATA||{}).logos||"";
  const files=txt.split(/\r?\n/).map(s=>s.trim()).filter(safeFile);
  const brands=(await Promise.all(files.map(fn=>new Promise(r=>{const i=new Image();i.onload=()=>r(fn);i.onerror=()=>r(null);i.src="photos/logos/"+fn})))).filter(Boolean);
  if(brands.length)new Marquee($("#logos")[0],(i,c)=>{const im=new Image();im.src="photos/logos/"+brands[i];im.className="brand";im.alt=c?"":brands[i].replace(/\.\w+$/,"");if(c)im.setAttribute("aria-hidden","true");return im},brands.length,{speed:35}).run();
  else $("#brands")[0].hidden=true;

  /* NUMBERS: count up from zero when scrolled into view (always runs, no toggle) */
  const grid=$("#numbers .grid")[0],items=[];
  (await load("numbers")).forEach(n=>{const v=n.auto==="brands"?String(brands.length):n.value;if(!v||v==="0")return;
    const m=/^(\D*)(\d[\d,.]*)(.*)$/.exec(v),d=h("div","num"),bb=h("b",0,m?m[1]+"0"+m[3]:v);
    d.append(bb,h("span",0,n.label||""));grid.append(d);if(m)items.push([d,bb,m[1],parseFloat(m[2].replace(/,/g,"")),m[3]])});
  if(!grid.children.length)$("#numbers")[0].hidden=true;
  const count=([,b,pre,to,suf])=>{const t0=performance.now(),dur=1400;const tick=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);b.textContent=pre+Math.round(to*e).toLocaleString("en-US")+suf;if(k<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)};
  const nio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const it=items.find(x=>x[0]===e.target);if(it)count(it);nio.unobserve(e.target)}}),{threshold:.6});
  items.forEach(it=>nio.observe(it[0]));

  /* WORK: centre image large, neighbours smaller and faded */
  const rail=$("#rail")[0],cards=[];let cur=0;
  (await load("work")).forEach(w=>{
    const ph=()=>{const p=h("div","ph",(w.title||"?")[0]);p.style.setProperty("--c",color(w.color));return p};
    const fg=h("figure","card"),art=h("div","art");
    if(safeFile(w.image)){const im=new Image();im.alt=w.title||"";im.decoding="async";im.addEventListener("error",()=>im.replaceWith(ph()));im.src="photos/work/"+w.image;art.append(im)}else art.append(ph());
    const cap=h("figcaption");cap.append(h("b",0,w.title||""),h("span",0,w.type||""));fg.append(art,cap);rail.append(fg);cards.push(fg)});
  const to=i=>{i=Math.max(0,Math.min(cards.length-1,i));const el=cards[i];rail.scrollTo({left:el.offsetLeft+el.offsetWidth/2-rail.clientWidth/2,behavior:"smooth"})};
  const pad=()=>{if(!cards.length)return;rail.style.paddingLeft=Math.max(0,(rail.clientWidth-cards[0].offsetWidth)/2)+"px";rail.style.paddingRight=Math.max(0,(rail.clientWidth-cards[cards.length-1].offsetWidth)/2)+"px"};
  const fx=()=>{const c=rail.scrollLeft+rail.clientWidth/2;let bd=1e9;cards.forEach((el,i)=>{const d=Math.abs(el.offsetLeft+el.offsetWidth/2-c),k=Math.min(1,d/(rail.clientWidth*.45));
    el.style.transform="scale("+(1-k*.32)+")";el.style.opacity=1-k*.7;el.style.zIndex=100-Math.round(k*50);if(d<bd){bd=d;cur=i}})};
  const ro=new ResizeObserver(()=>{pad();fx()});ro.observe(rail);cards.forEach(c=>ro.observe(c));
  rail.addEventListener("scroll",fx,{passive:true});
  cards.forEach((el,i)=>el.addEventListener("click",()=>{if(i!==cur)to(i)}));
  $("#prev")[0].onclick=()=>to(cur-1);$("#next")[0].onclick=()=>to(cur+1);
  rail.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();to(cur+1)}if(e.key==="ArrowLeft"){e.preventDefault();to(cur-1)}});

  /* SERVICES, REASONS */
  (await load("services")).forEach(s=>{const d=h("div","cell"),ic=h("div","ic");
    if(safeName(s.icon)){const im=new Image();im.alt="";im.addEventListener("error",()=>im.remove());im.src="icons/"+s.icon+".svg";ic.append(im)}
    d.append(ic,h("h3",0,s.title),h("p",0,s.text));$("#svc")[0].append(d)});
  (await load("reasons")).forEach(r=>{const d=h("div","reason");d.append(h("h3",0,r.title),h("p",0,r.text));$("#reasons")[0].append(d)});

  /* OFFERS: seasonal by date (from / until, YYYY-MM-DD) */
  const today=new Date().toISOString().slice(0,10);
  const offers=(await load("offers")).filter(o=>(!o.from||o.from<=today)&&(!o.until||o.until>=today));
  offers.forEach((o,i)=>{const d=h("article","offer");d.append(h("h3",0,o.title),h("p",0,o.text));if(o.note)d.append(h("em",0,o.note));$("#offerlist")[0].append(d)});
  if(!offers.length)$("#offers")[0].hidden=true;
  const bo=offers.find(o=>/^y/i.test(o.banner||""));
  if(bo){const pl=$("#pill")[0];pl.textContent=bo.banner_text||bo.title;pl.hidden=false}

  /* SKILLS: two rows moving in opposite directions */
  const sk=await load("skills");
  const chip=(s,c)=>{const e=h("span","chip"),b=h("i","bd",(s.name||"?").slice(0,2));e.append(b);
    if(safeName(s.icon)){const im=new Image();im.alt="";im.addEventListener("load",()=>b.replaceWith(im));im.src="icons/"+s.icon+".svg"}
    e.append(h("span",0,s.name));if(c)e.setAttribute("aria-hidden","true");return e};
  [[sk.filter((_,i)=>i%2===0),"#sk1",false],[sk.filter((_,i)=>i%2===1),"#sk2",true]].forEach(([r,q,rev])=>{if(r.length)new Marquee($(q)[0],(i,c)=>chip(r[i],c),r.length,{speed:30,reverse:rev}).run();else $(q)[0].hidden=true});
})();
