import gsap from 'gsap';

let isTransitionRunning = false;

export interface ProductPortalPayload {
  title: string;
  category: string;
  image: string;
  logo: string;
  ts: number;
}

const PORTAL_STORAGE_KEY = 'amc_product_portal_v1';

export async function runPageTransition(onMidpoint?: () => void | Promise<void>): Promise<void> {
  const curtain = document.getElementById('page-transition-curtain');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!curtain || reduced || isTransitionRunning) {
    if (onMidpoint) await onMidpoint();
    return;
  }

  isTransitionRunning = true;
  curtain.hidden = false;
  curtain.style.pointerEvents = 'auto';

  await new Promise<void>((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(curtain, { clearProps: 'transform' });
        curtain.hidden = true;
        curtain.style.pointerEvents = 'none';
        isTransitionRunning = false;
        resolve();
      },
    });

    gsap.set(curtain, { yPercent: 100 });

    tl.to(curtain, {
      yPercent: 0,
      duration: 0.45,
      ease: 'power4.inOut',
    })
      .add(() => {
        if (onMidpoint) void onMidpoint();
      })
      .to(curtain, {
        yPercent: -100,
        duration: 0.48,
        ease: 'power4.inOut',
      });
  });
}

export async function runProductCardTransition(
  sourceEl: HTMLElement,
  payload: Omit<ProductPortalPayload, 'ts'>,
  onNavigate: () => void
): Promise<void> {
  const portal = document.getElementById('product-transition-portal');
  const heroImg = document.getElementById('portal-hero-img') as HTMLImageElement | null;
  const logoImg = document.getElementById('portal-logo-img') as HTMLImageElement | null;
  const logoWrap = document.getElementById('portal-logo-wrap');
  const categoryEl = document.getElementById('portal-category');
  const titleEl = document.getElementById('portal-title');
  const contentEl = document.getElementById('portal-content');
  const mainEl = document.getElementById('main-content');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!portal || !heroImg || !contentEl || reduced || isTransitionRunning) {
    onNavigate();
    return;
  }

  isTransitionRunning = true;

  try {
    window.sessionStorage.setItem(
      PORTAL_STORAGE_KEY,
      JSON.stringify({ ...payload, ts: Date.now() } satisfies ProductPortalPayload)
    );
  } catch {}

  const visualAnchor =
    sourceEl.querySelector<HTMLElement>('[data-card-visual]') ?? sourceEl;
  const rect = visualAnchor.getBoundingClientRect();
  const radius = getComputedStyle(visualAnchor).borderRadius || '24px';

  heroImg.src = payload.image;
  heroImg.alt = payload.title;
  if (logoImg && logoWrap) {
    if (payload.logo) {
      logoImg.src = payload.logo;
      logoImg.alt = `Logo ${payload.title}`;
      logoWrap.hidden = false;
    } else {
      logoWrap.hidden = true;
    }
  }
  if (categoryEl) categoryEl.textContent = payload.category;
  if (titleEl) titleEl.textContent = payload.title;

  portal.hidden = false;
  portal.style.pointerEvents = 'auto';

  gsap.killTweensOf([portal, heroImg, contentEl, mainEl]);
  gsap.set(portal, {
    top: rect.top,
    left: rect.left,
    width: Math.max(120, rect.width),
    height: Math.max(88, rect.height),
    borderRadius: radius,
    xPercent: 0,
    yPercent: 0,
    opacity: 1,
  });
  gsap.set(heroImg, { scale: 1.06 });
  gsap.set(contentEl, { opacity: 0, y: 26 });

  await new Promise<void>((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        onNavigate();
        resolve();
      },
    });

    if (mainEl) {
      tl.to(
        mainEl,
        {
          opacity: 0.25,
          scale: 0.985,
          duration: 0.36,
          ease: 'power3.inOut',
        },
        0
      );
    }

    tl.to(
      portal,
      {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 0.52,
        ease: 'power4.inOut',
      },
      0
    )
      .to(
        heroImg,
        {
          scale: 1,
          duration: 0.56,
          ease: 'power3.out',
        },
        0
      )
      .to(
        contentEl,
        {
          opacity: 1,
          y: 0,
          duration: 0.34,
          ease: 'power3.out',
        },
        0.18
      );
  });
}

export function finishProductPortalEntry(onRevealStart?: () => void): void {
  const portal = document.getElementById('product-transition-portal');
  const heroImg = document.getElementById('portal-hero-img') as HTMLImageElement | null;
  const logoImg = document.getElementById('portal-logo-img') as HTMLImageElement | null;
  const categoryEl = document.getElementById('portal-category');
  const titleEl = document.getElementById('portal-title');
  const contentEl = document.getElementById('portal-content');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stored: ProductPortalPayload | null = null;
  try {
    const raw = window.sessionStorage.getItem(PORTAL_STORAGE_KEY);
    if (raw) {
      window.sessionStorage.removeItem(PORTAL_STORAGE_KEY);
      const parsed = JSON.parse(raw) as ProductPortalPayload;
      if (parsed && typeof parsed.ts === 'number' && Date.now() - parsed.ts < 5000) {
        stored = parsed;
      }
    }
  } catch {}

  document.documentElement.classList.remove('amc-portal-entering');

  if (!stored || !portal || !heroImg || !contentEl || reduced) {
    if (portal) portal.hidden = true;
    onRevealStart?.();
    return;
  }

  heroImg.src = stored.image;
  heroImg.alt = stored.title;
  if (logoImg && stored.logo) {
    logoImg.src = stored.logo;
  }
  if (categoryEl) categoryEl.textContent = stored.category;
  if (titleEl) titleEl.textContent = stored.title;

  portal.hidden = false;
  portal.style.pointerEvents = 'auto';

  const isDesktop = window.innerWidth >= 1024;

  gsap.set(portal, {
    top: 0,
    left: 0,
    width: '100vw',
    height: '100dvh',
    borderRadius: 0,
    xPercent: 0,
    yPercent: 0,
    opacity: 1,
  });
  gsap.set(contentEl, { opacity: 1, y: 0 });

  gsap
    .timeline({
      onComplete: () => {
        portal.hidden = true;
        portal.style.pointerEvents = 'none';
        gsap.set(portal, { clearProps: 'all' });
        gsap.set(contentEl, { clearProps: 'all' });
      },
    })
    .to(contentEl, {
      opacity: 0,
      x: isDesktop ? 42 : 0,
      y: isDesktop ? 0 : -24,
      duration: 0.24,
      ease: 'power2.in',
    })
    .add(() => {
      onRevealStart?.();
    }, '-=0.06')
    .to(
      portal,
      {
        xPercent: isDesktop ? 100 : 0,
        yPercent: isDesktop ? 0 : -100,
        duration: 0.62,
        ease: 'power4.inOut',
      },
      '-=0.04'
    );
}
