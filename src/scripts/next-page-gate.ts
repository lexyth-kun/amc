import { prefersReducedMotion } from './motion-core';
import { runPageTransition } from './page-transition';
import {
  advanceOverscrollCharge,
  decayOverscrollCharge,
  isAtDocumentBottom,
  shouldTriggerNextPage,
} from '@/utils/next-page-scroll';

const RING_CIRCUMFERENCE = 163.36;

export function initNextPageScrollGate(): void {
  const gate = document.getElementById('next-page-scroll-gate');
  if (!gate) return;

  const targetHref = gate.dataset.nextPageHref;
  if (!targetHref) return;

  const bar = document.getElementById('next-page-charge-bar');
  const pctEl = document.getElementById('next-page-charge-pct');
  const ringEl = document.getElementById('next-page-ring');
  const glowEl = document.getElementById('next-page-glow');
  const linkEl = gate.querySelector<HTMLAnchorElement>('[data-next-page-link]');

  let charge = 0;
  let triggered = false;
  let lastInputTs = 0;
  let lastFrameTs = performance.now();
  let touchStartY: number | null = null;

  const renderCharge = () => {
    if (bar) {
      bar.style.transform = `scaleX(${charge.toFixed(4)})`;
    }
    if (pctEl) {
      pctEl.textContent = `${Math.round(charge * 100)}%`;
    }
    if (ringEl) {
      ringEl.style.strokeDashoffset = (RING_CIRCUMFERENCE * (1 - charge)).toFixed(2);
    }
    if (glowEl) {
      glowEl.style.opacity = (0.2 + charge * 0.78).toFixed(3);
    }
  };

  const navigateNow = () => {
    if (triggered) return;
    triggered = true;
    charge = 1;
    renderCharge();
    void runPageTransition(() => {
      window.location.assign(targetHref);
    });
  };

  // Clicking the footer portal link runs the same seamless Lusion curtain wipe (internal or external)
  if (linkEl) {
    linkEl.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      navigateNow();
    });
  }

  // Expose deterministic helper for Playwright verification
  (
    window as Window & { __amcSetNextPageCharge?: (value: number) => void }
  ).__amcSetNextPageCharge = (value: number) => {
    charge = Math.max(0, Math.min(1, value));
    lastInputTs = performance.now();
    renderCharge();
    if (shouldTriggerNextPage(charge)) {
      navigateNow();
    }
  };

  if (prefersReducedMotion()) {
    // Respect reduced-motion: never auto-redirect on scroll; users click the footer portal intentionally.
    return;
  }

  const atBottom = () =>
    isAtDocumentBottom(
      Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0),
      window.innerHeight,
      document.documentElement.scrollHeight,
      24
    );

  const onWheel = (e: WheelEvent) => {
    if (triggered) return;
    if (!atBottom()) {
      if (charge > 0 && e.deltaY < 0) {
        charge = advanceOverscrollCharge(charge, e.deltaY * 1.4, 440);
        renderCharge();
      }
      return;
    }

    if (e.deltaY > 0) {
      lastInputTs = performance.now();
      charge = advanceOverscrollCharge(charge, e.deltaY, 440);
      renderCharge();
      if (shouldTriggerNextPage(charge)) {
        navigateNow();
      }
    } else if (e.deltaY < 0 && charge > 0) {
      lastInputTs = performance.now();
      charge = advanceOverscrollCharge(charge, e.deltaY * 1.4, 440);
      renderCharge();
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (triggered || touchStartY === null || e.touches.length !== 1) return;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY - currentY; // pulling upward = positive scroll down
    touchStartY = currentY;
    if (!atBottom()) return;
    if (deltaY > 0) {
      lastInputTs = performance.now();
      charge = advanceOverscrollCharge(charge, deltaY * 1.6, 340);
      renderCharge();
      if (shouldTriggerNextPage(charge)) {
        navigateNow();
      }
    }
  };

  const onTouchEnd = () => {
    touchStartY = null;
  };

  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  // Smooth spring decay if visitor stops scrolling before reaching 100%
  const tick = (now: number) => {
    const dt = Math.min(0.08, (now - lastFrameTs) / 1000);
    lastFrameTs = now;
    if (!triggered && charge > 0 && now - lastInputTs > 320) {
      charge = decayOverscrollCharge(charge, dt, 0.9);
      renderCharge();
    }
    if (!triggered) {
      window.requestAnimationFrame(tick);
    }
  };
  window.requestAnimationFrame(tick);
}
