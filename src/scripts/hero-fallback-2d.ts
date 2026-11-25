const PALETTE = [
  { main: '#FFFFFF', edge: '#BAE6FD' },
  { main: '#7DD3FC', edge: '#38BDF8' },
  { main: '#38BDF8', edge: '#0284C7' },
] as const;

interface PlusShape2D {
  nx: number;
  ny: number;
  size: number;
  rot: number;
  rotSpeed: number;
  phase: number;
  colorIdx: number;
  pulse: number;
}

export function mountHeroCanvas2DFallback(canvas: HTMLCanvasElement, count = 9): () => void {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  const shapes: PlusShape2D[] = Array.from({ length: count }, (_, idx) => {
    const ringAngle = (idx / count) * Math.PI * 2 + 0.3;
    const radiusX = 0.32 + (idx % 2) * 0.1;
    const radiusY = 0.28 + ((idx + 1) % 3) * 0.09;
    return {
      nx: 0.5 + Math.cos(ringAngle) * radiusX,
      ny: 0.48 + Math.sin(ringAngle) * radiusY,
      size: 18 + (idx % 3) * 7,
      rot: ringAngle,
      rotSpeed: (idx % 2 === 0 ? 1 : -1) * 0.008,
      phase: idx * 0.9,
      colorIdx: idx % 2 === 0 ? 0 : idx % 3 === 0 ? 2 : 1,
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

  const drawBeveledPlus = (size: number, colorIdx: number) => {
    const arm = size * 0.35;
    const r = arm * 0.44;
    const swatch = PALETTE[colorIdx];

    // Extruded 3D depth offset (zero Gaussian shadowBlur CPU cost)
    ctx.fillStyle = swatch.edge;
    ctx.beginPath();
    ctx.roundRect(-arm + 3, -size + 4, arm * 2, size * 2, r);
    ctx.roundRect(-size + 3, -arm + 4, size * 2, arm * 2, r);
    ctx.fill();

    ctx.fillStyle = swatch.main;
    ctx.beginPath();
    ctx.roundRect(-arm, -size, arm * 2, size * 2, r);
    ctx.roundRect(-size, -arm, size * 2, arm * 2, r);
    ctx.fill();
  };

  const drawFrame = (now: number) => {
    const t = now * 0.001;
    smoothX += (mouseX - smoothX) * 0.09;
    smoothY += (mouseY - smoothY) * 0.09;

    ctx.clearRect(0, 0, width, height);

    for (const s of shapes) {
      s.rot += s.rotSpeed;
      s.pulse *= 0.85;
      const floatY = Math.sin(t * 1.1 + s.phase) * 9;
      const floatX = Math.cos(t * 0.8 + s.phase) * 6;
      const scale = 1 + s.pulse * 0.25;

      ctx.save();
      ctx.translate(s.nx * width + floatX + smoothX * 18, s.ny * height + floatY + smoothY * 18);
      ctx.rotate(s.rot);
      ctx.scale(scale, scale);
      drawBeveledPlus(s.size, s.colorIdx);
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

    for (const s of shapes) {
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
