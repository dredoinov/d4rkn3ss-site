/* =========================================================
   cursor.js — Мягкая светящаяся точка вместо курсора
   ========================================================= */

const FOLLOW_EASING = 0.25;
const INTERACTIVE_SELECTOR =
  'a, button, .magnetic, input, textarea, [role="button"], .copy-btn';

export function initCursor() {
  const dot = document.getElementById('cursor-dot');
  if (!dot) return;

  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;

  window.addEventListener(
    'mousemove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (reduced) {
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
    },
    { passive: true }
  );

  function loop() {
    dotX += (mouseX - dotX) * FOLLOW_EASING;
    dotY += (mouseY - dotY) * FOLLOW_EASING;
    dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
    requestAnimationFrame(loop);
  }

  if (!reduced) {
    requestAnimationFrame(loop);
  } else {
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  }

  document.addEventListener(
    'mouseover',
    (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        dot.classList.add('hovered');
      }
    },
    true
  );

  document.addEventListener(
    'mouseout',
    (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        dot.classList.remove('hovered');
      }
    },
    true
  );

  window.addEventListener('mousedown', () => dot.classList.add('pressed'));
  window.addEventListener('mouseup', () => dot.classList.remove('pressed'));

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '';
  });

  window.addEventListener('blur', () => {
    dot.style.opacity = '0';
  });
  window.addEventListener('focus', () => {
    dot.style.opacity = '';
  });
}