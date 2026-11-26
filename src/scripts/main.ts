import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initMotionCore } from './motion-core';
import { initHeaderAndMenu } from './header-menu';
import { initPreloader } from './preloader';
import { initMilestoneBInteractions } from './ui-interactions';
import { finishProductPortalEntry } from './page-transition';
import {
  computeLogoWaveMotion,
  computeTunnelPhaseState,
  waveIndexToTunnelProgress,
} from '@/utils/tunnel-phases';

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
  const worldWatermark = document.getElementById('cinematic-world-watermark');
  const worldNav = document.getElementById('cinematic-world-nav');
  const serviceGroups = Array.from(document.querySelectorAll<HTMLElement>('[data-tunnel-group]'));
  const groupIcons = serviceGroups.map((group) =>
    Array.from(group.querySelectorAll<HTMLElement>('[data-tunnel-icon]'))
  );
  const groupDots = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-tunnel-dot]'));
  const groupLabel = document.getElementById('cinematic-active-category');
  const groupSubtitle = document.getElementById('cinematic-active-subtitle');
  const progressBar = document.getElementById('cinematic-showcase-bar');
  if (!section || !pinStage || !whiteoutEl || !phase4Copy) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    pinStage.style.height = 'auto';
    pinStage.classList.add('py-20', 'flex-col', 'gap-10');
    const canvas = document.getElementById('cinematic-canvas');
    if (canvas) canvas.style.display = 'none';
    if (worldWatermark) worldWatermark.style.display = 'none';
    if (worldNav) worldNav.style.display = 'none';
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
  let renderVisual: ((progress: number, pointerX?: number, pointerY?: number) => void) | null = null;
  let loadingVisual = false;
  let currentProgress = 0;
  let lastActiveWave = -1;

  // Interactive damped pointer parallax for WebGL camera steering & editorial watermark drift
  let targetPx = 0;
  let targetPy = 0;
  let smoothPx = 0;
  let smoothPy = 0;
  let parallaxRaf = 0;

  const tickParallax = () => {
    smoothPx += (targetPx - smoothPx) * 0.1;
    smoothPy += (targetPy - smoothPy) * 0.1;

    renderVisual?.(currentProgress, smoothPx, smoothPy);
    if (worldWatermark) {
      const scrollDriftX = (currentProgress - 0.45) * -90;
      worldWatermark.style.transform = `translate3d(${(scrollDriftX - smoothPx * 28).toFixed(1)}px, ${(-smoothPy * 16).toFixed(1)}px, 0)`;
    }

    if (Math.abs(targetPx - smoothPx) > 0.002 || Math.abs(targetPy - smoothPy) > 0.002) {
      parallaxRaf = window.requestAnimationFrame(tickParallax);
    } else {
      parallaxRaf = 0;
    }
  };

  const kickParallax = () => {
    if (!parallaxRaf) {
      parallaxRaf = window.requestAnimationFrame(tickParallax);
    }
  };

  pinStage.addEventListener(
    'pointermove',
    (ev) => {
      if (ev.pointerType === 'touch') return;
      const rect = pinStage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      targetPx = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      targetPy = ((ev.clientY - rect.top) / rect.height) * 2 - 1;
      kickParallax();
    },
    { passive: true }
  );

  pinStage.addEventListener(
    'pointerleave',
    () => {
      targetPx = 0;
      targetPy = 0;
      kickParallax();
    },
    { passive: true }
  );

  const ensureVisualRenderer = () => {
    if (loadingVisual || renderVisual) return;
    loadingVisual = true;
    void import('./cinematic-tunnel').then(({ mountCinematicVisualRenderer }) => {
      renderVisual = mountCinematicVisualRenderer();
      renderVisual(currentProgress, smoothPx, smoothPy);
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
      const localStart = idx * 0.1;
      const localProgress = Math.max(0, Math.min(1, (state.phase1WordProgress - localStart) / 0.42));
      word.style.transform = `translate3d(0, ${((1 - localProgress) * 110).toFixed(1)}%, 0)`;
    });

    const phase2Interactive = state.phase2Opacity > 0.55 && state.whiteoutOpacity < 0.25;
    if (phase2Wrap) {
      phase2Wrap.style.opacity = state.phase2Opacity.toFixed(3);
    }
    if (worldNav) {
      worldNav.style.pointerEvents = phase2Interactive ? 'auto' : 'none';
    }

    if (serviceGroups.length > 0) {
      const stageW = orbitalStage?.clientWidth || window.innerWidth;
      const stageH = orbitalStage?.clientHeight || window.innerHeight * 0.62;
      const isCompact = stageW < 640;
      const halfW = isCompact
        ? Math.min(stageW * 0.42, 165)
        : Math.min(stageW * 0.4, 495);
      const halfH = isCompact
        ? Math.min(stageH * 0.38, 195)
        : Math.min(stageH * 0.42, 250);

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
          const x = motion.xNorm * halfW;
          const y = motion.yNorm * halfH;
          icon.style.opacity = motion.opacity.toFixed(3);
          icon.style.transform = `perspective(900px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${motion.scale.toFixed(3)}) rotate(${motion.rotateDeg.toFixed(2)}deg) rotateY(${motion.tiltYDeg.toFixed(1)}deg)`;
          icon.style.pointerEvents = phase2Interactive && motion.opacity > 0.45 ? 'auto' : 'none';
        });

        const isVisible = groupMaxOpacity > 0.01;
        group.style.opacity = isVisible ? '1' : '0';
        group.style.pointerEvents = 'none';
        group.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      });

      if (activeIdx !== lastActiveWave) {
        lastActiveWave = activeIdx;
        groupDots.forEach((dot, idx) => {
          const isCurrent = idx === activeIdx;
          dot.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
          dot.classList.toggle('border-[#7DD3FC]/70', isCurrent);
          dot.classList.toggle('bg-[#38BDF8]/25', isCurrent);
          dot.classList.toggle('text-white', isCurrent);
          dot.classList.toggle('shadow-[0_0_20px_rgba(56,189,248,0.35)]', isCurrent);
          dot.classList.toggle('border-white/15', !isCurrent);
          dot.classList.toggle('bg-white/[0.04]', !isCurrent);
          dot.classList.toggle('text-white/60', !isCurrent);
        });

        const activeGroup = serviceGroups[activeIdx];
        const activeName = activeGroup?.dataset.tunnelGroupLabel;
        const activeSub = activeGroup?.dataset.tunnelGroupSubtitle;
        const activeWatermark = activeGroup?.dataset.tunnelGroupWatermark;
        if (groupLabel && activeName) {
          groupLabel.textContent = `0${activeIdx + 1}/0${serviceGroups.length} • ${activeName}`;
        }
        if (groupSubtitle && activeSub) {
          groupSubtitle.textContent = activeSub;
        }
        if (worldWatermark && activeWatermark) {
          worldWatermark.textContent = activeWatermark;
        }
      }

      if (worldWatermark) {
        const scrollDriftX = (progress - 0.45) * -90;
        worldWatermark.style.transform = `translate3d(${(scrollDriftX - smoothPx * 28).toFixed(1)}px, ${(-smoothPy * 16).toFixed(1)}px, 0)`;
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

    renderVisual?.(progress, smoothPx, smoothPy);
  };

  applyProgress(0);

  const tunnelTrigger = ScrollTrigger.create({
    trigger: section,
    pin: pinStage,
    start: 'top top',
    end: '+=620%',
    scrub: 1.6,
    onUpdate: (self) => applyProgress(self.progress),
  });

  // Allow users to click any of the 6 world pills to warp directly to that category wave
  groupDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const targetProgress = waveIndexToTunnelProgress(idx, serviceGroups.length);
      const targetY = tunnelTrigger.start + (tunnelTrigger.end - tunnelTrigger.start) * targetProgress;
      const win = window as Window & { __amcScrollTo?: (y: number) => void };
      if (win.__amcScrollTo) {
        win.__amcScrollTo(targetY);
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
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

  if (document.querySelector('[data-about-spheres]')) {
    void import('./about-particles').then(({ initAboutFluidParticles }) => {
      initAboutFluidParticles();
    });
  }

  if (
    document.getElementById('founder-hologram-canvas') ||
    document.getElementById('ulasan-layanan')
  ) {
    void import('./about-experience').then(({ initAboutExperience }) => {
      initAboutExperience();
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
