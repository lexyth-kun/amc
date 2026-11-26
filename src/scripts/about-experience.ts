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

interface BustSlice {
  y: number;
  rx: number;
  rz: number;
  yTilt?: number;
}

// Anatomical 3D silhouette slices (normalized coordinates) for futuristic wireframe hologram bust
const HOLO_BUST_SLICES: BustSlice[] = [
  { y: -1.04, rx: 0.14, rz: 0.14 },
  { y: -0.96, rx: 0.28, rz: 0.30 },
  { y: -0.84, rx: 0.37, rz: 0.41 },
  { y: -0.70, rx: 0.41, rz: 0.45 },
  { y: -0.54, rx: 0.40, rz: 0.44 },
  { y: -0.38, rx: 0.36, rz: 0.40 },
  { y: -0.24, rx: 0.29, rz: 0.33 },
  { y: -0.12, rx: 0.21, rz: 0.24 },
  { y: 0.0, rx: 0.19, rz: 0.20 },
  { y: 0.12, rx: 0.22, rz: 0.22 },
  { y: 0.24, rx: 0.38, rz: 0.26 },
  { y: 0.36, rx: 0.66, rz: 0.32 },
  { y: 0.48, rx: 0.86, rz: 0.37 },
  { y: 0.62, rx: 0.94, rz: 0.40 },
  { y: 0.78, rx: 0.96, rz: 0.41 },
  { y: 0.94, rx: 0.95, rz: 0.40 },
];

