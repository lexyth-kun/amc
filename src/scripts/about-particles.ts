interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: 'sky' | 'light' | 'deep';
  phase: number;
}

export function initAboutFluidParticles(): void {
  const canvas = document.getElementById('about-particles-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 28 : 56;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let visible = true;
  let paused = false;
  let rafId = 0;

  const pointer = { x: -9999, y: -9999, active: false };
  const particles: Particle[] = [];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(320, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const seed = () => {
    particles.length = 0;
    const hues: Particle['hue'][] = ['sky', 'light', 'deep'];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35,
        radius: isMobile ? 22 + Math.random() * 44 : 36 + Math.random() * 76,
        alpha: 0.14 + Math.random() * 0.22,
        hue: hues[i % hues.length],
        phase: Math.random() * Math.PI * 2,
      });
    }
  };

  const drawFrame = (time: number) => {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      if (!reduced && !paused) {
        p.phase += 0.008;
        p.x += p.vx + Math.cos(p.phase) * 0.28;
        p.y += p.vy + Math.sin(p.phase * 0.85) * 0.24;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 4 && distSq < 42000) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / 205) * 1.45;
            p.vx += (dx / dist) * force * 0.18;
            p.vy += (dy / dist) * force * 0.18;
          }
        }

        p.vx *= 0.965;
        p.vy *= 0.965;

        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;
      }

      const rgb =
        p.hue === 'light'
          ? '125, 211, 252'
          : p.hue === 'deep'
            ? '14, 165, 233'
            : '56, 189, 248';
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(${rgb}, ${p.alpha.toFixed(3)})`);
      grad.addColorStop(0.55, `rgba(${rgb}, ${(p.alpha * 0.36).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${rgb}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduced && visible && !paused) {
      rafId = window.requestAnimationFrame(drawFrame);
    } else if (time < 0) {
      // single static frame for reduced-motion
    }
  };

  resize();
  seed();
  drawFrame(-1);

  if (reduced) return;

  const parent = canvas.parentElement;
  parent?.addEventListener(
    'pointermove',
    (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    },
    { passive: true }
  );
  parent?.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  const pauseBtn = document.getElementById('about-particles-pause');
  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    pauseBtn.textContent = paused ? 'Putar Latar' : 'Jeda Latar';
    if (!paused && visible) {
      rafId = window.requestAnimationFrame(drawFrame);
    }
  });

  const io = new IntersectionObserver(
    (entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
      if (visible && !paused) {
        window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(drawFrame);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  window.addEventListener('resize', () => {
    resize();
    if (paused) drawFrame(-1);
  });

  rafId = window.requestAnimationFrame(drawFrame);
}
