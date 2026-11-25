import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initMotionCore } from './motion-core';
import { initHeaderAndMenu } from './header-menu';
import { initPreloader } from './preloader';
import { initMilestoneBInteractions } from './ui-interactions';
import { computeTunnelPhaseState } from '@/utils/tunnel-phases';

gsap.registerPlugin(ScrollTrigger);

function scheduleIdle(cb: () => void): void {
  const ric = (window as Window & { requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number })
    .requestIdleCallback;
  if (ric) {
    ric(cb, { timeout: 600 });
  } else {
    window.setTimeout(cb, 120);
  }
}

function setupDeferredCinematicTunnel(): void {
  const section = document.getElementById('dunia-baru');
  const pinStage = document.getElementById('cinematic-pin-stage');
  const whiteoutEl = document.getElementById('cinematic-whiteout');
  const phase4Copy = document.getElementById('cinematic-phase4-copy');
  const phase1Wrap = document.getElementById('cinematic-phase1');
  const phase2Wrap = document.getElementById('cinematic-phase2');
  if (!section || !pinStage || !whiteoutEl || !phase4Copy) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    pinStage.style.height = 'auto';
    pinStage.classList.add('py-20', 'flex-col', 'gap-12');
    const canvas = document.getElementById('cinematic-canvas');
    if (canvas) canvas.style.display = 'none';
    whiteoutEl.style.position = 'relative';
    whiteoutEl.style.opacity = '1';
    whiteoutEl.style.pointerEvents = 'auto';
    whiteoutEl.classList.add('rounded-card', 'py-14', 'mt-8', 'mx-4');
    return;
  }

  const p1Words = Array.from(section.querySelectorAll<HTMLElement>('.cinematic-p1-word'));
  let renderVisual: ((progress: number) => void) | null = null;
  let loadingVisual = false;
  let currentProgress = 0;

  const ensureVisualRenderer = () => {
    if (loadingVisual || renderVisual) return;
    loadingVisual = true;
    void import('./cinematic-tunnel').then(({ mountCinematicVisualRenderer }) => {
      renderVisual = mountCinematicVisualRenderer();
      renderVisual(currentProgress);
    });
  };

  // Mount WebGL/Canvas2D renderer lazily only when user scrolls within 900px of #dunia-baru
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        ensureVisualRenderer();
        io.disconnect();
      }
    },
    { rootMargin: '900px 0px' }
  );
  io.observe(section);

  const applyProgress = (progress: number) => {
    currentProgress = progress;
    if (progress > 0) ensureVisualRenderer();
    const state = computeTunnelPhaseState(progress);

    if (phase1Wrap) {
      phase1Wrap.style.opacity = state.phase1Opacity.toFixed(3);
      phase1Wrap.style.transform = `translate3d(0, ${((1 - state.phase1WordProgress) * 18).toFixed(1)}px, 0)`;
    }
    p1Words.forEach((word, idx) => {
      const localStart = idx * 0.16;
      const localProgress = Math.max(0, Math.min(1, (state.phase1WordProgress - localStart) / 0.52));
      word.style.transform = `translate3d(0, ${((1 - localProgress) * 110).toFixed(1)}%, 0)`;
    });
    if (phase2Wrap) {
      phase2Wrap.style.opacity = state.phase2Opacity.toFixed(3);
    }
    whiteoutEl.style.opacity = state.whiteoutOpacity.toFixed(3);
    whiteoutEl.style.pointerEvents = state.whiteoutOpacity > 0.85 ? 'auto' : 'none';
    phase4Copy.style.opacity = state.phase4RevealProgress.toFixed(3);
    phase4Copy.style.transform = `translate3d(0, ${((1 - state.phase4RevealProgress) * 36).toFixed(1)}px, 0)`;

    if (state.whiteoutOpacity >= 0.95) {
      document.body.style.backgroundColor = '#FFFFFF';
    }

    renderVisual?.(progress);
  };

  applyProgress(0);

  ScrollTrigger.create({
    trigger: section,
    pin: pinStage,
    start: 'top top',
    end: '+=300%',
    scrub: 1.5,
    onUpdate: (self) => applyProgress(self.progress),
  });
}

function boot(): void {
  initMotionCore();
  initHeaderAndMenu();

  window.setTimeout(() => {
    initMilestoneBInteractions();
    setupDeferredCinematicTunnel();
  }, 90);

  initPreloader(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (window.innerWidth < 768) {
      const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
      if (canvas) {
        void import('./hero-fallback-2d').then(({ mountHeroCanvas2DFallback }) => {
          canvas.dataset.renderMode = 'canvas2d-mobile';
          mountHeroCanvas2DFallback(canvas, 9);
        });
      }
      return;
    }

    scheduleIdle(() => {
      void import('./hero-scene').then(({ initHeroScene }) => {
        initHeroScene();
      });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
