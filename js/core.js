"use strict";
const $=(s,r=document)=>[...r.querySelectorAll(s)];
const h=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const parse=t=>t.split(/^---\s*$/m).map(b=>{const o={};b.split(/\r?\n/).forEach(l=>{l=l.trim();if(!l||l[0]==="#")return;const i=l.indexOf(":");if(i>0)o[l.slice(0,i).trim().toLowerCase()]=l.slice(i+1).trim()});return o}).filter(o=>Object.keys(o).length);
const load=async n=>{try{const r=await fetch("data/"+n+".txt",{cache:"no-cache"});return r.ok?parse(await r.text()):[]}catch(e){return[]}};
const safeUrl=v=>{v=(v||"").trim();if(/^[^\s:@]+@[^\s:@]+$/.test(v))return"mailto:"+v;return/^(https:|http:|mailto:|#|[\w\-./]+\.html$)/i.test(v)?v:"#"};
const safeFile=f=>/^[\w][\w .\-()]*\.(png|jpe?g|svg|webp)$/i.test(f||"");
const safeName=n=>/^[\w-]+$/.test(n||"");
const color=c=>/^#[0-9a-f]{3,8}$/i.test(c||"")?c:"#333";
function applySite(s){
  $("[data-site]").forEach(e=>{if(s[e.dataset.site])e.textContent=s[e.dataset.site]});
  $("[data-href]").forEach(e=>{const u=safeUrl(s[e.dataset.href]);e.href=u;if(/^https?:/i.test(u)){e.target="_blank";e.rel="noopener noreferrer"}});
}
function optImg(i){const f=()=>i.remove();i.addEventListener("error",f);if(i.complete&&!i.naturalWidth)f()}
