// ── current year ──
document.getElementById("year").textContent = new Date().getFullYear();

// ── typing effect ──
(function typed() {
  const el = document.getElementById("typed");
  if (!el) return;
  const lines = [
    "AI student 🎓",
    "vibe coder ⚡",
    "night owl 🌙",
    "anime enjoyer 📷",
  ];
  let li = 0, ci = 0, deleting = false;

  function tick() {
    const word = lines[li];
    el.textContent = word.slice(0, ci);

    if (!deleting && ci < word.length) {
      ci++;
    } else if (deleting && ci > 0) {
      ci--;
    } else if (!deleting && ci === word.length) {
      deleting = true;
      return setTimeout(tick, 1400);
    } else {
      deleting = false;
      li = (li + 1) % lines.length;
    }
    setTimeout(tick, deleting ? 45 : 95);
  }
  tick();
})();

// ── reveal sections on scroll ──
(function reveal() {
  const sections = document.querySelectorAll(".section");
  if (!("IntersectionObserver" in window)) {
    sections.forEach((s) => s.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  sections.forEach((s) => obs.observe(s));
})();

// ── animated starfield ──
(function starfield() {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, stars;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(160, Math.floor((w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random(),
      tw: Math.random() * 0.02 + 0.004,
      vy: Math.random() * 0.12 + 0.02,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.a += s.tw;
      const alpha = 0.4 + Math.abs(Math.sin(s.a)) * 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196, 181, 253, ${alpha})`;
      ctx.fill();
      if (!reduce) {
        s.y += s.vy;
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
})();
