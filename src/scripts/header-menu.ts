import gsap from 'gsap';
import { getLenis, prefersReducedMotion, scrollToAnchor } from './motion-core';
import { runPageTransition } from './page-transition';

export function initHeaderAndMenu(): void {
  const backdrop = document.getElementById('header-backdrop');
  const inner = document.getElementById('header-inner');
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const overlay = document.getElementById('menu-overlay');

  let isScrolled = false;
  const syncHeader = () => {
    const nextScrolled = window.scrollY > 80;
    if (nextScrolled === isScrolled) return;
    isScrolled = nextScrolled;
    if (backdrop) {
      backdrop.style.opacity = isScrolled ? '1' : '0';
    }
    if (inner) {
      inner.style.transform = isScrolled ? 'translate3d(0, -6px, 0) scale(0.97)' : 'translate3d(0, 0, 0) scale(1)';
    }
  };

  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  if (!toggleBtn || !closeBtn || !overlay) return;

  const staggerItems = Array.from(overlay.querySelectorAll<HTMLElement>('.menu-stagger-item'));
  let isOpen = false;

  const openMenu = () => {
    if (isOpen) return;
    isOpen = true;
    overlay.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    getLenis()?.stop();
    document.body.style.overflow = 'hidden';

    if (!prefersReducedMotion()) {
      gsap.killTweensOf([overlay, ...staggerItems]);
      gsap.set(overlay, { yPercent: -8, opacity: 0 });
      gsap.set(staggerItems, { y: 60, opacity: 0 });
      gsap.to(overlay, { yPercent: 0, opacity: 1, duration: 0.38, ease: 'power3.out' });
      gsap.to(staggerItems, {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.07,
        delay: 0.08,
        ease: 'power4.out',
      });
    }

    window.setTimeout(() => closeBtn.focus(), 60);
  };

  const closeMenu = (restoreFocus = true): Promise<void> => {
    if (!isOpen) return Promise.resolve();
    isOpen = false;
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    getLenis()?.start();

    if (prefersReducedMotion()) {
      overlay.hidden = true;
      if (restoreFocus) toggleBtn.focus();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      gsap.killTweensOf([overlay, ...staggerItems]);
      gsap
        .timeline({
          onComplete: () => {
            overlay.hidden = true;
            gsap.set([overlay, ...staggerItems], { clearProps: 'all' });
            if (restoreFocus) toggleBtn.focus();
            resolve();
          },
        })
        .to(staggerItems, {
          y: 36,
          opacity: 0,
          duration: 0.25,
          stagger: 0.03,
          ease: 'power2.in',
        })
        .to(
          overlay,
          {
            yPercent: -100,
            duration: 0.42,
            ease: 'power4.inOut',
          },
          '-=0.08'
        );
    });
  };

  toggleBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', () => void closeMenu(true));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      void closeMenu(true);
    }
  });

  overlay.querySelectorAll<HTMLAnchorElement>('[data-overlay-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.dataset.overlayLink;
      if (!href) return;
      e.preventDefault();
      void runPageTransition(async () => {
        await closeMenu(false);
        if (href.startsWith('#')) {
          scrollToAnchor(href);
        } else {
          window.location.href = href;
        }
      });
    });
  });
}
