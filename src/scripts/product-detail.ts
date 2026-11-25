import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis, prefersReducedMotion, splitElementIntoWords } from './motion-core';
import { finishProductPortalEntry } from './page-transition';
import {
  computeActivePanelIndex,
  computeDetailProgress,
  computeHorizontalScrollDistance,
} from '@/utils/product-detail-math';

gsap.registerPlugin(ScrollTrigger);

export function initProductDetailExperience(): void {
  const stage = document.getElementById('product-detail-stage');
  const track = document.getElementById('product-detail-track');
  if (!stage || !track) return;

  const panels = Array.from(track.querySelectorAll<HTMLElement>('[data-detail-panel]'));
  const chapterBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-chapter-btn]'));
  const progressFills = Array.from(document.querySelectorAll<HTMLElement>('[data-detail-progress-fill]'));
  const counterEl = document.getElementById('detail-panel-counter');
  const prevBtn = document.getElementById('detail-prev-btn');
  const nextBtn = document.getElementById('detail-next-btn');

  const reduced = prefersReducedMotion();
  let activePanelIndex = 0;

  const updateRailUI = (progress: number) => {
    const clamped = Math.max(0, Math.min(1, progress));
    progressFills.forEach((bar) => {
      bar.style.transform = `scaleX(${Math.max(0.02, clamped).toFixed(4)})`;
    });

    const nextIdx = computeActivePanelIndex(clamped, panels.length);
    activePanelIndex = nextIdx;
    if (counterEl) {
      counterEl.textContent = `${String(nextIdx + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
    }

    chapterBtns.forEach((btn, idx) => {
      const isCurrent = idx === nextIdx;
      btn.setAttribute('aria-current', isCurrent ? 'step' : 'false');
      btn.classList.toggle('bg-sky', isCurrent);
      btn.classList.toggle('text-[#082F49]', isCurrent);
      btn.classList.toggle('border-sky-deep', isCurrent);
      btn.classList.toggle('bg-white/90', !isCurrent);
      btn.classList.toggle('text-navy', !isCurrent);
      btn.classList.toggle('border-line', !isCurrent);
    });
  };

  const runOpeningHeroReveal = () => {
    if (reduced) return;

    const h1 = stage.querySelector<HTMLElement>('[data-detail-hero-title]');
    const heroClip = stage.querySelector<HTMLElement>('[data-detail-hero-clip]');
    const heroImg = heroClip?.querySelector<HTMLElement>('img');
    const heroItems = Array.from(stage.querySelectorAll<HTMLElement>('[data-detail-hero-item]'));

    if (h1) {
      const words = splitElementIntoWords(h1);
      gsap.fromTo(
        words,
        { yPercent: 110, rotate: 3 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.85,
          stagger: 0.045,
          ease: 'power4.out',
        }
      );
    }

    if (heroClip) {
      const isDesktop = window.innerWidth >= 1024;
      gsap.fromTo(
        heroClip,
        {
          clipPath: isDesktop
            ? 'inset(0% 100% 0% 0% round 24px)'
            : 'inset(0% 0% 100% 0% round 20px)',
        },
        {
          clipPath: isDesktop ? 'inset(0% 0% 0% 0% round 24px)' : 'inset(0% 0% 0% 0% round 20px)',
          duration: 0.95,
          ease: 'power4.out',
        }
      );
    }

    if (heroImg) {
      gsap.fromTo(
        heroImg,
        { scale: 1.12 },
        { scale: 1, duration: 1.08, ease: 'power3.out' }
      );
    }

    if (heroItems.length) {
      gsap.fromTo(
        heroItems,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.07,
          delay: 0.08,
          ease: 'power3.out',
        }
      );
    }
  };

  finishProductPortalEntry(runOpeningHeroReveal);

  if (reduced) {
    updateRailUI(0);
    return;
  }

  /**
   * Identical animation choreography shared between Desktop horizontal scroll
   * (containerAnimation) and Mobile vertical scroll (native ScrollTrigger).
   */
  const bindPanelChoreography = (containerAnimation?: gsap.core.Animation) => {
    const horizontal = Boolean(containerAnimation);
    const radius = horizontal ? '24px' : '20px';

    track.querySelectorAll<HTMLElement>('[data-detail-heading]').forEach((heading) => {
      const words = splitElementIntoWords(heading);
      if (!words.length) return;
      gsap.fromTo(
        words,
        { yPercent: 110, rotate: 3 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.85,
          stagger: 0.04,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: heading,
            containerAnimation,
            start: horizontal ? 'left 88%' : 'top 86%',
            once: true,
          },
        }
      );
    });

    track.querySelectorAll<HTMLElement>('[data-detail-clip]').forEach((frame) => {
      const img = frame.querySelector<HTMLElement>('[data-detail-parallax]');

      gsap.fromTo(
        frame,
        {
          clipPath: horizontal
            ? `inset(0% 100% 0% 0% round ${radius})`
            : `inset(0% 0% 100% 0% round ${radius})`,
        },
        {
          clipPath: `inset(0% 0% 0% 0% round ${radius})`,
          duration: 0.95,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: frame,
            containerAnimation,
            start: horizontal ? 'left 86%' : 'top 85%',
            once: true,
          },
        }
      );

      if (img) {
        gsap.fromTo(
          img,
          horizontal ? { xPercent: -6, scale: 1.1 } : { yPercent: -6, scale: 1.1 },
          {
            ...(horizontal ? { xPercent: 6, scale: 1.02 } : { yPercent: 6, scale: 1.02 }),
            ease: 'none',
            scrollTrigger: {
              trigger: frame,
              containerAnimation,
              start: horizontal ? 'left right' : 'top bottom',
              end: horizontal ? 'right left' : 'bottom top',
              scrub: 1,
            },
          }
        );
      }
    });

    track.querySelectorAll<HTMLElement>('[data-detail-stagger-group]').forEach((group) => {
      const items = Array.from(group.querySelectorAll<HTMLElement>('[data-detail-stagger]'));
      if (!items.length) return;
      gsap.fromTo(
        items,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.78,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: group,
            containerAnimation,
            start: horizontal ? 'left 84%' : 'top 84%',
            once: true,
          },
        }
      );
    });

    track.querySelectorAll<HTMLElement>('[data-detail-line]').forEach((line) => {
      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: line,
            containerAnimation,
            start: horizontal ? 'left 90%' : 'top 90%',
            end: horizontal ? 'left 45%' : 'top 45%',
            scrub: 0.8,
          },
        }
      );
    });
  };

  const mm = gsap.matchMedia();

  // DESKTOP (>= 1024px): Smooth rightward horizontal scroll driven by vertical wheel,
  // horizontal trackpad deltaX, chapter buttons, and Left/Right arrow keys.
  mm.add('(min-width: 1024px)', () => {
    const getDistance = () =>
      computeHorizontalScrollDistance(track.scrollWidth, window.innerWidth);

    const horizontalTween = gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        id: 'amc-product-horizontal',
        trigger: stage,
        pin: true,
        scrub: 0.9,
        start: 'top top',
        end: () => `+=${Math.max(1, getDistance())}`,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          updateRailUI(self.progress);
        },
      },
    });

    bindPanelChoreography(horizontalTween);

    const scrollToHorizontalProgress = (progress: number, immediate = false) => {
      const st = ScrollTrigger.getById('amc-product-horizontal');
      if (!st) return;
      const clamped = Math.max(0, Math.min(1, progress));
      const targetY = st.start + (st.end - st.start) * clamped;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(targetY, { immediate, duration: immediate ? 0 : 0.95 });
      } else {
        window.scrollTo({ top: targetY, behavior: immediate ? 'auto' : 'smooth' });
      }
      if (immediate) ScrollTrigger.update();
    };

    const scrollToPanelIndex = (index: number) => {
      const targetPanel = panels[Math.max(0, Math.min(panels.length - 1, index))];
      if (!targetPanel) return;
      const dist = getDistance();
      if (dist <= 0) return;
      const targetLeft = Math.max(0, targetPanel.offsetLeft - 48);
      scrollToHorizontalProgress(computeDetailProgress(targetLeft, dist));
    };

    // Forward sideways trackpad gestures (deltaX) smoothly into horizontal progression
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
        e.preventDefault();
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(lenis.scroll + e.deltaX * 1.25, { immediate: true });
        } else {
          window.scrollBy(0, e.deltaX * 1.25);
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToPanelIndex(activePanelIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToPanelIndex(activePanelIndex - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const chapterCleanups: Array<() => void> = [];
    chapterBtns.forEach((btn, idx) => {
      const handler = () => scrollToPanelIndex(idx);
      btn.addEventListener('click', handler);
      chapterCleanups.push(() => btn.removeEventListener('click', handler));
    });

    const onPrev = () => scrollToPanelIndex(activePanelIndex - 1);
    const onNext = () => scrollToPanelIndex(activePanelIndex + 1);
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);

    (
      window as Window & { __amcDetailScrollToProgress?: (p: number) => void }
    ).__amcDetailScrollToProgress = (p: number) => scrollToHorizontalProgress(p, true);

    updateRailUI(0);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      chapterCleanups.forEach((fn) => fn());
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      gsap.set(track, { clearProps: 'transform' });
    };
  });

  // MOBILE & TABLET (< 1024px): Normal vertical scroll downward with the EXACT SAME animations
  mm.add('(max-width: 1023px)', () => {
    bindPanelChoreography(undefined);

    const syncMobileProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      updateRailUI(computeDetailProgress(window.scrollY || 0, maxScroll));
    };

    window.addEventListener('scroll', syncMobileProgress, { passive: true });
    syncMobileProgress();

    return () => {
      window.removeEventListener('scroll', syncMobileProgress);
    };
  });
}
