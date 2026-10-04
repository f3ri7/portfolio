// ── current year ──
document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── theme toggle (follows the system until the visitor picks one) ──
(function theme() {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  const systemLight = window.matchMedia("(prefers-color-scheme: light)");
  const current = () => root.dataset.theme || (systemLight.matches ? "light" : "dark");

  function sync() {
    const t = current();
    btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    document.querySelector('meta[name="theme-color"]').content = t === "dark" ? "#0e0e11" : "#f8f4ec";
    document.dispatchEvent(new CustomEvent("themechange"));
  }

  btn.addEventListener("click", () => {
    root.dataset.theme = current() === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    sync();
  });
  systemLight.addEventListener("change", sync);
  sync();
})();

// ── hero scene: keep the sun on screen on narrow viewports ──
(function heroScene() {
  const scene = document.querySelector(".hero-scene");
  const phone = window.matchMedia("(max-width: 640px)");
  const apply = () => scene.setAttribute("preserveAspectRatio", phone.matches ? "xMaxYMax slice" : "xMidYMax slice");
  phone.addEventListener("change", apply);
  apply();
})();

// ── typing effect ──
(function typed() {
  const el = document.getElementById("typed");
  if (!el || reduceMotion) return;
  const lines = ["CS student", "data science & AI", "vibe coder", "photographer", "night owl"];
  let li = 0, ci = lines[0].length, deleting = true;

  function tick() {
    const word = lines[li];
    el.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) ci++;
    else if (deleting && ci > 0) ci--;
    else if (!deleting) { deleting = true; return setTimeout(tick, 1600); }
    else { deleting = false; li = (li + 1) % lines.length; }
    setTimeout(tick, deleting ? 40 : 90);
  }
  setTimeout(tick, 1800);
})();

// ── reveal sections on scroll ──
(function reveal() {
  const sections = document.querySelectorAll(".section");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    sections.forEach((s) => s.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  sections.forEach((s) => obs.observe(s));
})();

// ── falling sakura petals ──
(function petals() {
  const canvas = document.getElementById("petals");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h, list, rgb;

  const readColor = () => {
    rgb = getComputedStyle(document.documentElement).getPropertyValue("--petal").trim() || "244, 114, 182";
  };

  function spawn(randomY) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      size: 5 + Math.random() * 6,
      vy: 0.35 + Math.random() * 0.7,
      vx: -0.2 - Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.008 + Math.random() * 0.014,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.04,
      flip: Math.random() * Math.PI * 2,
      alpha: 0.45 + Math.random() * 0.45,
    };
  }

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(46, (w * h) / 32000));
    list = Array.from({ length: count }, () => spawn(true));
  }

  // notched sakura petal, centred on 0,0
  function drawPetal(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.8);
    ctx.lineTo(s * 0.18, -s);
    ctx.bezierCurveTo(s * 0.7, -s * 0.95, s * 0.9, -s * 0.2, 0, s);
    ctx.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.7, -s * 0.95, -s * 0.18, -s);
    ctx.closePath();
    ctx.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of list) {
      p.sway += p.swaySpeed;
      p.flip += 0.03;
      p.rot += p.vrot;
      p.x += p.vx + Math.sin(p.sway) * 0.6;
      p.y += p.vy;
      if (p.y > h + 20 || p.x < -30) Object.assign(p, spawn(false), { x: Math.random() * (w + 200) });

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.cos(p.flip) * 0.6 + 0.4, 1); // 3D-ish flutter
      ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
      drawPetal(p.size);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }

  readColor();
  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("themechange", readColor);
  requestAnimationFrame(frame);
})();

// ── live repositories from GitHub ──
(function repos() {
  const grid = document.getElementById("repo-grid");
  if (!grid) return;
  const langColors = { HTML: "#e34c26", CSS: "#663399", JavaScript: "#f1e05a", Python: "#3572A5", TypeScript: "#3178c6" };
  // used when a repo has no description on GitHub
  const fallbackDesc = { f3ri7: "My GitHub profile README — ink & sakura theme with hand-made animated SVGs." };
  const extIcon = grid.querySelector(".repo-name svg")?.outerHTML || "";
  const starIcon = document.querySelector("#follow .btn svg")?.outerHTML || "";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  fetch("https://api.github.com/users/f3ri7/repos?sort=updated&per_page=12")
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => {
      const list = data.filter((r) => !r.fork);
      if (!list.length) return; // keep the static fallback
      grid.innerHTML = list.map((r) => `
        <a class="card repo" href="${esc(r.html_url)}" target="_blank" rel="noopener">
          <h3 class="repo-name">${esc(r.name)} ${extIcon}</h3>
          <p class="repo-desc">${esc(r.description || fallbackDesc[r.name] || "No description yet.")}</p>
          <p class="repo-meta">
            ${r.language ? `<span><span class="lang-dot" style="--lang:${langColors[r.language] || "var(--text-3)"}"></span>${esc(r.language)}</span>` : ""}
            <span>${starIcon}${r.stargazers_count}</span>
          </p>
        </a>`).join("");
    })
    .catch(() => { /* offline or rate-limited: the static cards stay */ });
})();
