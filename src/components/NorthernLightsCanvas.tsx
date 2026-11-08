import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  color: string;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  decay: number;
  sparkles: { x: number; y: number; alpha: number; size: number }[];
}

export const NorthernLightsCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;

    // Starfield
    const starCount = Math.floor((width * height) / 8000);
    const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.75,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    // Comets and pointer tracking
    const comets: Comet[] = [];
    const particles: Particle[] = [];
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = performance.now();

    const spawnComet = (startX: number, startY: number, targetVx?: number, targetVy?: number) => {
      const angle = targetVx !== undefined && targetVy !== undefined
        ? Math.atan2(targetVy, targetVx)
        : (Math.PI / 4) + (Math.random() * 0.4 - 0.2); // ~45 deg downward streak
      const speed = Math.random() * 6 + 7;

      comets.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 70 + 60,
        alpha: 0.95,
        decay: 0.012 + Math.random() * 0.008,
        sparkles: []
      });
    };

    // Sporadic natural shooting stars (every 8-15 seconds)
    let nextNaturalCometTime = performance.now() + 4000;

    // Pointer move listener
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const now = performance.now();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dt = Math.max(1, now - lastPointerTime);
      const dx = clientX - lastPointerX;
      const dy = clientY - lastPointerY;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      // When cursor moves deliberately, create soft star dust & spawn occasional comet
      if (speed > 1.2 && Math.random() < 0.25) {
        spawnComet(clientX, clientY, dx * 0.4 + 4, dy * 0.4 + 4);
      }

      // Star dust particle trail
      if (Math.random() < 0.6) {
        particles.push({
          x: clientX + (Math.random() * 12 - 6),
          y: clientY + (Math.random() * 12 - 6),
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 - 0.2,
          size: Math.random() * 2 + 1,
          alpha: 0.8,
          maxAlpha: 0.8,
          decay: 0.02 + Math.random() * 0.02,
          color: Math.random() > 0.4 ? '#1ee6a8' : '#38bdf8'
        });
      }

      lastPointerX = clientX;
      lastPointerY = clientY;
      lastPointerTime = now;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Multi-layer Aurora simulation
    // We render 3 volumetric curtain waves that shift organically
    let time = 0;

    const render = (now: number) => {
      if (!prefersReducedMotion) {
        time += 0.004;
      }

      // Trigger natural shooting stars
      if (now > nextNaturalCometTime) {
        spawnComet(Math.random() * width * 0.8, Math.random() * height * 0.35);
        nextNaturalCometTime = now + (Math.random() * 10000 + 7000);
      }

      // Clear with deep space obsidian gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#040609');
      bgGrad.addColorStop(0.4, '#070c14');
      bgGrad.addColorStop(0.8, '#060a12');
      bgGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        if (!prefersReducedMotion) {
          star.alpha += Math.sin(now * star.speed + i) * 0.005;
        }
        const currentAlpha = Math.max(0.1, Math.min(0.9, star.alpha));
        ctx.fillStyle = `rgba(226, 232, 240, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Aurora Borealis volumetric curtains
      // Layer 1: Ethereal emerald-cyan deep curtain
      drawAuroraCurtain(
        ctx,
        width,
        height,
        time,
        0.28, // height ratio
        'rgba(30, 230, 168, 0.22)', // emerald
        'rgba(45, 212, 191, 0.16)', // teal
        'rgba(14, 165, 233, 0.08)', // sky blue
        120, // vertical ray length
        1.0
      );

      // Layer 2: Vivid luminous primary green curtain
      drawAuroraCurtain(
        ctx,
        width,
        height,
        time * 1.25 + 2.1,
        0.36,
        'rgba(34, 197, 94, 0.26)',
        'rgba(30, 230, 168, 0.28)',
        'rgba(168, 85, 247, 0.12)', // subtle violet crown
        180,
        1.4
      );

      // Layer 3: Soft low-atmosphere shimmer curtain
      drawAuroraCurtain(
        ctx,
        width,
        height,
        time * 0.75 + 4.8,
        0.45,
        'rgba(45, 212, 191, 0.18)',
        'rgba(16, 185, 129, 0.15)',
        'rgba(56, 189, 248, 0.05)',
        140,
        0.8
      );

      // 3. Update & render shooting star comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx;
        c.y += c.vy;
        c.alpha -= c.decay;

        // Leave tiny trail sparkles
        if (Math.random() < 0.4 && c.alpha > 0.2) {
          c.sparkles.push({
            x: c.x - c.vx * 0.2 + (Math.random() * 4 - 2),
            y: c.y - c.vy * 0.2 + (Math.random() * 4 - 2),
            alpha: c.alpha * 0.8,
            size: Math.random() * 1.5 + 0.8
          });
        }

        // Draw comet head & streak
        const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * (c.length / 10), c.y - c.vy * (c.length / 10));
        grad.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
        grad.addColorStop(0.2, `rgba(167, 243, 208, ${c.alpha * 0.8})`);
        grad.addColorStop(1, `rgba(30, 230, 168, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * (c.length / 10), c.y - c.vy * (c.length / 10));
        ctx.stroke();

        // Draw comet sparkles
        for (let j = c.sparkles.length - 1; j >= 0; j--) {
          const sp = c.sparkles[j];
          sp.alpha -= 0.03;
          if (sp.alpha <= 0) {
            c.sparkles.splice(j, 1);
            continue;
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${sp.alpha})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (c.alpha <= 0 || c.x > width + 100 || c.y > height + 100) {
          comets.splice(i, 1);
        }
      }

      // 4. Update & render cursor star dust particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
      aria-hidden="true"
    />
  );
};

