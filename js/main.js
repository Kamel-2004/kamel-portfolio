const $ = s => [...document.querySelectorAll(s)];
const works = window.WORKS || [];
document.getElementById("pieces").innerHTML = works.map(w => `<article class="piece">
<div class="cover" style="--c:${w.color}" data-l="${w.letter}"><b>${w.title}</b><small>${w.type}</small><img src="${w.image}" alt="${w.title}" loading="lazy" onerror="this.remove()"></div>
<div class="caption"><h3>${w.title}</h3><p>${w.type}</p></div></article>`).join("");
const tick = document.getElementById("tick");
tick.innerHTML = Array(2).fill(tick.dataset.words.split(",").map(s => `<span>${s}</span>`).join("")).join("");

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const covers = $(".cover"), counter = document.getElementById("counter"), work = document.getElementById("work");
function frame() {
  const vh = innerHeight; let cur = 1, best = 1e9;
  covers.forEach((c, i) => {
    const r = c.getBoundingClientRect(), p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh * .6)));
    if (!reduce) c.style.transform = `rotateY(${p * -38}deg) translateY(${p * 40}px) scale(${1 - Math.abs(p) * .08})`;
    c.style.opacity = 1 - Math.abs(p) * .45;
    const d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < best) { best = d; cur = i + 1; }
  });
  const wr = work.getBoundingClientRect();
  counter.classList.toggle("on", wr.top < vh * .5 && wr.bottom > vh * .5);
  counter.textContent = cur + " / " + covers.length;
}
addEventListener("scroll", frame, { passive: true }); addEventListener("resize", frame); frame();

$("[data-share]").forEach(b => b.addEventListener("click", async () => {
  const t = b.textContent, url = location.href.split("#")[0];
  try { await navigator.clipboard.writeText(url); } catch (e) { const x = document.createElement("input"); x.value = url; document.body.append(x); x.select(); document.execCommand("copy"); x.remove(); }
  b.textContent = "Link copied"; setTimeout(() => b.textContent = t, 1800);
}));
