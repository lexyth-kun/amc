import gsap from 'gsap';
import { prefersReducedMotion } from './motion-core';

export function initPreloader(onCompleteCallback?: () => void): void {
  const preloader = document.getElementById('amc-preloader');
  const counterEl = document.getElementById('preloader-counter');
  const barEl = document.getElementById('preloader-bar');
  const flightLogo = document.getElementById('preloader-logo-flight');
  const headerLogo = document.getElementById('header-brand-logo');

  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    if (preloader) {
      preloader.style.display = 'none';
      preloader.setAttribute('aria-hidden', 'true');
    }
    window.dispatchEvent(new CustomEvent('amc:preloader-complete'));
    onCompleteCallback?.();
  };

  if (!preloader || !counterEl || !barEl || prefersReducedMotion()) {
    finish();
    return;
  }

  // Hard safety ceiling < 1.8s per section 5.0
  const safetyTimer = window.setTimeout(finish, 1720);

  const state = { val: 0 };
  const tl = gsap.timeline({
    onComplete: () => {
      window.clearTimeout(safetyTimer);
      finish();
    },
  });

  tl.to(state, {
    val: 100,
    duration: 1.05,
    ease: 'power2.inOut',
    onUpdate: () => {
      counterEl.textContent = String(Math.round(state.val));
    },
  })
    .to(
      barEl,
      {
        scaleX: 1,
        duration: 1.05,
        ease: 'power2.inOut',
      },
      0
    )
    .add(() => {
      if (!flightLogo || !headerLogo) return;
      const fromRect = flightLogo.getBoundingClientRect();
      const toRect = headerLogo.getBoundingClientRect();
      const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
      const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
      const scale = toRect.width / Math.max(1, fromRect.width);

      gsap.to(flightLogo, {
        x: dx,
        y: dy,
        scale,
        duration: 0.52,
        ease: 'power3.inOut',
      });
    })
    .to(
      preloader,
      {
        yPercent: -100,
        duration: 0.62,
        ease: 'power4.inOut',
      },
      '-=0.05'
    );
}
