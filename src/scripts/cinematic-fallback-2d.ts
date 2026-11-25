import type { TunnelPhaseState } from '@/utils/tunnel-phases';

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
    ctx.fillStyle = '#082F49';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.hypot(cx, cy);

    // Concentric perspective Sky Blue tunnel rings
    const ringCount = 16;
    for (let i = 0; i < ringCount; i++) {
      const depth = ((i / ringCount + state.progress * 3.0) % 1 + 1) % 1;
      const radius = Math.max(8, Math.pow(depth, 1.8) * maxR * state.tunnelRadiusScale);
      ctx.strokeStyle = `rgba(125, 211, 252, ${(depth * 0.52).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Luminous Sky Blue starlight particles orbiting outward
    for (let i = 0; i < 42; i++) {
      const angle = i * 1.18 + state.tunnelTwistRad * 0.35;
      const depth = (((i * 0.047 + state.progress * 2.4) % 1) + 1) % 1;
      const dist = (38 + depth * maxR * 0.78) * state.tunnelRadiusScale;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      ctx.fillStyle = `rgba(186, 230, 253, ${(depth * 0.78).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + depth * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central glowing Sky Blue AMC Orb
    const baseOrbR = Math.min(width, height) * 0.08 * state.orbScale;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(12, baseOrbR * 2.2));
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.35, '#7DD3FC');
    grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.52)');
    grad.addColorStop(1, 'rgba(8, 47, 73, 0)');
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
