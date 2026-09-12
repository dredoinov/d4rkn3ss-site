/* =========================================================
   text-anim.js — Эффект печатной машинки с несколькими фразами
   ========================================================= */

const TYPE_SPEED = 70;
const ERASE_SPEED = 40;
const HOLD_TIME = 1600;

export function initTextAnim() {
  const el = document.querySelector('.typed');
  if (!el) return;

  let words = [];
  try {
    words = JSON.parse(el.dataset.words || '[]');
  } catch (err) {
    words = [];
  }
  if (!Array.isArray(words) || words.length === 0) return;

  // Если пользователь предпочитает меньше движения — показываем первую фразу статично
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let erasing = false;

  function tick() {
    const current = words[wordIndex];

    if (!erasing) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        erasing = true;
        setTimeout(tick, HOLD_TIME);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        erasing = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, TYPE_SPEED);
        return;
      }
      setTimeout(tick, ERASE_SPEED);
    }
  }

  tick();
}