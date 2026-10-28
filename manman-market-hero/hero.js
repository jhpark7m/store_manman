/**
 * 만만마켓 히어로 — framework-independent integration.
 * Desktop >= 1200px: static row. Smaller containers: 3-second carousel.
 * Call ManmanHero.mount(root) after dynamically inserting the HTML.
 * Keep the returned cleanup function for SPA unmounts.
 */
(function () {
  'use strict';
  const mounted = new WeakMap();
  function mount(root) {
    if (mounted.has(root)) return mounted.get(root);
    const section = root.querySelector('.mm-b-hero');
    const cards = Array.from(root.querySelectorAll('.mm-b-card'));
    if (!section || cards.length !== 3) return function () {};
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let compact = false, turn = 1, phase = 1, frame = 0, timer = 0;
    const listeners = [];
    const activeIndex = () => ((turn % 3) + 3) % 3;
    function render() {
      const active = activeIndex();
      cards.forEach((card, index) => {
        card.dataset.position = index === active ? 'front' : index === (active + 2) % 3 ? 'left' : 'right';
        if (!compact) {
          card.style.removeProperty('transform');
          card.style.removeProperty('z-index');
          ['role', 'tabindex', 'aria-label', 'aria-pressed'].forEach(name => card.removeAttribute(name));
          return;
        }
        const angle = (index - phase) * Math.PI * 2 / 3;
        const x = Math.sin(angle), depth = Math.cos(angle);
        card.style.transform = `translateX(calc(-50% + var(--mm-orbit-radius) * ${x.toFixed(5)})) translateY(${((1-depth)*12).toFixed(3)}px) scale(${(.92+.08*depth).toFixed(5)}) rotate(${(x*8).toFixed(3)}deg)`;
        card.style.zIndex = String(Math.round(2000 + depth * 1000));
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', card.querySelector('h2').childNodes[0].textContent + ' 상품 크게 보기');
        card.setAttribute('aria-pressed', String(index === active));
      });
    }
    function animateTo(next) {
      turn = next;
      cancelAnimationFrame(frame);
      if (!compact || motion.matches) { phase = turn; render(); return; }
      const from = phase;
      let started = null;
      function animate(now) {
        if (started === null) started = now;
        const t = Math.min(1, (now - started) / 1200);
        const eased = t * t * (3 - 2 * t);
        phase = from + (turn - from) * eased;
        render();
        if (t < 1) frame = requestAnimationFrame(animate);
      }
      frame = requestAnimationFrame(animate);
    }
    function resetTimer() {
      clearInterval(timer);
      if (compact && !motion.matches) {
        timer = setInterval(() => { if (!document.hidden) animateTo(turn + 1); }, 3000);
      }
    }
    function resize() {
      const next = section.clientWidth < 1200;
      if (next !== compact) {
        compact = next;
        cancelAnimationFrame(frame);
        phase = turn;
        resetTimer();
      }
      render();
    }
    function motionChanged() {
      cancelAnimationFrame(frame); phase = turn; render(); resetTimer();
    }
    cards.forEach((card, index) => {
      function select() {
        if (!compact) return;
        animateTo(turn + ((index - activeIndex() + 3) % 3));
        resetTimer();
      }
      function keydown(event) {
        if (compact && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault(); select();
        }
      }
      card.addEventListener('click', select);
      card.addEventListener('keydown', keydown);
      listeners.push(() => {
        card.removeEventListener('click', select);
        card.removeEventListener('keydown', keydown);
      });
    });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(section);
    else window.addEventListener('resize', resize);
    motion.addEventListener('change', motionChanged);
    resize();
    const cleanup = () => {
      cancelAnimationFrame(frame); clearInterval(timer);
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      motion.removeEventListener('change', motionChanged);
      listeners.forEach(remove => remove());
      mounted.delete(root);
    };
    mounted.set(root, cleanup);
    return cleanup;
  }
  window.ManmanHero = { mount };
  function init() { document.querySelectorAll('[data-manman-hero]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
