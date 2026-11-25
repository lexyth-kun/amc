const PALETTE = ['#EEF5FF', '#38BDF8', '#1A36FF'] as const;

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

export function mountHeroCanvas2DFallback(canvas: HTMLCanvasElement, count = 12): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const shapes: PlusShape2D[] = Array.from({ length: count }, (_, idx) => {
    const ringAngle = (idx / count) * Math.PI * 2;
    const radiusX = 0.28 + (idx % 3) * 0.1;
    const radiusY = 0.24 + ((idx + 1) % 3) * 0.1;
    return {
      nx: 0.5 + Math.cos(ringAngle) * radiusX,
      ny: 0.48 + Math.sin(ringAngle) * radiusY,
      size: 22 + (idx % 4) * 9,
      rot: ringAngle,
      rotSpeed: (idx % 2 === 0 ? 1 : -1) * (0.003 + (idx % 3) * 0.0015),
      phase: idx * 0.85,
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

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const onPointerMove = (e: PointerEvent) => {
    mouseX = (e.clientX / Math.max(1, width) - 0.5) * 2;
    mouseY = (e.clientY / Math.max(1, height) - 0.5) * 2;
  };

  const onClick = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    for (const s of shapes) {
      const sx = s.nx * width + smoothX * 22;
      const sy = s.ny * height + smoothY * 22;
      const dist = Math.hypot(cx - sx, cy - sy);
      if (dist <= s.size * 1.45) {
        s.colorIdx = (s.colorIdx + 1) % PALETTE.length;
        s.pulse = 1;
        break;
      }
    }
  };

  const drawRoundedPlus = (size: number, fill: string) => {
    const arm = size * 0.34;
    ctx.fillStyle = fill;
    ctx.shadowColor = 'rgba(26, 54, 255, 0.16)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(-arm, -size, arm * 2, size * 2, arm * 0.45);
    ctx.roundRect(-size, -arm, size * 2, arm * 2, arm * 0.45);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const render = (now: number) => {
    if (!paused) {
      const t = now * 0.001;
      smoothX += (mouseX - smoothX) * 0.05;
      smoothY += (mouseY - smoothY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      for (const s of shapes) {
        s.rot += s.rotSpeed;
        s.pulse *= 0.9;
        const floatY = Math.sin(t * 1.2 + s.phase) * 10;
        const floatX = Math.cos(t * 0.8 + s.phase) * 7;
        const scale = 1 + s.pulse * 0.25;

        ctx.save();
        ctx.translate(s.nx * width + floatX + smoothX * 22, s.ny * height + floatY + smoothY * 22);
        ctx.rotate(s.rot);
        ctx.scale(scale, scale);
        drawRoundedPlus(s.size, PALETTE[s.colorIdx]);
        ctx.restore();
      }
    }
    rafId = requestAnimationFrame(render);
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
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVis);
  rafId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(rafId);
    io.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', onVis);
  };
}
