import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initMotionCore } from './motion-core';
import { initHeaderAndMenu } from './header-menu';
import { initPreloader } from './preloader';
import { initMilestoneBInteractions } from './ui-interactions';
import { finishProductPortalEntry } from './page-transition';
import { computeLogoWaveMotion, computeTunnelPhaseState } from '@/utils/tunnel-phases';

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
  const orbitalStage = document.getElementById('cinematic-orbital-stage');
  const serviceGroups = Array.from(document.querySelectorAll<HTMLElement>('[data-tunnel-group]'));
  const groupIcons = serviceGroups.map((group) =>
    Array.from(group.querySelectorAll<HTMLElement>('[data-tunnel-icon]'))
  );
  const groupDots = Array.from(document.querySelectorAll<HTMLElement>('[data-tunnel-dot]'));
  const groupLabel = document.getElementById('cinematic-active-category');
  const progressBar = document.getElementById('cinematic-showcase-bar');
  if (!section || !pinStage || !whiteoutEl || !phase4Copy) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    pinStage.style.height = 'auto';
    pinStage.classList.add('py-20', 'flex-col', 'gap-10');
    const canvas = document.getElementById('cinematic-canvas');
    if (canvas) canvas.style.display = 'none';
    if (phase2Wrap) {
      phase2Wrap.style.position = 'relative';
      phase2Wrap.style.opacity = '1';
      phase2Wrap.style.pointerEvents = 'auto';
      phase2Wrap.classList.add('gap-8', 'py-8');
    }
    serviceGroups.forEach((g, idx) => {
      g.style.position = 'relative';
      g.style.opacity = '1';
      g.style.pointerEvents = 'auto';
      g.setAttribute('aria-hidden', 'false');
      g.classList.add('flex', 'flex-wrap', 'justify-center', 'gap-3', 'my-3');
      (groupIcons[idx] ?? []).forEach((icon) => {
        icon.style.position = 'static';
        icon.style.margin = '0';
        icon.style.opacity = '1';
        icon.style.transform = 'none';
        icon.style.pointerEvents = 'auto';
      });
    });
    whiteoutEl.style.position = 'relative';
    whiteoutEl.style.opacity = '1';
    whiteoutEl.style.pointerEvents = 'auto';
    whiteoutEl.classList.add('py-14', 'mt-6', 'px-4');
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

    const phase2Interactive = state.phase2Opacity > 0.55 && state.whiteoutOpacity < 0.25;
    if (phase2Wrap) {
      phase2Wrap.style.opacity = state.phase2Opacity.toFixed(3);
    }

    if (serviceGroups.length > 0) {
      const stageW = orbitalStage?.clientWidth || window.innerWidth;
      const stageH = orbitalStage?.clientHeight || window.innerHeight * 0.65;
      const isCompact = stageW < 640;
      const rx = isCompact
        ? Math.min(stageW * 0.36, 140)
        : Math.min(stageW * 0.28, 380);
      const ry = isCompact
        ? Math.min(stageH * 0.34, 195)
        : Math.min(stageH * 0.36, 225);

      const activeIdx = Math.min(
        serviceGroups.length - 1,
        Math.floor(state.showcaseProgress * serviceGroups.length)
      );

      serviceGroups.forEach((group, gIdx) => {
        const icons = groupIcons[gIdx] ?? [];
        const total = icons.length;
        let groupMaxOpacity = 0;

        icons.forEach((icon, itemIdx) => {
          const motion = computeLogoWaveMotion(
            state.showcaseProgress,
            gIdx,
            serviceGroups.length,
            itemIdx,
            total
          );
          if (motion.opacity > groupMaxOpacity) {
            groupMaxOpacity = motion.opacity;
          }
          const x = Math.cos(motion.angleRad) * rx * motion.radialFactor;
          const y = Math.sin(motion.angleRad) * ry * motion.radialFactor;
          icon.style.opacity = motion.opacity.toFixed(3);
          icon.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${motion.scale.toFixed(3)}) rotate(${motion.rotateDeg.toFixed(2)}deg)`;
          icon.style.pointerEvents = phase2Interactive && motion.opacity > 0.45 ? 'auto' : 'none';
        });

        const isVisible = groupMaxOpacity > 0.01;
        group.style.opacity = isVisible ? '1' : '0';
        group.style.pointerEvents = 'none';
        group.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      });

      groupDots.forEach((dot, idx) => {
        const isCurrent = idx === activeIdx;
        dot.classList.toggle('bg-sky-light', isCurrent);
        dot.classList.toggle('w-7', isCurrent);
        dot.classList.toggle('bg-white/30', !isCurrent);
        dot.classList.toggle('w-2', !isCurrent);
      });
      const activeName = serviceGroups[activeIdx]?.dataset.tunnelGroupLabel;
      if (groupLabel && activeName) {
        groupLabel.textContent = `${activeIdx + 1}/${serviceGroups.length} • ${activeName}`;
      }
      if (progressBar) {
        progressBar.style.transform = `scaleX(${Math.max(0.04, state.showcaseProgress).toFixed(4)})`;
      }
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
    end: '+=620%',
    scrub: 1.6,
    onUpdate: (self) => applyProgress(self.progress),
  });
}

function boot(): void {
  initMotionCore();
  initHeaderAndMenu();

  const hasDetailStage = Boolean(document.getElementById('product-detail-stage'));
  if (hasDetailStage) {
    void import('./product-detail').then(({ initProductDetailExperience }) => {
      initProductDetailExperience();
    });
  } else {
    finishProductPortalEntry();
  }

  if (document.getElementById('about-particles-canvas')) {
    void import('./about-particles').then(({ initAboutFluidParticles }) => {
      initAboutFluidParticles();
    });
  }

  if (document.getElementById('next-page-scroll-gate')) {
    void import('./next-page-gate').then(({ initNextPageScrollGate }) => {
      initNextPageScrollGate();
    });
  }

  window.setTimeout(() => {
    initMilestoneBInteractions();
    setupDeferredCinematicTunnel();
  }, 90);

  initPreloader(() => {
    const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (window.innerWidth < 768) {
      void import('./hero-fallback-2d').then(({ mountHeroCanvas2DFallback }) => {
        canvas.dataset.renderMode = 'canvas2d-mobile';
        mountHeroCanvas2DFallback(canvas, 9);
      });
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
