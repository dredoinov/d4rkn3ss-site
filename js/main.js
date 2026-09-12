/* =========================================================
   main.js — Единый файл без ES-модулей (работает через file://)
   ========================================================= */

(function () {
  'use strict';

  /* =======================================================
     THEME — переключение тёмной / светлой темы
     ======================================================= */
  var STORAGE_KEY = 'theme';
  var DARK = 'dark';
  var LIGHT = 'light';

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function getInitialTheme() {
    var saved = safeGet(STORAGE_KEY);
    if (saved === DARK || saved === LIGHT) return saved;
    var prefersLight = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? LIGHT : DARK;
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    safeSet(STORAGE_KEY, theme);
  }
  function initTheme() {
    var current = document.documentElement.getAttribute('data-theme') || getInitialTheme();
    applyTheme(current);

    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var now = document.documentElement.getAttribute('data-theme');
      applyTheme(now === DARK ? LIGHT : DARK);
    });

    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      mq.addEventListener('change', function (e) {
        if (safeGet(STORAGE_KEY)) return;
        applyTheme(e.matches ? LIGHT : DARK);
      });
    }
  }

  /* =======================================================
     CURSOR — мягкая светящаяся точка
     ======================================================= */
  function initCursor() {
    var dot = document.getElementById('cursor-dot');
    if (!dot) return;

    var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (isTouch) {
      dot.style.display = 'none';
      return;
    }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var FOLLOW_EASING = 0.25;
    var INTERACTIVE_SELECTOR =
      'a, button, .magnetic, input, textarea, [role="button"], .copy-btn';

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var dotX = mouseX;
    var dotY = mouseY;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (reduced) {
        dot.style.transform = 'translate(' + mouseX + 'px, ' + mouseY + 'px)';
      }
    }, { passive: true });

    function loop() {
      dotX += (mouseX - dotX) * FOLLOW_EASING;
      dotY += (mouseY - dotY) * FOLLOW_EASING;
      dot.style.transform = 'translate(' + dotX + 'px, ' + dotY + 'px)';
      requestAnimationFrame(loop);
    }

    if (!reduced) {
      requestAnimationFrame(loop);
    } else {
      dot.style.transform = 'translate(' + mouseX + 'px, ' + mouseY + 'px)';
    }

    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (t && t.closest && t.closest(INTERACTIVE_SELECTOR)) {
        dot.classList.add('hovered');
      }
    }, true);

    document.addEventListener('mouseout', function (e) {
      var t = e.target;
      if (t && t.closest && t.closest(INTERACTIVE_SELECTOR)) {
        dot.classList.remove('hovered');
      }
    }, true);

    window.addEventListener('mousedown', function () {
      dot.classList.add('pressed');
    });
    window.addEventListener('mouseup', function () {
      dot.classList.remove('pressed');
    });

    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '';
    });

    window.addEventListener('blur', function () {
      dot.style.opacity = '0';
    });
    window.addEventListener('focus', function () {
      dot.style.opacity = '';
    });
  }

  /* =======================================================
     EYES — «живые глаза», следящие за курсором
     ======================================================= */
  function initEyes() {
    var layer = document.getElementById('eyes-layer');
    if (!layer) return;

    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var EYE_COUNT = 3;
    var MAX_PUPIL_OFFSET = 10;

    var positions = [
      { top: '18%', left: '8%' },
      { top: '72%', left: '12%' },
      { top: '40%', left: '92%' }
    ];

    var eyes = [];

    for (var i = 0; i < EYE_COUNT; i++) {
      var eye = document.createElement('div');
      eye.className = 'eye';
      var pos = positions[i] || { top: '50%', left: '50%' };
      eye.style.top = pos.top;
      eye.style.left = pos.left;

      var pupil = document.createElement('div');
      pupil.className = 'eye-pupil';
      eye.appendChild(pupil);

      layer.appendChild(eye);
      eyes.push({ el: eye, pupil: pupil });
    }

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function loop() {
      for (var i = 0; i < eyes.length; i++) {
        var item = eyes[i];
        var rect = item.el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;

        var dx = mouseX - cx;
        var dy = mouseY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;

        var offsetX = (dx / dist) * Math.min(dist / 8, MAX_PUPIL_OFFSET);
        var offsetY = (dy / dist) * Math.min(dist / 8, MAX_PUPIL_OFFSET);

        item.pupil.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* =======================================================
     SNOW — снежинки на canvas
     ======================================================= */
  function initSnow() {
    var canvas = document.getElementById('snow-canvas');
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var FLAKE_COUNT_DESKTOP = 90;
    var FLAKE_COUNT_MOBILE = 40;

    var width = 0;
    var height = 0;
    var dpr = 1;
    var flakes = [];

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
      var count = width < 768 ? FLAKE_COUNT_MOBILE : FLAKE_COUNT_DESKTOP;
      flakes = [];
      for (var i = 0; i < count; i++) {
        flakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 2.2 + 0.6,
          vy: Math.random() * 0.6 + 0.25,
          vx: (Math.random() - 0.5) * 0.4,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.02 + 0.008,
          alpha: Math.random() * 0.6 + 0.25
        });
      }
    }

    function getSnowColor() {
      var styles = getComputedStyle(document.documentElement);
      return styles.getPropertyValue('--snow-color').trim() || 'rgba(255,255,255,0.8)';
    }

    var color = getSnowColor();

    var observer = new MutationObserver(function () {
      color = getSnowColor();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
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

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        createFlakes();
      }, 200);
    });
  }

  /* =======================================================
     TEXT-ANIM — печатная машинка
     ======================================================= */
  function initTextAnim() {
    var el = document.querySelector('.typed');
    if (!el) return;

    var words = [];
    try {
      words = JSON.parse(el.dataset.words || '[]');
    } catch (e) {
      words = [];
    }
    if (!Array.isArray(words) || words.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = words[0];
      return;
    }

    var TYPE_SPEED = 70;
    var ERASE_SPEED = 40;
    var HOLD_TIME = 1600;

    var wordIndex = 0;
    var charIndex = 0;
    var erasing = false;

    function tick() {
      var current = words[wordIndex];

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

  /* =======================================================
     COPY — копирование Discord в буфер обмена
     ======================================================= */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();

    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  function copyText(text) {
    return new Promise(function (resolve) {
      if (!text) return resolve(false);

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(function () { resolve(true); })
          .catch(function () { resolve(fallbackCopy(text)); });
      } else {
        resolve(fallbackCopy(text));
      }
    });
  }

  function initCopy() {
    var buttons = document.querySelectorAll('.copy-btn');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      var locked = false;
      var label = btn.dataset.copyLabel || 'Текст';
      var value = btn.dataset.copy || '';

      var hint = btn.querySelector('.copy-hint');
      var titleEl = btn.querySelector('.copy-title');
      var valueEl = btn.querySelector('.copy-value');
      var labelEl = btn.querySelector('.copy-label');
      var arrowEl = btn.querySelector('.btn-arrow');

      var originalTitle = titleEl ? titleEl.textContent : null;
      var originalValue = valueEl ? valueEl.textContent : null;
      var originalLabel = labelEl ? labelEl.textContent : null;
      var originalArrow = arrowEl ? arrowEl.textContent : null;

      btn.addEventListener('mouseenter', function () {
        if (titleEl) titleEl.textContent = 'Клик — скопировать';
        if (labelEl) labelEl.textContent = 'Клик — скопировать';
      });

      btn.addEventListener('mouseleave', function () {
        if (titleEl && originalTitle !== null) titleEl.textContent = originalTitle;
        if (labelEl && originalLabel !== null) labelEl.textContent = originalLabel;
      });

      btn.addEventListener('click', function () {
        if (locked) return;
        locked = true;

        copyText(value).then(function (ok) {
          if (ok) {
            showToast(label + ' скопирован в буфер обмена');
          } else {
            showToast('Не удалось скопировать. Вручную: ' + value);
          }

          if (titleEl) titleEl.textContent = ok ? 'Скопировано ✓' : 'Ошибка';
          if (valueEl) valueEl.textContent = ok ? 'Скопировано ✓' : 'Ошибка';
          if (labelEl) labelEl.textContent = ok ? 'Скопировано ✓' : 'Ошибка';
          if (arrowEl) arrowEl.textContent = ok ? '✓' : '✕';

          setTimeout(function () {
            if (titleEl && originalTitle !== null) titleEl.textContent = originalTitle;
            if (valueEl && originalValue !== null) valueEl.textContent = originalValue;
            if (labelEl && originalLabel !== null) labelEl.textContent = originalLabel;
            if (arrowEl && originalArrow !== null) arrowEl.textContent = originalArrow;
          }, 1400);

          setTimeout(function () {
            locked = false;
          }, 600);
        });
      });
    });
  }

  /* =======================================================
     YEAR — подставляем текущий год
     ======================================================= */
  function initYear() {
    var nodes = document.querySelectorAll('#year, .year');
    var year = new Date().getFullYear();
    nodes.forEach(function (n) {
      n.textContent = String(year);
    });
  }

  /* =======================================================
     REVEAL — появление блоков при скролле
     ======================================================= */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* =======================================================
     BOOTSTRAP
     ======================================================= */
  function bootstrap() {
    initTheme();
    initCursor();
    initEyes();
    initSnow();
    initTextAnim();
    initCopy();
    initYear();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();