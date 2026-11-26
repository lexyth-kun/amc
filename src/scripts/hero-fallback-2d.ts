const PALETTE = [
  { main: '#FFFFFF', edge: '#BAE6FD', detail: '#0284C7' },
  { main: '#7DD3FC', edge: '#38BDF8', detail: '#082F49' },
  { main: '#38BDF8', edge: '#0284C7', detail: '#FFFFFF' },
] as const;

type FallbackIconKind = 'robot' | 'editing' | 'gamepad' | 'buzzer' | 'streaming' | 'shield';
const ICON_KINDS: FallbackIconKind[] = [
  'robot',
  'editing',
  'gamepad',
  'buzzer',
  'streaming',
  'shield',
];

interface HeroIcon2D {
  nx: number;
  ny: number;
  size: number;
  rot: number;
  rotSpeed: number;
  phase: number;
  colorIdx: number;
  kind: FallbackIconKind;
  pulse: number;
}

export function mountHeroCanvas2DFallback(canvas: HTMLCanvasElement, count = 9): () => void {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  const icons: HeroIcon2D[] = Array.from({ length: count }, (_, idx) => {
    const ringAngle = (idx / count) * Math.PI * 2 + 0.3;
    const radiusX = 0.32 + (idx % 2) * 0.1;
    const radiusY = 0.28 + ((idx + 1) % 3) * 0.09;
    return {
      nx: 0.5 + Math.cos(ringAngle) * radiusX,
      ny: 0.48 + Math.sin(ringAngle) * radiusY,
      size: 20 + (idx % 3) * 6,
      rot: ((idx % 2 === 0 ? 1 : -1) * 0.18),
      rotSpeed: (idx % 2 === 0 ? 1 : -1) * 0.004,
      phase: idx * 0.9,
      colorIdx: idx % 2 === 0 ? 0 : idx % 3 === 0 ? 2 : 1,
      kind: ICON_KINDS[idx % ICON_KINDS.length],
      pulse: 0,
    };
  });

  let width = 1;
  let height = 1;
  let mouseX = 0;
  let mouseY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let rafId = 0;
  let paused = false;
  let lastFrame = 0;
  let activeUntil = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(performance.now());
  };

  const drawServiceIcon = (kind: FallbackIconKind, size: number, colorIdx: number) => {
    const swatch = PALETTE[colorIdx];
    const r = size * 0.32;

    // Soft extruded 3D card badge base + crisp AMC service glyph
    ctx.fillStyle = swatch.edge;
    ctx.beginPath();
    ctx.roundRect(-size + 3, -size + 4, size * 2, size * 2, r);
    ctx.fill();

    ctx.fillStyle = swatch.main;
    ctx.strokeStyle = swatch.edge;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-size, -size, size * 2, size * 2, r);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = swatch.detail;
    ctx.fillStyle = swatch.detail;
    ctx.lineWidth = Math.max(1.8, size * 0.095);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const u = size * 0.56;
    if (kind === 'robot') {
      ctx.beginPath();
      ctx.roundRect(-u, -u * 0.62, u * 2, u * 1.42, u * 0.34);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.62);
      ctx.lineTo(0, -u * 1.05);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-u * 0.38, u * 0.02, u * 0.14, 0, Math.PI * 2);
      ctx.arc(u * 0.38, u * 0.02, u * 0.14, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'editing') {
      ctx.beginPath();
      ctx.roundRect(-u, -u * 0.8, u * 2, u * 1.6, u * 0.24);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u, -u * 0.3);
      ctx.lineTo(u, -u * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u * 0.22, -u * 0.02);
      ctx.lineTo(u * 0.36, u * 0.28);
      ctx.lineTo(-u * 0.22, u * 0.58);
      ctx.closePath();
      ctx.fill();
    } else if (kind === 'gamepad') {
      ctx.beginPath();
      ctx.roundRect(-u * 1.05, -u * 0.62, u * 2.1, u * 1.24, u * 0.56);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u * 0.62, 0);
      ctx.lineTo(-u * 0.26, 0);
      ctx.moveTo(-u * 0.44, -u * 0.18);
      ctx.lineTo(-u * 0.44, u * 0.18);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(u * 0.34, -u * 0.12, u * 0.11, 0, Math.PI * 2);
      ctx.arc(u * 0.56, u * 0.12, u * 0.11, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'buzzer') {
      ctx.beginPath();
      ctx.moveTo(-u * 0.8, -u * 0.22);
      ctx.lineTo(u * 0.58, -u * 0.72);
      ctx.lineTo(u * 0.58, u * 0.58);
      ctx.lineTo(-u * 0.8, u * 0.22);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u * 0.5, u * 0.26);
      ctx.lineTo(-u * 0.34, u * 0.82);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(u * 0.72, -u * 0.06, u * 0.35, -0.7, 0.7);
      ctx.stroke();
    } else if (kind === 'streaming') {
      ctx.beginPath();
      ctx.arc(0, 0, u * 0.82, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u * 0.24, -u * 0.38);
      ctx.lineTo(u * 0.42, 0);
      ctx.lineTo(-u * 0.24, u * 0.38);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.92);
      ctx.lineTo(u * 0.78, -u * 0.56);
      ctx.lineTo(u * 0.72, u * 0.12);
      ctx.quadraticCurveTo(u * 0.55, u * 0.68, 0, u * 0.96);
      ctx.quadraticCurveTo(-u * 0.55, u * 0.68, -u * 0.72, u * 0.12);
      ctx.lineTo(-u * 0.78, -u * 0.56);
      ctx.closePath();
      ctx.stroke();
    }
  };

  const drawFrame = (now: number) => {
    const t = now * 0.001;
    smoothX += (mouseX - smoothX) * 0.09;
    smoothY += (mouseY - smoothY) * 0.09;

    ctx.clearRect(0, 0, width, height);

    for (const s of icons) {
      s.rot += s.rotSpeed;
      s.pulse *= 0.85;
      const floatY = Math.sin(t * 1.1 + s.phase) * 9;
      const floatX = Math.cos(t * 0.8 + s.phase) * 6;
      const scale = 1 + s.pulse * 0.25;

      ctx.save();
      ctx.translate(s.nx * width + floatX + smoothX * 18, s.ny * height + floatY + smoothY * 18);
      ctx.rotate(Math.sin(s.rot) * 0.26);
      ctx.scale(scale, scale);
      drawServiceIcon(s.kind, s.size, s.colorIdx);
      ctx.restore();
    }
  };

  const onPointerActive = (e: PointerEvent) => {
    mouseX = (e.clientX / Math.max(1, width) - 0.5) * 2;
    mouseY = (e.clientY / Math.max(1, height) - 0.5) * 2;
    activeUntil = performance.now() + 1000;
  };

  const onClick = (e: MouseEvent) => {
    activeUntil = performance.now() + 800;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    for (const s of icons) {
      const sx = s.nx * width + smoothX * 18;
      const sy = s.ny * height + smoothY * 18;
      if (Math.hypot(cx - sx, cy - sy) <= s.size * 1.6) {
        s.colorIdx = (s.colorIdx + 1) % PALETTE.length;
        s.pulse = 1;
        break;
      }
    }
    drawFrame(performance.now());
  };

  const tick = (now: number) => {
    rafId = requestAnimationFrame(tick);
    const userPaused = Boolean((window as Window & { __amcHeroPaused?: boolean }).__amcHeroPaused);
    if (paused || userPaused) return;
    const minInterval = now < activeUntil ? 16 : 55;
    if (now - lastFrame < minInterval) return;
    lastFrame = now;
    drawFrame(now);
  };

  const io = new IntersectionObserver(
    (entries) => {
      paused = !entries[0]?.isIntersecting || document.hidden;
    },
    { threshold: 0.02 }
  );
  io.observe(canvas);

  const onVis = () => {
    paused = document.hidden;
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerActive, { passive: true });
  canvas.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVis);
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    io.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerActive);
    canvas.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', onVis);
  };
}
