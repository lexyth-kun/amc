import { prefersReducedMotion } from './motion-core';

type PreloaderWindow = Window & {
  __amcPreloaderDone?: boolean;
};

export function initPreloader(onCompleteCallback?: () => void): void {
  const win = window as PreloaderWindow;
  if (prefersReducedMotion() || win.__amcPreloaderDone) {
    onCompleteCallback?.();
    return;
  }

  window.addEventListener(
    'amc:preloader-complete',
    () => {
      onCompleteCallback?.();
    },
    { once: true }
  );
}
