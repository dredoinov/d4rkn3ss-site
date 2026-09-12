/* =========================================================
   copy.js — Копирование Discord-тега в буфер обмена
   ========================================================= */

const TOAST_DURATION = 2200;
const CLICK_LOCK_MS = 600;

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (err) {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, TOAST_DURATION);
}

async function copyText(text) {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

export function initCopy() {
  const buttons = document.querySelectorAll('.copy-btn');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    let locked = false;

    const label = btn.dataset.copyLabel || 'Текст';
    const value = btn.dataset.copy || '';

    btn.addEventListener('click', async () => {
      if (locked) return;
      locked = true;

      const ok = await copyText(value);

      if (ok) {
        showToast(`${label} скопирован в буфер обмена`);
      } else {
        showToast(`Не удалось скопировать. Вручную: ${value}`);
      }

      const hint = btn.querySelector('.copy-hint');
      if (hint) {
        const original = hint.dataset.original || hint.textContent;
        hint.dataset.original = original;
        hint.textContent = ok ? 'Скопировано ✓' : 'Ошибка';
        setTimeout(() => {
          hint.textContent = original;
        }, 1200);
      }

      setTimeout(() => {
        locked = false;
      }, CLICK_LOCK_MS);
    });
  });
}