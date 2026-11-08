import React, { useEffect, useRef } from 'react';

// Photorealistic Mann's Planet cinematic image
import mannsPlanetImage from '../assets/images/manns_planet_ice_clouds_1793868333147.jpg';

interface WindStreamPoint {
  x: number;
  y: number;
  age: number;
}

interface WindStream {
  id: number;
  points: WindStreamPoint[];
  vx: number;
  vy: number;
  maxAge: number;
  width: number;
  alpha: number;
}

interface SpindriftParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  spin: number;
  spinSpeed: number;
  isRidgeSnow: boolean;
}

export const MannsPlanetCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const bgImage = bgImageRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;

    // --- 1. Background Parallax & Inertial Wind Drift State ---
    let bgX = 0;
    let bgY = 0;
    let bgTilt = 0;
    let bgScale = 1.05;
    let targetBgX = 0;
    let targetBgY = 0;
    let targetBgTilt = 0;
    let targetBgScale = 1.05;

    // --- 2. Interactive Frozen Cloud-Mountain Strata (Spring-Wave System) ---
    // Mann's Planet iconic frozen cloud shelves: 2 interactive physical strata
    const pointCount = Math.max(60, Math.floor(width / 18));
    
    // Distant mountain-cloud shelf (Midground, Y ~ 60% of viewport)
    const shelf1Y = new Float32Array(pointCount);
    const shelf1Vy = new Float32Array(pointCount);
    const shelf1BaseY = new Float32Array(pointCount);

    // Foreground frozen ice shelf (Y ~ 75% of viewport)
    const shelf2Y = new Float32Array(pointCount);
    const shelf2Vy = new Float32Array(pointCount);
    const shelf2BaseY = new Float32Array(pointCount);

    const initShelves = () => {
      for (let i = 0; i < pointCount; i++) {
        const t = i / (pointCount - 1);
        // Distant craggy frozen peaks
        const n1 = Math.sin(t * 7.0) * 28 + Math.cos(t * 15.0) * 16 + Math.sin(t * 29.0) * 8;
        shelf1BaseY[i] = height * 0.60 + n1;
        shelf1Y[i] = 0;
        shelf1Vy[i] = 0;

        // Foreground frozen ice cloud shelf with rolling precipices
        const n2 = Math.cos(t * 5.0) * 36 + Math.sin(t * 11.0) * 22 + Math.cos(t * 23.0) * 10;
        shelf2BaseY[i] = height * 0.76 + n2;
        shelf2Y[i] = 0;
        shelf2Vy[i] = 0;
      }
    };
    initShelves();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initShelves();
    };
    window.addEventListener('resize', handleResize);

    // --- 3. Interactive Wind Streams & Blowing Spindrift ---
    const windStreams: WindStream[] = [];
    const spindrift: SpindriftParticle[] = [];
    let streamIdCounter = 0;

    // Initialize ambient blowing spindrift particles
    const maxParticles = Math.min(140, Math.floor((width * height) / 12000));
    for (let i = 0; i < maxParticles; i++) {
      spindrift.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.2) * 1.2 + 0.8, // natural horizontal arctic drift
        vy: (Math.random() - 0.5) * 0.6 - 0.2, // subtle upward thermal lift
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        decay: 0,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.04,
        isRidgeSnow: false
      });
    }

    // Pointer tracking
    let pointerX = width * 0.5;
    let pointerY = height * 0.4;
    let prevPointerX = pointerX;
    let prevPointerY = pointerY;
    let lastTime = performance.now();
    let currentWindSpeed = 0;

    // Spawn an interactive wind ribbon
    const spawnWindStream = (startX: number, startY: number, vx: number, vy: number) => {
      if (prefersReducedMotion) return;
      if (windStreams.length > 25) return;

      const stream: WindStream = {
        id: ++streamIdCounter,
        points: [{ x: startX, y: startY, age: 0 }],
        vx: vx * 0.9 + (Math.random() - 0.2) * 2.5,
        vy: vy * 0.8 + (Math.random() - 0.5) * 1.5,
        maxAge: Math.floor(Math.random() * 30 + 35),
        width: Math.random() * 2.5 + 1.2,
        alpha: 0.85
      };
      windStreams.push(stream);
    };

    // Spawn blowing powder snow off mountain peaks when wind hits them
    const spawnMountainSpindrift = (x: number, y: number, windVx: number, windVy: number, count: number) => {
      if (spindrift.length > 220) return;
      for (let i = 0; i < count; i++) {
        spindrift.push({
          x: x + (Math.random() * 30 - 15),
          y: y + (Math.random() * 12 - 6),
          vx: windVx * 0.6 + (Math.random() - 0.2) * 3 + 1.2,
          vy: windVy * 0.4 - Math.random() * 2.5 - 0.8, // plumes lift upward into the gale
          size: Math.random() * 2.6 + 1.0,
          alpha: 0.9,
          decay: 0.015 + Math.random() * 0.02,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.1,
          isRidgeSnow: true
        });
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const now = performance.now();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dt = Math.max(1, now - lastTime);
      const dx = clientX - prevPointerX;
      const dy = clientY - prevPointerY;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;
      currentWindSpeed = speed;

      pointerX = clientX;
      pointerY = clientY;
      prevPointerX = clientX;
      prevPointerY = clientY;
      lastTime = now;

      // 1. Direct Background Parallax & Aerodynamic Inertia
      // The frozen mountains and sky in the background literally tilt and shift with cursor & wind
      const normX = (clientX / width - 0.5) * 2; // -1 to 1
      const normY = (clientY / height - 0.5) * 2; // -1 to 1

      targetBgX = -normX * 28 + (dx / dt) * 8; // opposite shift + forward wind momentum
      targetBgY = -normY * 18 + (dy / dt) * 5;
      targetBgTilt = normX * 0.65 + (dx / dt) * 0.2;
      targetBgScale = 1.05 + Math.min(0.04, speed * 0.012);

      // 2. Impart Wind Force to the Frozen Mountain / Cloud Strata
      // Calculate which vertical grid segment the cursor is above
      const col = Math.floor((clientX / width) * (pointCount - 1));
      const colRadius = Math.max(3, Math.floor(pointCount * 0.12));

      // Check distance to Shelf 1 (Distant Peaks)
      if (col >= 0 && col < pointCount) {
        const s1Dist = clientY - (shelf1BaseY[col] + shelf1Y[col]);
        if (Math.abs(s1Dist) < 160) {
          const impulse = (dy * 0.45 + (s1Dist > 0 ? -1 : 1) * Math.min(speed * 3.5, 18)) * 0.6;
          for (let i = Math.max(0, col - colRadius); i <= Math.min(pointCount - 1, col + colRadius); i++) {
            const falloff = 1 - Math.abs(i - col) / colRadius;
            shelf1Vy[i] += impulse * falloff * 0.4;
          }
          // Whip spindrift off the distant ridge
          if (speed > 0.4 && Math.random() < 0.45) {
            spawnMountainSpindrift(clientX, shelf1BaseY[col] + shelf1Y[col], dx * 0.4, dy * 0.4, 2);
          }
        }

        // Check distance to Shelf 2 (Foreground Cloud Shelf)
        const s2Dist = clientY - (shelf2BaseY[col] + shelf2Y[col]);
        if (Math.abs(s2Dist) < 180) {
          const impulse = (dy * 0.55 + (s2Dist > 0 ? -1 : 1) * Math.min(speed * 4.2, 22)) * 0.7;
          for (let i = Math.max(0, col - colRadius); i <= Math.min(pointCount - 1, col + colRadius); i++) {
            const falloff = 1 - Math.abs(i - col) / colRadius;
            shelf2Vy[i] += impulse * falloff * 0.5;
          }
          // Whip vigorous powder plumes off the foreground frozen shelf
          if (speed > 0.3) {
            spawnMountainSpindrift(clientX, shelf2BaseY[col] + shelf2Y[col], dx * 0.5, dy * 0.5, Math.min(4, Math.floor(speed * 2) + 1));
          }
        }
      }

      // 3. Create Aerodynamic Wind Gust Streams
      if (speed > 0.35 && Math.random() < 0.65) {
        spawnWindStream(clientX, clientY, dx * 0.3, dy * 0.3);
      }

      // 4. Impart Wind Gust onto Ambient Particles within radius
      const influenceRadiusSq = 220 * 220;
      for (let i = 0; i < spindrift.length; i++) {
        const p = spindrift[i];
        const pDx = p.x - clientX;
        const pDy = p.y - clientY;
        const distSq = pDx * pDx + pDy * pDy;
        if (distSq < influenceRadiusSq) {
          const force = (1 - distSq / influenceRadiusSq) * 0.35;
          p.vx += dx * force + (Math.random() - 0.2) * 1.5;
          p.vy += dy * force - Math.random() * 1.2;
        }
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    let time = 0;

    // --- 4. Main 120Hz Animation Loop ---
    const render = () => {
      time += 0.012;

      // 1. Smooth Spring/Damping Lerp on Background Image
      // Smoothly applies parallax, mountain tilt, and wind displacement to the background photo
      bgX += (targetBgX - bgX) * 0.08;
      bgY += (targetBgY - bgY) * 0.08;
      bgTilt += (targetBgTilt - bgTilt) * 0.06;
      bgScale += (targetBgScale - bgScale) * 0.06;

      if (bgImage) {
        bgImage.style.transform = `translate3d(${bgX.toFixed(2)}px, ${bgY.toFixed(2)}px, 0) scale(${bgScale.toFixed(3)}) rotate(${bgTilt.toFixed(3)}deg)`;
      }

      // Gradually decay target background impulses back toward center
      targetBgX *= 0.985;
      targetBgY *= 0.985;
      targetBgTilt *= 0.985;
      targetBgScale = 1.05 + (targetBgScale - 1.05) * 0.98;

      ctx.clearRect(0, 0, width, height);

      // 2. Physics Simulation for Frozen Cloud-Mountain Strata (Spring-Wave Equation)
      // Shelf 1 (Distant Frozen Peaks)
      const k1 = 0.024;
      const damp1 = 0.88;
      const spread1 = 0.18;

      for (let i = 0; i < pointCount; i++) {
        // Natural subtle atmospheric breathing undulation
        const ambientWind = Math.sin(time * 0.8 + i * 0.15) * 1.2;
        const force = -k1 * shelf1Y[i] + ambientWind * 0.04;
        shelf1Vy[i] = (shelf1Vy[i] + force) * damp1;
        shelf1Y[i] += shelf1Vy[i];
      }
      // Wave propagation across neighbors
      for (let i = 1; i < pointCount - 1; i++) {
        const leftDiff = shelf1Y[i - 1] - shelf1Y[i];
        const rightDiff = shelf1Y[i + 1] - shelf1Y[i];
        shelf1Vy[i] += (leftDiff + rightDiff) * spread1 * 0.5;
      }

      // Shelf 2 (Foreground Frozen Ice Shelf)
      const k2 = 0.028;
      const damp2 = 0.87;
      const spread2 = 0.22;

      for (let i = 0; i < pointCount; i++) {
        const ambientWind = Math.cos(time * 0.9 + i * 0.12) * 1.5;
        const force = -k2 * shelf2Y[i] + ambientWind * 0.05;
        shelf2Vy[i] = (shelf2Vy[i] + force) * damp2;
        shelf2Y[i] += shelf2Vy[i];
      }
      for (let i = 1; i < pointCount - 1; i++) {
        const leftDiff = shelf2Y[i - 1] - shelf2Y[i];
        const rightDiff = shelf2Y[i + 1] - shelf2Y[i];
        shelf2Vy[i] += (leftDiff + rightDiff) * spread2 * 0.5;
      }

      // 3. Render Shelf 1: Distant Frozen Ice-Cloud Mountains
      // Translucent frosty polygon seamlessly blending with the backdrop photo
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let i = 0; i < pointCount; i++) {
        const x = (i / (pointCount - 1)) * width;
        const y = shelf1BaseY[i] + shelf1Y[i];
        if (i === 0) ctx.lineTo(x, y);
        else {
          const prevX = ((i - 1) / (pointCount - 1)) * width;
          const prevY = shelf1BaseY[i - 1] + shelf1Y[i - 1];
          const midX = (prevX + x) * 0.5;
          const midY = (prevY + y) * 0.5;
          ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        }
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      // Atmospheric distant mountain gradient with soft frosty cyan highlights
      const shelf1Grad = ctx.createLinearGradient(0, height * 0.5, 0, height);
      shelf1Grad.addColorStop(0, 'rgba(219, 234, 254, 0.28)'); // cool glacial mist crest
      shelf1Grad.addColorStop(0.35, 'rgba(191, 219, 254, 0.18)');
      shelf1Grad.addColorStop(1, 'rgba(148, 163, 184, 0.05)');
      ctx.fillStyle = shelf1Grad;
      ctx.fill();

      // Subtle frosty ridge line highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // 4. Render Shelf 2: Foreground Frozen Ice Cloud Precipice
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let i = 0; i < pointCount; i++) {
        const x = (i / (pointCount - 1)) * width;
        const y = shelf2BaseY[i] + shelf2Y[i];
        if (i === 0) ctx.lineTo(x, y);
        else {
          const prevX = ((i - 1) / (pointCount - 1)) * width;
          const prevY = shelf2BaseY[i - 1] + shelf2Y[i - 1];
          const midX = (prevX + x) * 0.5;
          const midY = (prevY + y) * 0.5;
          ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        }
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      const shelf2Grad = ctx.createLinearGradient(0, height * 0.68, 0, height);
      shelf2Grad.addColorStop(0, 'rgba(240, 249, 255, 0.42)'); // crystalline rim
      shelf2Grad.addColorStop(0.3, 'rgba(224, 242, 254, 0.26)');
      shelf2Grad.addColorStop(1, 'rgba(148, 163, 184, 0.12)');
      ctx.fillStyle = shelf2Grad;
      ctx.fill();

      // Sharp crystalline crest stroke
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      // 5. Render Interactive Wind Streams (Gale currents & ribbons)
      for (let i = windStreams.length - 1; i >= 0; i--) {
        const stream = windStreams[i];
        const lastPt = stream.points[stream.points.length - 1];

        // Atmospheric turbulence along the wind stream
        const curlX = Math.sin(time * 3 + lastPt.y * 0.02) * 1.8;
        const curlY = Math.cos(time * 2 + lastPt.x * 0.02) * 1.2;

        const nextX = lastPt.x + stream.vx + curlX;
        const nextY = lastPt.y + stream.vy + curlY;

        stream.points.push({ x: nextX, y: nextY, age: 0 });
        if (stream.points.length > 18) {
          stream.points.shift();
        }

        // Age points and decay
        stream.alpha -= 1 / stream.maxAge;
        if (stream.alpha <= 0) {
          windStreams.splice(i, 1);
          continue;
        }

        // Draw flowing aerodynamic wind ribbon
        if (stream.points.length > 2) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(stream.points[0].x, stream.points[0].y);
          for (let p = 1; p < stream.points.length - 1; p++) {
            const xc = (stream.points[p].x + stream.points[p + 1].x) * 0.5;
            const yc = (stream.points[p].y + stream.points[p + 1].y) * 0.5;
            ctx.quadraticCurveTo(stream.points[p].x, stream.points[p].y, xc, yc);
          }
          const tail = stream.points[stream.points.length - 1];
          ctx.lineTo(tail.x, tail.y);

          // Flowing icy mist ribbon style
          const streamGrad = ctx.createLinearGradient(
            stream.points[0].x,
            stream.points[0].y,
            tail.x,
            tail.y
          );
          streamGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
          streamGrad.addColorStop(0.5, `rgba(224, 242, 254, ${stream.alpha * 0.75})`);
          streamGrad.addColorStop(1, `rgba(255, 255, 255, ${stream.alpha * 0.95})`);

          ctx.strokeStyle = streamGrad;
          ctx.lineWidth = stream.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          ctx.restore();
        }
      }

      // 6. Render Blowing Spindrift & Mountain Ice Crystals
      for (let i = spindrift.length - 1; i >= 0; i--) {
        const p = spindrift[i];

        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.spinSpeed;

        // Apply slight drag and gravity
        if (p.isRidgeSnow) {
          p.vx *= 0.985;
          p.vy += 0.035; // gentle descent
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            spindrift.splice(i, 1);
            continue;
          }
        } else {
          // Ambient particles wrap seamlessly
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          // Natural arctic atmospheric drift
          p.vx = p.vx * 0.99 + 0.012; // slow rightward wind
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);

        if (p.isRidgeSnow) {
          // Sparkling fine diamond ice crystal blown off the mountain
          ctx.fillStyle = `rgba(240, 249, 255, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Ambient hexagonal ice diamond
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.75})`;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Cinematic Photorealistic Backdrop (Physically tilts and shifts with cursor & wind) */}
      <img
        ref={bgImageRef}
        src={mannsPlanetImage}
        alt="Mann's Planet frozen cloudscape and ice mountains"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center filter brightness-[0.93] contrast-[1.07] saturate-[0.88] will-change-transform transform-gpu"
        style={{
          transform: 'translate3d(0px, 0px, 0) scale(1.05) rotate(0deg)',
          transition: 'filter 0.5s ease-out'
        }}
      />

      {/* Atmospheric cool grey-blue grading scrim for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-slate-900/20 to-slate-900/55 backdrop-blur-[0.5px]" />

      {/* 120Hz Interactive Mountain & Arctic Wind Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full will-change-contents"
      />
    </div>
  );
};