function initFounderHologram(): void {
  const card = document.getElementById('founder-hologram-card');
  const canvas = document.getElementById('founder-hologram-canvas') as HTMLCanvasElement | null;
  if (!card || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 360;
  let height = 380;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let visible = true;
  let rafId = 0;

  let autoYaw = 0.28;
  let targetOffsetYaw = 0;
  let targetPitch = -0.12;
  let currentOffsetYaw = 0;
  let currentPitch = -0.12;
  let scanPhase = 0;

  // Deterministic floating hologram voxel sparks
  const motes = Array.from({ length: 34 }, (_, idx) => ({
    angle: (idx * 2.39996) % (Math.PI * 2),
    radius: 0.48 + ((idx * 19) % 72) / 100,
    y: -1.1 + ((idx * 13) % 220) / 100,
    speed: 0.004 + (idx % 5) * 0.0018,
    size: 1.2 + (idx % 3) * 0.7,
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

  const project = (x: number, y: number, z: number, yaw: number, pitch: number) => {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const rx = x * cy - z * sy;
    const rz1 = x * sy + z * cy;

    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const ry = y * cp - rz1 * sp;
    const rz = y * sp + rz1 * cp;

    const camDist = 3.85;
    const scale = (Math.min(width, height) * 0.43) * (camDist / (camDist + rz));
    return {
      sx: width * 0.5 + rx * scale,
      sy: height * 0.48 + ry * scale,
      depth: rz,
      scale,
    };
  };

  const drawHologram = (now: number) => {
    ctx.clearRect(0, 0, width, height);

    if (!reduced) {
      autoYaw = 0.24 + Math.sin(now * 0.00055) * 0.34;
      scanPhase = (now * 0.00045) % 1;
    }

    currentOffsetYaw += (targetOffsetYaw - currentOffsetYaw) * 0.1;
    currentPitch += (targetPitch - currentPitch) * 0.1;

    const yaw = autoYaw + currentOffsetYaw;
    const pitch = currentPitch;

    // 1. Volumetric emitter light cone from base upward
    const emitterY = height * 0.87;
    const coneGrad = ctx.createLinearGradient(width * 0.5, emitterY, width * 0.5, height * 0.14);
    coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.36)');
    coneGrad.addColorStop(0.45, 'rgba(125, 211, 252, 0.12)');
    coneGrad.addColorStop(1, 'rgba(125, 211, 252, 0)');
    ctx.beginPath();
    ctx.moveTo(width * 0.32, emitterY);
    ctx.lineTo(width * 0.68, emitterY);
    ctx.lineTo(width * 0.86, height * 0.14);
    ctx.lineTo(width * 0.14, height * 0.14);
    ctx.closePath();
    ctx.fillStyle = coneGrad;
    ctx.fill();

    // 2. Concentric holographic emitter base pedestal rings
    const emitterRadii = [
      { rx: width * 0.30, ry: height * 0.055, alpha: 0.34, dash: [6, 6] },
      { rx: width * 0.22, ry: height * 0.04, alpha: 0.65, dash: [] },
      { rx: width * 0.12, ry: height * 0.022, alpha: 0.9, dash: [] },
    ];
    for (const ring of emitterRadii) {
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(ring.dash);
      ctx.ellipse(width * 0.5, emitterY, ring.rx, ring.ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125, 211, 252, ${ring.alpha})`;
      ctx.lineWidth = ring.dash.length ? 1.2 : 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // Emitter bright core glow
    const coreGlow = ctx.createRadialGradient(
      width * 0.5,
      emitterY,
      2,
      width * 0.5,
      emitterY,
      width * 0.28
    );
    coreGlow.addColorStop(0, 'rgba(224, 242, 254, 0.92)');
    coreGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.42)');
    coreGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.ellipse(width * 0.5, emitterY, width * 0.28, height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Tilted 3D holographic orbital ring surrounding the bust
    const orbitSegments = 48;
    ctx.beginPath();
    for (let i = 0; i <= orbitSegments; i++) {
      const a = (i / orbitSegments) * Math.PI * 2;
      const ox = Math.cos(a) * 1.18;
      const oz = Math.sin(a) * 1.18;
      const oy = Math.sin(a) * 0.24 - 0.12;
      const pt = project(ox, oy, oz, yaw * 0.8, pitch);
      if (i === 0) ctx.moveTo(pt.sx, pt.sy);
      else ctx.lineTo(pt.sx, pt.sy);
    }
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.28)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Orbiting telemetry node on the ring
    const nodeAngle = (now * 0.0012) % (Math.PI * 2);
    const nodePt = project(
      Math.cos(nodeAngle) * 1.18,
      Math.sin(nodeAngle) * 0.24 - 0.12,
      Math.sin(nodeAngle) * 1.18,
      yaw * 0.8,
      pitch
    );
    ctx.beginPath();
    ctx.arc(nodePt.sx, nodePt.sy, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(nodePt.sx, nodePt.sy, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fill();

    // 4. 3D Hologram Bust: Meridian wireframe ribs
    const ribs = 14;
    const scanY = -1.08 + scanPhase * 2.12;
    for (let r = 0; r < ribs; r++) {
      const a = (r / ribs) * Math.PI * 2;
      ctx.beginPath();
      let avgDepth = 0;
      for (let sIdx = 0; sIdx < HOLO_BUST_SLICES.length; sIdx++) {
        const sl = HOLO_BUST_SLICES[sIdx];
        const px = Math.cos(a) * sl.rx;
        const pz = Math.sin(a) * sl.rz;
        const pt = project(px, sl.y, pz, yaw, pitch);
        avgDepth += pt.depth;
        if (sIdx === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
      avgDepth /= HOLO_BUST_SLICES.length;
      const frontFactor = Math.max(0.18, Math.min(0.82, 0.52 - avgDepth * 0.35));
      ctx.strokeStyle = `rgba(56, 189, 248, ${(frontFactor * 0.55).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 5. 3D Hologram Bust: Horizontal latitude scan-slices + sweeping bright scan band
    const ringPoints = 32;
    for (const sl of HOLO_BUST_SLICES) {
      const distToScan = Math.abs(sl.y - scanY);
      const scanBoost = Math.max(0, 1 - distToScan / 0.28);

      ctx.beginPath();
      for (let k = 0; k <= ringPoints; k++) {
        const a = (k / ringPoints) * Math.PI * 2;
        const px = Math.cos(a) * sl.rx;
        const pz = Math.sin(a) * sl.rz;
        const pt = project(px, sl.y, pz, yaw, pitch);
        if (k === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }

      if (scanBoost > 0.15) {
        ctx.strokeStyle = `rgba(224, 242, 254, ${(0.55 + scanBoost * 0.45).toFixed(3)})`;
        ctx.lineWidth = 1.4 + scanBoost * 1.4;
      } else {
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.62)';
        ctx.lineWidth = 1.25;
      }
      ctx.stroke();

      // Luminous hologram vertices along each slice
      for (let k = 0; k < ringPoints; k += 4) {
        const a = (k / ringPoints) * Math.PI * 2;
        const pt = project(Math.cos(a) * sl.rx, sl.y, Math.sin(a) * sl.rz, yaw, pitch);
        if (pt.depth < 0.25) {
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, scanBoost > 0.2 ? 2.1 : 1.35, 0, Math.PI * 2);
          ctx.fillStyle =
            scanBoost > 0.2 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(186, 230, 253, 0.78)';
          ctx.fill();
        }
      }
    }

    // 6. Subtle Holographic Visor Accent across eye line (futuristic identity signature)
    ctx.beginPath();
    for (let k = 0; k <= 14; k++) {
      const a = -0.78 + (k / 14) * 1.56;
      const pt = project(Math.sin(a) * 0.42, -0.58, -Math.cos(a) * 0.46, yaw, pitch);
      if (k === 0) ctx.moveTo(pt.sx, pt.sy);
      else ctx.lineTo(pt.sx, pt.sy);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // 7. Rising holographic data motes
    for (const m of motes) {
      if (!reduced) {
        m.y -= m.speed;
        m.angle += 0.008;
        if (m.y < -1.18) m.y = 1.05;
      }
      const pt = project(
        Math.cos(m.angle) * m.radius,
        m.y,
        Math.sin(m.angle) * m.radius,
        yaw * 0.5,
        pitch
      );
      const fade = 1 - Math.abs(m.y) / 1.25;
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, m.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(125, 211, 252, ${Math.max(0.12, fade * 0.72).toFixed(3)})`;
      ctx.fill();
    }

    if (!reduced && visible) {
      rafId = window.requestAnimationFrame(drawHologram);
    }
  };

  resize();
  drawHologram(performance.now());

  if (reduced) return;

  card.addEventListener(
    'pointermove',
    (e) => {
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
      targetOffsetYaw = (nx - 0.5) * 1.15;
      targetPitch = -0.12 + (ny - 0.5) * 0.45;
      card.style.setProperty('--holo-x', `${(nx * 100).toFixed(1)}%`);
      card.style.setProperty('--holo-y', `${(ny * 100).toFixed(1)}%`);
      const tiltY = ((nx - 0.5) * 8).toFixed(2);
      const tiltX = ((0.5 - ny) * 7).toFixed(2);
      card.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    },
    { passive: true }
  );

  card.addEventListener('pointerleave', () => {
    targetOffsetYaw = 0;
    targetPitch = -0.12;
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
