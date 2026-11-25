import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computeCardTilt, lerpNumber, nextReelStepIndex } from '@/utils/interaction-math';
import { computeCountdownParts } from '@/utils/countdown';
import { formatAnimatedCounter, validateNewsletterEmail } from '@/utils/newsletter';
import { getLenis, prefersReducedMotion } from './motion-core';

gsap.registerPlugin(ScrollTrigger);

export function initMilestoneBInteractions(): void {
  initFadeUpBlocks();
  initStaggerGroups();
  initProductCardStaggerAndTilt();
  initShowreelModal();
  initFlashSaleCountdown();
  initHowToOrderPreview();
  initAnimatedCounters();
  initTestimonialCarousel();
  initFaqAndTncModal();
  initNewsletterForms();
  initFooterReveal();
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

function initStaggerGroups(): void {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('[data-stagger-group]').forEach((group) => {
    const items = Array.from(group.querySelectorAll<HTMLElement>('[data-stagger-card]'));
    if (!items.length) return;
    gsap.fromTo(
      items,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
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

  const stopAutoplay = () => {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (paused) return;
    timerId = window.setInterval(() => {
      showStep(nextReelStepIndex(activeIdx, slides.length, 1));
    }, 2000);
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

function initFlashSaleCountdown(): void {
  const section = document.getElementById('flash-sale');
  const endsAt = section?.dataset.flashEnds;
  if (!section || !endsAt) return;

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');
  const expiredBanner = document.getElementById('flash-expired-banner');
  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  let lastSec = '';

  const update = () => {
    const parts = computeCountdownParts(endsAt, Date.now());
    daysEl.textContent = parts.days;
    hoursEl.textContent = parts.hours;
    minsEl.textContent = parts.minutes;
    secsEl.textContent = parts.seconds;

    if (parts.isExpired && expiredBanner) {
      expiredBanner.hidden = false;
    }

    if (parts.seconds !== lastSec && lastSec !== '' && !prefersReducedMotion()) {
      gsap.fromTo(secsEl, { scale: 1.05 }, { scale: 1, duration: 0.15, ease: 'power2.out' });
    }
    lastSec = parts.seconds;
  };

  update();
  window.setInterval(update, 1000);
}

function initHowToOrderPreview(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-order-step-btn]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-order-step-panel]'));
  if (!buttons.length || !panels.length) return;

  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b, i) => {
        const active = i === idx;
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
        b.className = `group flex min-h-[44px] flex-col justify-between rounded-card border p-6 text-left transition-all duration-300 ${
          active
            ? 'border-amc bg-bg-alt shadow-amc'
            : 'border-line bg-white hover:border-sky-deep hover:bg-bg-alt/60'
        }`;
      });
      panels.forEach((p, i) => {
        p.hidden = i !== idx;
      });
    });
  });
}

