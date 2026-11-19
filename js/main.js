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
  const txt=await fetch("data/logos.txt",{cache:"no-cache"}).then(r=>r.ok?r.text():"").catch(()=>"");
  const files=txt.split(/\r?\n/).map(s=>s.trim()).filter(safeFile);
  const brands=(await Promise.all(files.map(fn=>new Promise(r=>{const i=new Image();i.onload=()=>r(fn);i.onerror=()=>r(null);i.src="photos/logos/"+fn})))).filter(Boolean);
  if(brands.length)new Marquee($("#logos")[0],(i,c)=>{const im=new Image();im.src="photos/logos/"+brands[i];im.className="logo";im.alt=c?"":brands[i].replace(/\.\w+$/,"");if(c)im.setAttribute("aria-hidden","true");return im},brands.length,{speed:35}).run();
  else $("#brands")[0].hidden=true;

  /* NUMBERS (auto: brands uses the logo count) */
  const grid=$("#numbers .grid")[0];
  (await load("numbers")).forEach(n=>{const v=n.auto==="brands"?String(brands.length):n.value;if(!v||v==="0")return;const d=h("div","num");d.append(h("b",0,v),h("span",0,n.label||""));grid.append(d)});
  if(!grid.children.length)$("#numbers")[0].hidden=true;

  /* WORK: horizontal rail */
  const rail=$("#rail")[0];
  (await load("work")).forEach(w=>{
    const ph=()=>{const p=h("div","ph",(w.title||"?")[0]);p.style.setProperty("--c",color(w.color));return p};
    const fg=h("figure","card"),art=h("div","art");
    if(safeFile(w.image)){const im=new Image();im.alt=w.title||"";im.loading="lazy";im.addEventListener("error",()=>im.replaceWith(ph()));im.src="photos/work/"+w.image;art.append(im)}else art.append(ph());
    const cap=h("figcaption");cap.append(h("b",0,w.title||""),h("span",0,w.type||""));fg.append(art,cap);rail.append(fg)});
  const step=d=>rail.scrollBy({left:d*rail.clientWidth*.8,behavior:"smooth"});
  $("#prev")[0].onclick=()=>step(-1);$("#next")[0].onclick=()=>step(1);

  /* SERVICES, REASONS */
  (await load("services")).forEach(s=>{const d=h("div","cell"),ic=h("div","ic");
    if(safeName(s.icon)){const im=new Image();im.alt="";im.addEventListener("error",()=>im.remove());im.src="icons/"+s.icon+".svg";ic.append(im)}
    d.append(ic,h("h3",0,s.title),h("p",0,s.text));$("#svc")[0].append(d)});
  (await load("reasons")).forEach(r=>{const d=h("div","reason");d.append(h("h3",0,r.title),h("p",0,r.text));$("#reasons")[0].append(d)});

  /* OFFERS: seasonal by date (from / until, YYYY-MM-DD) */
  const today=new Date().toISOString().slice(0,10);
  const offers=(await load("offers")).filter(o=>(!o.from||o.from<=today)&&(!o.until||o.until>=today));
  offers.forEach((o,i)=>{const d=h("article","offer");d.append(h("small",0,"Offer "+String(i+1).padStart(2,"0")),h("h3",0,o.title),h("p",0,o.text));if(o.note)d.append(h("em",0,o.note));$("#offerlist")[0].append(d)});
  if(!offers.length)$("#offers")[0].hidden=true;
  const bo=offers.find(o=>/^y/i.test(o.banner||""));
  if(bo){$("#bannerText")[0].textContent=bo.banner_text||bo.title;$("#banner")[0].hidden=false;document.body.classList.add("has-banner")}

  /* SKILLS: two rows moving in opposite directions */
  const sk=await load("skills");
  const chip=(s,c)=>{const e=h("span","chip"),b=h("i","bd",(s.name||"?").slice(0,2));e.append(b);
    if(safeName(s.icon)){const im=new Image();im.alt="";im.addEventListener("load",()=>b.replaceWith(im));im.src="icons/"+s.icon+".svg"}
    e.append(h("span",0,s.name));if(c)e.setAttribute("aria-hidden","true");return e};
  [[sk.filter((_,i)=>i%2===0),"#sk1",false],[sk.filter((_,i)=>i%2===1),"#sk2",true]].forEach(([r,q,rev])=>{if(r.length)new Marquee($(q)[0],(i,c)=>chip(r[i],c),r.length,{speed:30,reverse:rev}).run();else $(q)[0].hidden=true});
})();
