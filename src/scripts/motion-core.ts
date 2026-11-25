import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function splitElementIntoWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.splitReady === 'true') {
    return Array.from(el.querySelectorAll<HTMLElement>('.word-inner'));
  }

  const innerSpans: HTMLElement[] = [];

  const processNode = (node: Node): DocumentFragment => {
    const frag = document.createDocumentFragment();
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      const tokens = text.split(/(\s+)/);
      for (const token of tokens) {
        if (!token) continue;
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(' '));
        } else {
          const mask = document.createElement('span');
          mask.className = 'word-mask';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = token;
          mask.appendChild(inner);
          frag.appendChild(mask);
          innerSpans.push(inner);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const orig = node as HTMLElement;
      const text = orig.textContent ?? '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      words.forEach((word, idx) => {
        const mask = document.createElement('span');
        mask.className = 'word-mask';
        const clone = orig.cloneNode(false) as HTMLElement;
        clone.classList.add('word-inner');
        clone.textContent = word;
        mask.appendChild(clone);
        frag.appendChild(mask);
        innerSpans.push(clone);
        if (idx < words.length - 1) {
          frag.appendChild(document.createTextNode(' '));
        }
      });
    }
    return frag;
  };

  const children = Array.from(el.childNodes);
  el.innerHTML = '';
  for (const child of children) {
    el.appendChild(processNode(child));
  }
  el.dataset.splitReady = 'true';
  return innerSpans;
}