function initAnimatedCounters(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-counter-target]'));
  if (!els.length) return;

  els.forEach((el) => {
    const target = parseFloat(el.dataset.counterTarget || '0');
    const decimals = parseInt(el.dataset.counterDecimals || '0', 10);
    const suffix = el.dataset.counterSuffix || '';

    if (prefersReducedMotion()) {
      el.textContent = formatAnimatedCounter(target, decimals, suffix);
      return;
    }

    const holder = { val: 0 };
    gsap.to(holder, {
      val: target,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = formatAnimatedCounter(holder.val, decimals, suffix);
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });
}

function initTestimonialCarousel(): void {
  const viewport = document.getElementById('testi-viewport');
  const prevBtn = document.getElementById('testi-prev-btn');
  const nextBtn = document.getElementById('testi-next-btn');
  const pauseBtn = document.getElementById('testi-pause-btn');
  const pauseLabel = document.getElementById('testi-pause-label');
  const slides = Array.from(document.querySelectorAll<HTMLElement>('[data-testi-slide]'));
  if (!viewport || !slides.length) return;

  let activeIdx = 0;
  let paused = prefersReducedMotion();
  let timerId: number | null = null;

  const syncSlideState = (idx: number) => {
    activeIdx = nextReelStepIndex(idx, slides.length, 0);
    const isMobileStack = window.innerWidth < 1024;
    slides.forEach((slide, i) => {
      const isCurrent = i === activeIdx;
      slide.classList.toggle('border-amc', isCurrent);
      slide.classList.toggle('shadow-amc', isCurrent);
      slide.classList.toggle('border-line', !isCurrent);
      slide.hidden = isMobileStack ? !isCurrent : false;
    });
  };

  const stopTimer = () => {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    if (paused) return;
    timerId = window.setInterval(() => {
      syncSlideState(nextReelStepIndex(activeIdx, slides.length, 1));
    }, 5000);
  };

  prevBtn?.addEventListener('click', () => {
    syncSlideState(nextReelStepIndex(activeIdx, slides.length, -1));
    startTimer();
  });

  nextBtn?.addEventListener('click', () => {
    syncSlideState(nextReelStepIndex(activeIdx, slides.length, 1));
    startTimer();
  });

  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    if (pauseLabel) pauseLabel.textContent = paused ? 'Putar' : 'Jeda';
    if (paused) stopTimer();
    else startTimer();
  });

  // Pointer drag / swipe support
  let dragStartX: number | null = null;
  viewport.addEventListener('pointerdown', (e) => {
    dragStartX = e.clientX;
  });
  viewport.addEventListener('pointerup', (e) => {
    if (dragStartX === null) return;
    const dx = e.clientX - dragStartX;
    dragStartX = null;
    if (Math.abs(dx) > 42) {
      syncSlideState(nextReelStepIndex(activeIdx, slides.length, dx < 0 ? 1 : -1));
      startTimer();
    }
  });

  window.addEventListener('resize', () => syncSlideState(activeIdx));
  syncSlideState(0);
  startTimer();
}

function initFaqAndTncModal(): void {
  const faqBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-faq-btn]'));
  faqBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.faqBtn;
      const panel = idx !== undefined ? document.getElementById(`faq-panel-${idx}`) : null;
      const icon =
        idx !== undefined ? document.querySelector<HTMLElement>(`[data-faq-icon="${idx}"]`) : null;
      if (!panel) return;
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      icon?.classList.toggle('rotate-180', willOpen);
    });
  });

  const tncModal = document.getElementById('tnc-modal');
  const closeTncBtn = document.getElementById('close-tnc-btn');
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-open-tnc]'));
  if (!tncModal || !closeTncBtn) return;

  let lastTrigger: HTMLElement | null = null;

  const openTnc = (trigger: HTMLElement) => {
    lastTrigger = trigger;
    tncModal.hidden = false;
    getLenis()?.stop();
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => closeTncBtn.focus(), 40);
  };

  const closeTnc = () => {
    if (tncModal.hidden) return;
    tncModal.hidden = true;
    document.body.style.overflow = '';
    getLenis()?.start();
    lastTrigger?.focus();
  };

  triggers.forEach((t) => {
    t.addEventListener('click', () => openTnc(t));
  });
  closeTncBtn.addEventListener('click', closeTnc);
  tncModal.addEventListener('click', (e) => {
    if (e.target === tncModal) closeTnc();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !tncModal.hidden) {
      e.preventDefault();
      closeTnc();
    }
  });
}

function initNewsletterForms(): void {
  document.querySelectorAll<HTMLFormElement>('.js-newsletter-form').forEach((form) => {
    const input = form.querySelector<HTMLInputElement>('input[name="email"]');
    const feedback = form.querySelector<HTMLElement>('.js-newsletter-feedback');
    if (!input || !feedback) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = validateNewsletterEmail(input.value);
      feedback.textContent = result.message;

      if (result.status === 'valid') {
        feedback.className = 'js-newsletter-feedback mt-2 text-xs font-semibold leading-relaxed text-sky-ink';
        try {
          window.localStorage.setItem('amc_newsletter_interest_v1', input.value.trim());
        } catch {}
        input.value = '';
      } else {
        feedback.className = 'js-newsletter-feedback mt-2 text-xs font-semibold leading-relaxed text-sale-ink';
        input.focus();
      }
    });
  });
}

function initFooterReveal(): void {
  if (prefersReducedMotion()) return;
  const footerInner = document.querySelector<HTMLElement>('[data-footer-reveal]');
  if (!footerInner) return;

  gsap.fromTo(
    footerInner,
    { y: 36, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: footerInner,
        start: 'top 90%',
        once: true,
      },
    }
  );
}
