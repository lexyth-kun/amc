import gsap from 'gsap';

let isTransitionRunning = false;

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
      duration: 0.5,
      ease: 'power4.inOut',
    })
      .add(() => {
        if (onMidpoint) void onMidpoint();
      })
      .to(curtain, {
        yPercent: -100,
        duration: 0.5,
        ease: 'power4.inOut',
      });
  });
}
