import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  computeReviewDeckFlipState,
  waveIndexToScrollProgress,
} from '@/utils/about-interactive';

gsap.registerPlugin(ScrollTrigger);

interface ReviewItemData {
  author: string;
  service: string;
  logo: string;
  rating: number;
  date: string;
  source: string;
  quote: string;
}

interface ReviewWaveData {
  id: string;
  code: string;
  letter: string;
  shortLabel: string;
  label: string;
  summary: string;
  href: string;
  reviews: ReviewItemData[];
}

function createHologramPortraitTexture(
  img: HTMLImageElement,
  tint: 'primary' | 'ghost'
): HTMLCanvasElement {
  const outW = 380;
  const outH = 440;
  const off = document.createElement('canvas');
  off.width = outW;
  off.height = outH;
  const octx = off.getContext('2d');
  if (!octx) return off;

  // Cover-fit portrait centered cleanly on Adrian's face & shoulders
  const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  const boxAspect = outW / outH;
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (imgAspect > boxAspect) {
    sw = img.naturalHeight * boxAspect;
    sx = (img.naturalWidth - sw) * 0.5;
  } else {
    sh = img.naturalWidth / boxAspect;
    sy = (img.naturalHeight - sh) * 0.12;
  }

  octx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
  const frame = octx.getImageData(0, 0, outW, outH);
  const data = frame.data;

  const cx = outW * 0.5;
  const cy = outH * 0.46;

  for (let y = 0; y < outH; y++) {
    const scanStripe = y % 3 === 0 ? 0.80 : 1.06;
    const ny = (y - cy) / (outH * 0.48);
    for (let x = 0; x < outW; x++) {
      const idx = (y * outW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Perceptual luminance with crisp S-curve portrait contrast
      let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      lum = Math.max(0, Math.min(1, (lum - 0.08) * 1.18));
      const curved = Math.pow(lum, 0.88) * scanStripe;

      // Soft radial hologram vignette mask + gentle fade at bottom emitter merge
      const nx = (x - cx) / (outW * 0.45);
      const radialDist = Math.sqrt(nx * nx * 1.08 + ny * ny * 0.92);
      const edgeFade = Math.max(0, Math.min(1, 1 - Math.max(0, radialDist - 0.62) / 0.38));
      const bottomFade = y > outH * 0.78 ? Math.max(0, 1 - (y - outH * 0.78) / (outH * 0.22)) : 1;
      const maskAlpha = edgeFade * bottomFade;

      if (tint === 'primary') {
        // Luminous Lusion Sky Blue / Cyan Hologram ramp
        data[idx] = Math.min(255, Math.round(14 + Math.pow(curved, 1.55) * 215));
        data[idx + 1] = Math.min(255, Math.round(78 + curved * 176));
        data[idx + 2] = Math.min(255, Math.round(138 + curved * 117));
        data[idx + 3] = Math.round(Math.min(1, (0.28 + curved * 0.78) * maskAlpha) * 255);
      } else {
        // Chromatic cyan-indigo parallax echo ghost
        data[idx] = Math.min(255, Math.round(92 + curved * 130));
        data[idx + 1] = Math.min(255, Math.round(188 + curved * 67));
        data[idx + 2] = 255;
        data[idx + 3] = Math.round(Math.min(1, curved * 0.42 * maskAlpha) * 255);
      }
    }
  }

  octx.putImageData(frame, 0, 0);
  return off;
}

function initFounderHologram(): void {
  const card = document.getElementById('founder-hologram-card');
  const canvas = document.getElementById('founder-hologram-canvas') as HTMLCanvasElement | null;
  if (!card || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const photoSrc = canvas.dataset.photoSrc || '';
  let width = 360;
  let height = 380;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let visible = true;
  let rafId = 0;

  let targetNx = 0;
  let targetNy = 0;
  let currentNx = 0;
  let currentNy = 0;

  let primaryHoloTex: HTMLCanvasElement | null = null;
  let ghostHoloTex: HTMLCanvasElement | null = null;

  // Deterministic floating hologram data motes
  const motes = Array.from({ length: 30 }, (_, idx) => ({
    x: ((idx * 37) % 100) / 100,
    y: ((idx * 23) % 100) / 100,
    speed: 0.0022 + (idx % 5) * 0.0009,
    size: 1.1 + (idx % 3) * 0.65,
    phase: idx * 0.7,
  }));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(260, rect.width);
    height = Math.max(280, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawHologram = (now: number) => {
    ctx.clearRect(0, 0, width, height);

    currentNx += (targetNx - currentNx) * 0.1;
    currentNy += (targetNy - currentNy) * 0.1;

    const t = now * 0.001;
    const scanPhase = reduced ? 0.36 : (t * 0.32) % 1;
    const emitterY = height * 0.90;

    // 1. Volumetric upward projection light cone from hologram emitter
    const coneGrad = ctx.createLinearGradient(width * 0.5, emitterY, width * 0.5, height * 0.06);
    coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.36)');
    coneGrad.addColorStop(0.42, 'rgba(125, 211, 252, 0.11)');
    coneGrad.addColorStop(1, 'rgba(125, 211, 252, 0)');
    ctx.beginPath();
    ctx.moveTo(width * 0.28, emitterY);
    ctx.lineTo(width * 0.72, emitterY);
    ctx.lineTo(width * 0.94, height * 0.06);
    ctx.lineTo(width * 0.06, height * 0.06);
    ctx.closePath();
    ctx.fillStyle = coneGrad;
    ctx.fill();

    // 2. Concentric holographic emitter base pedestal rings
    const emitterRadii = [
      { rx: width * 0.34, ry: height * 0.052, alpha: 0.36, dash: [6, 6] },
      { rx: width * 0.24, ry: height * 0.036, alpha: 0.65, dash: [] },
      { rx: width * 0.13, ry: height * 0.020, alpha: 0.9, dash: [] },
    ];
    for (const ring of emitterRadii) {
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(ring.dash);
      ctx.ellipse(width * 0.5, emitterY, ring.rx, ring.ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125, 211, 252, ${ring.alpha})`;
      ctx.lineWidth = ring.dash.length ? 1.2 : 1.7;
      ctx.stroke();
      ctx.restore();
    }

    const coreGlow = ctx.createRadialGradient(
      width * 0.5,
      emitterY,
      2,
      width * 0.5,
      emitterY,
      width * 0.30
    );
    coreGlow.addColorStop(0, 'rgba(224, 242, 254, 0.92)');
    coreGlow.addColorStop(0.38, 'rgba(56, 189, 248, 0.42)');
    coreGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.ellipse(width * 0.5, emitterY, width * 0.30, height * 0.058, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Subtle background holographic orbital telemetry ellipse
    ctx.save();
    ctx.translate(width * 0.5 + currentNx * 6, height * 0.46 + currentNy * 4);
    ctx.rotate(-0.16 + currentNx * 0.08);
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 0.43, height * 0.14, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.26)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    const orbitA = reduced ? 0.5 : t * 1.15;
    const nodeX = Math.cos(orbitA) * width * 0.43;
    const nodeY = Math.sin(orbitA) * height * 0.14;
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
    ctx.fill();
    ctx.restore();

    // 4. Adrian Ali Muthi's Real Hologram Portrait Projection
    if (primaryHoloTex && ghostHoloTex) {
      const floatY = reduced ? 0 : Math.sin(t * 1.7) * 3.5;
      const drawH = height * 0.88;
      const drawW = drawH * (primaryHoloTex.width / primaryHoloTex.height);
      const baseX = (width - drawW) * 0.5 + currentNx * 10;
      const baseY = height * 0.03 + floatY + currentNy * 7;

      const splitX = 4 + Math.abs(currentNx) * 6;
      const flicker = reduced ? 1 : 0.92 + Math.sin(t * 11) * 0.035 + Math.cos(t * 17) * 0.025;

      // Chromatic cyan-lilac holographic echo layer
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.55 * flicker;
      ctx.drawImage(ghostHoloTex, baseX + splitX, baseY - 1, drawW, drawH);
      ctx.globalAlpha = 0.34 * flicker;
      ctx.drawImage(ghostHoloTex, baseX - splitX * 0.7, baseY + 1, drawW, drawH);

      // Primary sharp cyan hologram portrait
      ctx.globalAlpha = 0.96 * flicker;
      ctx.drawImage(primaryHoloTex, baseX, baseY, drawW, drawH);

      // Subtle holographic glitch-slice offset during scan wave
      if (!reduced) {
        const glitchY = Math.floor(scanPhase * primaryHoloTex.height);
        const sliceH = 18;
        if (glitchY > 12 && glitchY < primaryHoloTex.height - 24) {
          const destY = baseY + (glitchY / primaryHoloTex.height) * drawH;
          const destH = (sliceH / primaryHoloTex.height) * drawH;
          const jitterX = Math.sin(t * 28) * 5.5;
          ctx.globalAlpha = 0.65;
          ctx.drawImage(
            primaryHoloTex,
            0,
            glitchY,
            primaryHoloTex.width,
            sliceH,
            baseX + jitterX,
            destY,
            drawW,
            destH
          );
        }
      }
      ctx.restore();
    }

    // 5. Sweeping luminous horizontal holographic scanner laser bar
    const scanBarY = height * (0.08 + scanPhase * 0.78);
    const barGrad = ctx.createLinearGradient(0, scanBarY - 22, 0, scanBarY + 22);
    barGrad.addColorStop(0, 'rgba(125, 211, 252, 0)');
    barGrad.addColorStop(0.45, 'rgba(125, 211, 252, 0.22)');
    barGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.68)');
    barGrad.addColorStop(0.55, 'rgba(125, 211, 252, 0.22)');
    barGrad.addColorStop(1, 'rgba(125, 211, 252, 0)');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, scanBarY - 22, width, 44);

    // 6. Rising holographic light motes around the portrait
    for (const m of motes) {
      if (!reduced) {
        m.y -= m.speed;
        if (m.y < 0.04) m.y = 0.92;
      }
      const mx = m.x * width + Math.sin(t * 1.4 + m.phase) * 8 + currentNx * 6;
      const my = m.y * height;
      const fade = Math.sin(m.y * Math.PI);
      ctx.beginPath();
      ctx.arc(mx, my, m.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 230, 253, ${Math.max(0.12, fade * 0.72).toFixed(3)})`;
      ctx.fill();
    }

    if (!reduced && visible) {
      rafId = window.requestAnimationFrame(drawHologram);
    }
  };

  resize();

  if (photoSrc) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      primaryHoloTex = createHologramPortraitTexture(img, 'primary');
      ghostHoloTex = createHologramPortraitTexture(img, 'ghost');
      canvas.dataset.hologramPhotoLoaded = 'true';
      drawHologram(performance.now());
    };
    img.src = photoSrc;
  }

  drawHologram(performance.now());

  if (reduced) return;

  card.addEventListener(
    'pointermove',
    (e) => {
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
      targetNx = (nx - 0.5) * 2;
      targetNy = (ny - 0.5) * 2;
      card.style.setProperty('--holo-x', `${(nx * 100).toFixed(1)}%`);
      card.style.setProperty('--holo-y', `${(ny * 100).toFixed(1)}%`);
      const tiltY = ((nx - 0.5) * 9).toFixed(2);
      const tiltX = ((0.5 - ny) * 8).toFixed(2);
      card.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    },
    { passive: true }
  );

  card.addEventListener('pointerleave', () => {
    targetNx = 0;
    targetNy = 0;
    card.style.setProperty('--holo-x', '50%');
    card.style.setProperty('--holo-y', '42%');
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
  });

  const io = new IntersectionObserver(
    (entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
      if (visible) {
        window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(drawHologram);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  window.addEventListener('resize', resize);
  rafId = window.requestAnimationFrame(drawHologram);
}

function populateCardFace(faceEl: HTMLElement, review: ReviewItemData, wave: ReviewWaveData): void {
  const logoImg = faceEl.querySelector<HTMLImageElement>('[data-face-logo]');
  const serviceEl = faceEl.querySelector<HTMLElement>('[data-face-service]');
  const waveCodeEl = faceEl.querySelector<HTMLElement>('[data-face-code]');
  const quoteEl = faceEl.querySelector<HTMLElement>('[data-face-quote]');
  const authorEl = faceEl.querySelector<HTMLElement>('[data-face-author]');
  const sourceEl = faceEl.querySelector<HTMLElement>('[data-face-source]');
  const dateEl = faceEl.querySelector<HTMLElement>('[data-face-date]');

  if (logoImg) {
    if (logoImg.getAttribute('src') !== review.logo) {
      logoImg.setAttribute('src', review.logo);
    }
    logoImg.setAttribute('alt', `Logo ${review.service}`);
  }
  if (serviceEl) serviceEl.textContent = review.service;
  if (waveCodeEl) waveCodeEl.textContent = `${wave.code} / 03`;
  if (quoteEl) quoteEl.textContent = `"${review.quote}"`;
  if (authorEl) authorEl.textContent = review.author;
  if (sourceEl) sourceEl.textContent = review.source;
  if (dateEl) dateEl.textContent = review.date;
}

function initReviewFlipDeck(): void {
  const section = document.getElementById('ulasan-layanan');
  const stage = document.getElementById('review-deck-stage');
  const dataEl = document.getElementById('about-review-waves-data');
  if (!section || !stage || !dataEl) return;

  let waves: ReviewWaveData[] = [];
  try {
    waves = JSON.parse(dataEl.textContent || '[]') as ReviewWaveData[];
  } catch {
    return;
  }
  if (waves.length < 3) return;

  const slots = Array.from(section.querySelectorAll<HTMLElement>('[data-review-slot]'));
  const tabs = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-review-wave-tab]'));
  const waveLabelEl = document.getElementById('review-deck-active-label');
  const waveSummaryEl = document.getElementById('review-deck-active-summary');
  const waveLinkEl = document.getElementById('review-deck-active-link') as HTMLAnchorElement | null;
  const progressBar = document.getElementById('review-deck-progress-bar');

  const frontCache: Array<number> = [-1, -1, -1];
  const backCache: Array<number> = [-1, -1, -1];
  let lastActiveWave = -1;

  const applyDeckProgress = (progress: number, smoothTransition = false) => {
    const state = computeReviewDeckFlipState(progress, slots.length);
    section.dataset.activeWave = String(state.activeWaveIndex);
    section.dataset.activeWaveId = waves[state.activeWaveIndex]?.id ?? '';

    slots.forEach((slot, idx) => {
      const cardState = state.cards[idx];
      const flipEl = slot.querySelector<HTMLElement>('[data-flip-card]');
      const frontEl = slot.querySelector<HTMLElement>('[data-flip-front]');
      const backEl = slot.querySelector<HTMLElement>('[data-flip-back]');
      const sheenEl = slot.querySelector<HTMLElement>('[data-flip-sheen]');

      if (frontEl && frontCache[idx] !== cardState.frontWaveIndex) {
        const wave = waves[cardState.frontWaveIndex];
        const review = wave?.reviews[idx];
        if (wave && review) {
          populateCardFace(frontEl, review, wave);
          frontCache[idx] = cardState.frontWaveIndex;
        }
      }

      if (backEl && backCache[idx] !== cardState.backWaveIndex) {
        const wave = waves[cardState.backWaveIndex];
        const review = wave?.reviews[idx];
        if (wave && review) {
          populateCardFace(backEl, review, wave);
          backCache[idx] = cardState.backWaveIndex;
        }
      }

      if (flipEl) {
        flipEl.classList.toggle('is-smooth-flip', smoothTransition);
        flipEl.style.transform = `translate3d(0, ${(-cardState.liftPx * 0.35).toFixed(1)}px, ${cardState.liftPx.toFixed(1)}px) rotateY(${cardState.angleDeg.toFixed(2)}deg)`;
        flipEl.dataset.flipAngle = String(Math.round(cardState.angleDeg));
      }

      if (sheenEl) {
        sheenEl.style.opacity = cardState.sheenOpacity.toFixed(3);
      }
    });

    if (lastActiveWave !== state.activeWaveIndex) {
      lastActiveWave = state.activeWaveIndex;
      const activeWave = waves[state.activeWaveIndex];
      if (activeWave) {
        if (waveLabelEl) {
          waveLabelEl.textContent = `${activeWave.code} / 03 • ${activeWave.label}`;
        }
        if (waveSummaryEl) {
          waveSummaryEl.textContent = activeWave.summary;
        }
        if (waveLinkEl) {
          waveLinkEl.setAttribute('href', activeWave.href);
          waveLinkEl.textContent = `Lihat detail ${activeWave.shortLabel} →`;
        }
      }

      tabs.forEach((tab, idx) => {
        const isActive = idx === state.activeWaveIndex;
        tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        tab.classList.toggle('is-active', isActive);
      });
    }

    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.max(0.08, state.progress).toFixed(4)})`;
    }
  };

  // Seed initial Wave 0 (Adobe CC) on front, Wave 1 (ChatGPT/Claude/Gemini) on hidden back
  applyDeckProgress(waveIndexToScrollProgress(0), false);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.innerWidth >= 1024;
  let scrollTriggerInstance: ScrollTrigger | null = null;

  if (!reduced && isDesktop) {
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: section,
      pin: stage,
      start: 'top top',
      end: '+=210%',
      scrub: 0.85,
      onUpdate: (self) => {
        applyDeckProgress(self.progress, false);
      },
    });
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      const waveIdx = (idx === 0 ? 0 : idx === 1 ? 1 : 2) as 0 | 1 | 2;
      const targetProgress = waveIndexToScrollProgress(waveIdx);
      if (scrollTriggerInstance) {
        const targetScrollY =
          scrollTriggerInstance.start +
          (scrollTriggerInstance.end - scrollTriggerInstance.start) * targetProgress;
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      } else {
        applyDeckProgress(targetProgress, !reduced);
      }
    });
  });
}

export function initAboutExperience(): void {
  initFounderHologram();
  initReviewFlipDeck();
}
