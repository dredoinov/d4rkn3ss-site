/* =========================================================
   snow.js — Снежинки на canvas (лёгкие, GPU-friendly)
   ========================================================= */

const FLAKE_COUNT_DESKTOP = 90;
const FLAKE_COUNT_MOBILE = 40;

export function initSnow() {
  const canvas = document.getElementById('snow-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let flakes = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createFlakes() {
    const count = width < 768 ? FLAKE_COUNT_MOBILE : FLAKE_COUNT_DESKTOP;
    flakes = [];
    for (let i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.6,
        vy: Math.random() * 0.6 + 0.25,
        vx: (Math.random() - 0.5) * 0.4,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.008,
        alpha: Math.random() * 0.6 + 0.25,
      });
    }
  }

  function getSnowColor() {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue('--snow-color').trim() || 'rgba(255,255,255,0.8)';
  }

  let color = getSnowColor();

  // Обновляем цвет снежинок при смене темы
  const observer = new MutationObserver(() => {
    color = getSnowColor();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.sway += f.swaySpeed;
      f.x += f.vx + Math.sin(f.sway) * 0.4;
      f.y += f.vy;

      if (f.y > height + 5) {
        f.y = -5;
        f.x = Math.random() * width;
      }
      if (f.x > width + 5) f.x = -5;
      if (f.x < -5) f.x = width + 5;

      ctx.globalAlpha = f.alpha;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  resize();
  createFlakes();
  draw();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      createFlakes();
    }, 200);
  });
}