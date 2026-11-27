import React, { useEffect, useRef } from 'react';

interface CometFlight {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * A single cinematic shooting star crosses the viewport every two seconds.
 * The transparent layer sits above either background canvas and below all UI.
 */
export const CometOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let frameId = 0;
    let flight: CometFlight | null = null;
    let nextLaunchAt = performance.now() + 450;
    let lastFrameAt = 0;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const launch = (now: number) => {
      const side = Math.floor(Math.random() * 4);
      const inset = 0;
      let startX = 0;
      let startY = 0;
      let endX = 0;
      let endY = 0;
      const alongX = randomBetween(width * 0.12, width * 0.88);
      const alongY = randomBetween(height * 0.12, height * 0.88);

      // Each flight enters from a randomly selected edge and exits the opposite edge.
      if (side === 0) {
        startX = alongX; startY = inset; endX = randomBetween(width * 0.12, width * 0.88); endY = height;
      } else if (side === 1) {
        startX = width; startY = alongY; endX = 0; endY = randomBetween(height * 0.12, height * 0.88);
      } else if (side === 2) {
        startX = alongX; startY = height; endX = randomBetween(width * 0.12, width * 0.88); endY = 0;
      } else {
        startX = 0; startY = alongY; endX = width; endY = randomBetween(height * 0.12, height * 0.88);
      }

      flight = {
        startX, startY, endX, endY,
        startTime: now,
        duration: randomBetween(1500, 1850)
      };
    };

    const render = (now: number) => {
      frameId = requestAnimationFrame(render);
      if (reducedMotion) {
        ctx.clearRect(0, 0, width, height);
        flight = null;
        lastFrameAt = now;
        return;
      }

      // Keep animation refresh-synchronised; elapsed time controls motion, not a fixed FPS timer.
      const delta = lastFrameAt ? Math.min(now - lastFrameAt, 40) : 16.67;
      lastFrameAt = now;
      void delta;

      ctx.clearRect(0, 0, width, height);
      if (!flight && now >= nextLaunchAt) {
        launch(now);
        nextLaunchAt = now + 2000;
      }
      if (!flight) return;

      const progress = Math.min(1, (now - flight.startTime) / flight.duration);
      const eased = progress * progress * (3 - 2 * progress);
      const x = flight.startX + (flight.endX - flight.startX) * eased;
      const y = flight.startY + (flight.endY - flight.startY) * eased;
      const dx = flight.endX - flight.startX;
      const dy = flight.endY - flight.startY;
      const distance = Math.hypot(dx, dy) || 1;
      const ux = dx / distance;
      const uy = dy / distance;
      const tailLength = Math.min(170, distance * 0.18);
      const tailX = x - ux * tailLength;
      const tailY = y - uy * tailLength;
      const fadeIn = Math.min(1, progress * 8);
      const fadeOut = Math.min(1, (1 - progress) * 8);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
      const darkTheme = document.documentElement.classList.contains('dark');
      const glow = darkTheme ? '90, 245, 220' : '14, 116, 144';
      const core = darkTheme ? '235, 255, 250' : '255, 255, 255';

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      // Broad, soft outer glow.
      const glowGradient = ctx.createLinearGradient(x, y, tailX, tailY);
      glowGradient.addColorStop(0, `rgba(${core}, ${0.78 * alpha})`);
      glowGradient.addColorStop(0.18, `rgba(${glow}, ${0.42 * alpha})`);
      glowGradient.addColorStop(1, `rgba(${glow}, 0)`);
      ctx.strokeStyle = glowGradient;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Crisp luminous core keeps the comet recognisable on both themes.
      const coreGradient = ctx.createLinearGradient(x, y, tailX, tailY);
      coreGradient.addColorStop(0, `rgba(${core}, ${alpha})`);
      coreGradient.addColorStop(0.25, `rgba(${glow}, ${0.72 * alpha})`);
      coreGradient.addColorStop(1, `rgba(${glow}, 0)`);
      ctx.strokeStyle = coreGradient;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      const head = ctx.createRadialGradient(x, y, 0, x, y, 13);
      head.addColorStop(0, `rgba(${core}, ${0.9 * alpha})`);
      head.addColorStop(0.28, `rgba(${glow}, ${0.48 * alpha})`);
      head.addColorStop(1, `rgba(${glow}, 0)`);
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (progress >= 1) flight = null;
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        flight = null;
        ctx.clearRect(0, 0, width, height);
      } else {
        nextLaunchAt = performance.now() + 450;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    motionQuery.addEventListener('change', handleMotionChange);
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="comet-overlay"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] block"
    />
  );
};
