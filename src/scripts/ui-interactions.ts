import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computeCardTilt, lerpNumber, nextReelStepIndex } from '@/utils/interaction-math';
import { getLenis, prefersReducedMotion } from './motion-core';

gsap.registerPlugin(ScrollTrigger);

export function initMilestoneBInteractions(): void {
  initFadeUpBlocks();
  initProductCardStaggerAndTilt();
  initShowreelModal();
}

function initFadeUpBlocks(): void {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('[data-fade-up]').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true,
        },
      }
    );
  });
}

function initProductCardStaggerAndTilt(): void {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-product-card]'));
  if (!cards.length) return;

  if (!prefersReducedMotion()) {
    const grid = cards[0].parentElement;
    if (grid) {
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 84%',
            once: true,
          },
        }
      );
    }
  }

  const canHoverFine =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion();
  if (!canHoverFine) return;

  interface TiltState {
    el: HTMLElement;
    hovered: boolean;
    targetRx: number;
    targetRy: number;
    targetTy: number;
    curRx: number;
    curRy: number;
    curTy: number;
  }

  const states: TiltState[] = cards.map((el) => ({
    el,
    hovered: false,
    targetRx: 0,
    targetRy: 0,
    targetTy: 0,
    curRx: 0,
    curRy: 0,
    curTy: 0,
  }));

  for (const st of states) {
    st.el.addEventListener('mouseenter', () => {
      st.hovered = true;
      st.targetTy = -8;
    });

    st.el.addEventListener(
      'mousemove',
      (e) => {
        const rect = st.el.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / Math.max(1, rect.width);
        const normY = (e.clientY - rect.top) / Math.max(1, rect.height);
        const { rotateX, rotateY } = computeCardTilt(normX, normY, 8);
        st.targetRx = rotateX;
        st.targetRy = rotateY;
        st.targetTy = -8;
      },
      { passive: true }
    );

    st.el.addEventListener('mouseleave', () => {
      st.hovered = false;
      st.targetRx = 0;
      st.targetRy = 0;
      st.targetTy = 0;
    });
  }

  gsap.ticker.add(() => {
    for (const st of states) {
      if (
        !st.hovered &&
        Math.abs(st.curRx) < 0.02 &&
        Math.abs(st.curRy) < 0.02 &&
        Math.abs(st.curTy) < 0.05
      ) {
        continue;
      }
      st.curRx = lerpNumber(st.curRx, st.targetRx, 0.1);
      st.curRy = lerpNumber(st.curRy, st.targetRy, 0.1);
      st.curTy = lerpNumber(st.curTy, st.targetTy, 0.12);
      st.el.style.transform = `perspective(1000px) translate3d(0, ${st.curTy.toFixed(2)}px, 0) rotateX(${st.curRx.toFixed(2)}deg) rotateY(${st.curRy.toFixed(2)}deg)`;
    }
  });
}

function initShowreelModal(): void {
  const openBtn = document.getElementById('open-reel-btn');
  const closeBtn = document.getElementById('close-reel-btn');
  const pauseBtn = document.getElementById('reel-pause-btn');
  const pauseLabel = document.getElementById('reel-pause-label');
  const modal = document.getElementById('showreel-modal');
  if (!openBtn || !closeBtn || !modal) return;

  const tabs = Array.from(modal.querySelectorAll<HTMLButtonElement>('[data-reel-tab]'));
  const slides = Array.from(modal.querySelectorAll<HTMLElement>('[data-reel-slide]'));
  let activeIdx = 0;
  let paused = prefersReducedMotion();
  let timerId: number | null = null;

  const showStep = (idx: number) => {
    activeIdx = idx;
    tabs.forEach((t, i) => {
      const selected = i === idx;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.className = `min-h-[44px] rounded-xl border px-2 py-2 font-display text-xs font-extrabold transition-colors ${
        selected
          ? 'border-amc bg-amc text-white'
          : 'border-line bg-bg-alt text-navy hover:border-sky-deep'
      }`;
    });
    slides.forEach((s, i) => {
      s.hidden = i !== idx;
    });
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (paused) return;
    timerId = window.setInterval(() => {
      showStep(nextReelStepIndex(activeIdx, slides.length, 1));
    }, 2000);
  };

  const stopAutoplay = () => {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const openModal = () => {
    modal.hidden = false;
    getLenis()?.stop();
    document.body.style.overflow = 'hidden';
    showStep(0);
    startAutoplay();
    window.setTimeout(() => closeBtn.focus(), 40);
  };

  const closeModal = () => {
    if (modal.hidden) return;
    stopAutoplay();
    modal.hidden = true;
    document.body.style.overflow = '';
    getLenis()?.start();
    openBtn.focus();
  };

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      e.preventDefault();
      closeModal();
    }
  });

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      showStep(idx);
      startAutoplay();
    });
  });

  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    if (pauseLabel) pauseLabel.textContent = paused ? 'Putar' : 'Jeda';
    if (paused) stopAutoplay();
    else startAutoplay();
  });
}
