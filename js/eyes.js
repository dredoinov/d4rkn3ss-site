/* =========================================================
   eyes.js — «Живые глаза», следящие за курсором
   ========================================================= */

const EYE_COUNT = 3;
const MAX_PUPIL_OFFSET = 10;

export function initEyes() {
  const layer = document.getElementById('eyes-layer');
  if (!layer) return;

  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const eyes = [];
  const positions = [
    { top: '18%', left: '8%' },
    { top: '72%', left: '12%' },
    { top: '40%', left: '92%' },
  ];

  for (let i = 0; i < EYE_COUNT; i++) {
    const eye = document.createElement('div');
    eye.className = 'eye';
    const pos = positions[i] || { top: '50%', left: '50%' };
    eye.style.top = pos.top;
    eye.style.left = pos.left;

    const pupil = document.createElement('div');
    pupil.className = 'eye-pupil';
    eye.appendChild(pupil);

    layer.appendChild(eye);
    eyes.push({ el: eye, pupil });
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function loop() {
    eyes.forEach(({ el, pupil }) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.hypot(dx, dy) || 1;

      const offsetX = (dx / dist) * Math.min(dist / 8, MAX_PUPIL_OFFSET);
      const offsetY = (dy / dist) * Math.min(dist / 8, MAX_PUPIL_OFFSET);

      pupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}