/**
 * Procedural volumetric aurora curtain with sinusoidal harmonic undulation and vertical rays
 */
function drawAuroraCurtain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  heightRatio: number,
  colorBottom: string,
  colorMid: string,
  colorTop: string,
  curtainHeight: number,
  waveScale: number
) {
  const baseY = height * heightRatio;
  const segments = 45;
  const step = width / segments;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Build the wave path
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments + 1; i++) {
    const x = (i - 0.5) * step;
    // Harmonic combination of sines
    const wave1 = Math.sin(x * 0.0025 + time * 1.2) * 55 * waveScale;
    const wave2 = Math.cos(x * 0.006 - time * 0.9) * 32 * waveScale;
    const wave3 = Math.sin(x * 0.012 + time * 1.8) * 14 * waveScale;
    const y = baseY + wave1 + wave2 + wave3;
    points.push({ x, y });
  }

  // Draw gradient curtain
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const xc = (prev.x + curr.x) / 2;
    const yc = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, xc, yc);
  }

  // Upward drape
  ctx.lineTo(width, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();

  const curtainGrad = ctx.createLinearGradient(0, baseY + 60, 0, Math.max(0, baseY - curtainHeight));
  curtainGrad.addColorStop(0, colorBottom);
  curtainGrad.addColorStop(0.4, colorMid);
  curtainGrad.addColorStop(0.9, colorTop);
  curtainGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = curtainGrad;
  ctx.fill();

  // Draw vertical ray shimmer striations across the aurora
  const rayCount = 18;
  for (let r = 0; r < rayCount; r++) {
    const rayX = ((r / rayCount) * width + Math.sin(time + r) * 40 + width) % width;
    const rayAlpha = (Math.sin(time * 2.5 + r * 1.7) * 0.5 + 0.5) * 0.09;
    if (rayAlpha > 0.02) {
      const rayGrad = ctx.createLinearGradient(rayX, baseY + 40, rayX, baseY - curtainHeight * 1.1);
      rayGrad.addColorStop(0, `rgba(30, 230, 168, ${rayAlpha * 1.5})`);
      rayGrad.addColorStop(0.6, `rgba(45, 212, 191, ${rayAlpha})`);
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = rayGrad;
      ctx.fillRect(rayX - 15, baseY - curtainHeight * 1.1, 30, curtainHeight * 1.3);
    }
  }

  ctx.restore();
}