export function scrollToAnchor(selector: string): void {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;

  if (lenisInstance && !prefersReducedMotion()) {
    lenisInstance.scrollTo(target, { offset: -76, duration: 1.15 });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

export function initMotionCore(): void {
  const reduced = prefersReducedMotion();

  document.querySelectorAll<HTMLAnchorElement>('[data-scroll-to]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const selector = anchor.dataset.scrollTo;
      if (!selector || !selector.startsWith('#')) return;
      const target = document.querySelector(selector);
      if (!target) return;
      e.preventDefault();
      scrollToAnchor(selector);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-marquee-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.marqueeToggle;
      const wrap = id ? document.getElementById(id) : null;
      if (!wrap) return;
      const paused = wrap.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      if (id === 'hero-logo-marquee') {
        (window as Window & { __amcHeroPaused?: boolean }).__amcHeroPaused = paused;
        window.dispatchEvent(new CustomEvent('amc:hero-pause', { detail: { paused } }));
        btn.setAttribute(
          'aria-label',
          paused
            ? 'Putar animasi hero dan daftar logo produk'
            : 'Jeda animasi hero dan daftar logo produk'
        );
      } else {
        btn.setAttribute(
          'aria-label',
          paused ? 'Putar animasi teks produk' : 'Jeda animasi teks produk'
        );
      }
    });
  });

  if (reduced) {
    return;
  }

  const isFinePointerDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isFinePointerDesktop) {
    lenisInstance = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenisInstance.on('scroll', () => {
      ScrollTrigger.update();
      window.dispatchEvent(new Event('amc:scroll-sync'));
    });
    gsap.ticker.add((time) => {
      lenisInstance?.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  (window as Window & { __amcScrollTo?: (y: number) => void }).__amcScrollTo = (y: number) => {
    if (lenisInstance) {
      lenisInstance.scrollTo(y, { immediate: true });
    } else {
      window.scrollTo(0, y);
    }
    ScrollTrigger.update();
    window.dispatchEvent(new Event('amc:scroll-sync'));
  };

  // Hero split-text on desktop; on mobile keep H1 immediately painted for < 2.0s LCP
  const heroHeading = document.getElementById('hero-heading');
  const heroFadeEls = gsap.utils.toArray<HTMLElement>('[data-hero-fade]');

  if (heroHeading && isFinePointerDesktop) {
    const heroWords = splitElementIntoWords(heroHeading);
    const runReveal = () => {
      gsap.fromTo(
        heroWords,
        { yPercent: 110, rotate: 4 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.85,
          stagger: 0.045,
          ease: 'power4.out',
        }
      );
      gsap.fromTo(
        heroFadeEls,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.12,
          delay: 0.14,
          ease: 'power3.out',
        }
      );
    };

    const win = window as Window & { __amcPreloaderRevealed?: boolean; __amcPreloaderDone?: boolean };
    if (win.__amcPreloaderRevealed || win.__amcPreloaderDone) {
      runReveal();
    } else {
      gsap.set(heroWords, { yPercent: 110, rotate: 4 });
      gsap.set(heroFadeEls, { y: 24, opacity: 0 });
      window.addEventListener('amc:preloader-reveal', runReveal, { once: true });
    }
  }

  // Defer below-the-fold ScrollTrigger registration to next idle frame to avoid a single boot long-task
  window.setTimeout(() => {
    const heroSection = document.getElementById('hero');
    const heroCanvasWrap = document.getElementById('hero-canvas-wrap');
    const heroCopy = document.getElementById('hero-copy');

    if (heroSection && heroCanvasWrap && heroCopy) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.1,
          },
        })
        .to(heroCanvasWrap, { scale: 0.96, opacity: 0.35, ease: 'none' }, 0)
        .to(heroCopy, { y: -60, opacity: 0.18, ease: 'none' }, 0);
    }

    document.querySelectorAll<HTMLElement>('[data-split-words]:not(#hero-heading)').forEach((el) => {
      const words = splitElementIntoWords(el);
      if (!words.length) return;
      gsap.set(words, { yPercent: 110, rotate: 4 });
      gsap.to(words, {
        yPercent: 0,
        rotate: 0,
        duration: 0.9,
        stagger: 0.045,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true,
        },
      });
    });

    document.querySelectorAll<HTMLElement>('[data-blue-line]').forEach((line) => {
      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: line,
            start: 'top 88%',
            end: 'top 48%',
            scrub: 1,
          },
        }
      );
    });

    document.querySelectorAll<HTMLElement>('[data-bg-color]').forEach((section) => {
      const color = section.dataset.bgColor;
      if (!color) return;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 58%',
        end: 'bottom 58%',
        onEnter: () =>
          gsap.to(document.body, { backgroundColor: color, duration: 0.28, overwrite: 'auto' }),
        onEnterBack: () =>
          gsap.to(document.body, { backgroundColor: color, duration: 0.28, overwrite: 'auto' }),
      });
    });
  }, 60);

  initCustomCursor();
  initMagneticButtons();
}

function initCustomCursor(): void {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer) return;

  const dot = document.getElementById('amc-cursor-dot');
  const ring = document.getElementById('amc-cursor-ring');
  if (!dot || !ring) return;

  let mx = -100;
  let my = -100;
  let rx = -100;
  let ry = -100;
  let scale = 1;
  let targetScale = 1;
  let active = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      if (!active) {
        active = true;
        rx = mx;
        ry = my;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    },
    { passive: true }
  );

  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const isInput = Boolean(target.closest('input, textarea, select'));
    if (isInput) {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      return;
    }
    if (active) {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
    const interactive = Boolean(target.closest('a, button, [role="button"], summary'));
    targetScale = interactive ? 1.6 : 1;
  });

  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      active = false;
    }
  });

  gsap.ticker.add(() => {
    if (!active) return;
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    scale += (targetScale - scale) * 0.18;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
  });
}

export function clampMagneticOffset(delta: number, maxPx = 6): number {
  return Math.max(-maxPx, Math.min(maxPx, delta));
}

function initMagneticButtons(): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const dx = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 6;
      const dy = ((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 6;
      gsap.to(el, {
        x: clampMagneticOffset(dx, 6),
        y: clampMagneticOffset(dy, 6),
        duration: 0.25,
        ease: 'power2.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'elastic.out(1, 0.4)',
      });
    });
  });
}
