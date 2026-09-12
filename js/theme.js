/* =========================================================
   theme.js — Переключение тёмной / светлой темы
   ========================================================= */

const STORAGE_KEY = 'theme';
const DARK = 'dark';
const LIGHT = 'light';

/** Безопасное чтение localStorage (приватный режим Safari и т.п.) */
function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

/** Безопасная запись localStorage */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    /* Молча игнорируем — тема просто не сохранится */
  }
}

/** Определяем стартовую тему: сохранённая → системная → тёмная */
function getInitialTheme() {
  const saved = safeGet(STORAGE_KEY);
  if (saved === DARK || saved === LIGHT) return saved;

  const prefersLight =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches;

  return prefersLight ? LIGHT : DARK;
}

/** Применяем тему к <html> */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  safeSet(STORAGE_KEY, theme);
}

/** Инициализация переключателя */
export function initTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getInitialTheme();
  applyTheme(current);

  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const now = document.documentElement.getAttribute('data-theme');
    const next = now === DARK ? LIGHT : DARK;
    applyTheme(next);
  });

  // Реагируем на смену системной темы, если пользователь не выбирал вручную
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', (e) => {
      if (safeGet(STORAGE_KEY)) return; // ручной выбор приоритетнее
      applyTheme(e.matches ? LIGHT : DARK);
    });
  }
}