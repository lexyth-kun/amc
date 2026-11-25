import type { TunnelPhaseState } from '@/utils/tunnel-phases';

const LABELS = ['ChatGPT', 'Claude', 'Adobe', 'Canva', 'Netflix', 'Spotify', 'MLBB'];

export function createCinematicCanvas2DRenderer(canvas: HTMLCanvasElement): {
  renderState: (state: TunnelPhaseState) => void;
  destroy: () => void;
} {
  const ctx = canvas.getContext('2d');
  let width = 1;
  let height = 1;

  const resize = () => {
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener('resize', resize);

  const renderState = (state: TunnelPhaseState) => {
    if (!ctx) return;
    ctx.fillStyle = '#061A3A';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.hypot(cx, cy);

    // Concentric perspective tunnel rings
    const ringCount = 12;
    for (let i = 0; i < ringCount; i++) {
      const depth = ((i / ringCount + state.progress * 2.2) % 1 + 1) % 1;
      const radius = Math.max(8, Math.pow(depth, 1.8) * maxR * state.tunnelRadiusScale);
      ctx.strokeStyle = `rgba(56, 189, 248, ${(depth * 0.55).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Flying product labels in Phase 2-3
    if (state.progress > 0.2 && state.progress < 0.8) {
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      LABELS.forEach((label, idx) => {
        const angle = (idx / LABELS.length) * Math.PI * 2 + state.tunnelTwistRad * 0.4;
        const depth = (((idx * 0.14 + state.progress * 1.9) % 1) + 1) % 1;
        const dist = (36 + depth * maxR * 0.72) * state.tunnelRadiusScale;
        const lx = cx + Math.cos(angle) * dist;
        const ly = cy + Math.sin(angle) * dist;
        ctx.fillStyle = `rgba(234, 243, 255, ${(depth * 0.9).toFixed(2)})`;
        ctx.fillText(label, lx, ly);
      });
    }

    // Central glowing AMC Orb
    const baseOrbR = Math.min(width, height) * 0.08 * state.orbScale;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(12, baseOrbR * 2.2));
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.35, '#38BDF8');
    grad.addColorStop(0.7, 'rgba(26, 54, 255, 0.55)');
    grad.addColorStop(1, 'rgba(6, 26, 58, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(12, baseOrbR * 2.2), 0, Math.PI * 2);
    ctx.fill();
  };

  return {
    renderState,
    destroy: () => window.removeEventListener('resize', resize),
  };
}
