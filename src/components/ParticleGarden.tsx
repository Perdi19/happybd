import React, { useEffect, useRef } from 'react';

interface ParticleGardenProps {
  petalDensity?: 'low' | 'medium' | 'high';
  showShootingStars?: boolean;
}

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  pulseSpeed: number;
  phase: number;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  wobblePhase: number;
  wobbleSpeed: number;
  alpha: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export const ParticleGarden: React.FC<ParticleGardenProps> = ({
  petalDensity = 'medium',
  showShootingStars = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);

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
      initStars();
    };
    window.addEventListener('resize', handleResize);

    // 1. Stars
    let stars: Star[] = [];
    const initStars = () => {
      const starCount = Math.floor((width * height) / 3800);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.85),
          size: Math.random() * 1.6 + 0.4,
          baseAlpha: Math.random() * 0.7 + 0.2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };
    initStars();

    // 2. Fireflies / Ethereal motes
    const fireflyCount = Math.floor(Math.min(width / 35, 30));
    const fireflies: Firefly[] = Array.from({ length: fireflyCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      size: Math.random() * 2.2 + 1.2,
      alpha: 0,
      baseAlpha: Math.random() * 0.5 + 0.3,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.04 + 0.02,
    }));

    // 3. Floating Jasmine Petals
    const targetPetalCount =
      petalDensity === 'low' ? 14 : petalDensity === 'high' ? 36 : 24;
    const petals: Petal[] = Array.from({ length: targetPetalCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 7 + 8,
      vx: Math.random() * 0.5 + 0.2,
      vy: Math.random() * 0.7 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.03 + 0.015,
      alpha: Math.random() * 0.4 + 0.5,
    }));

    // 4. Shooting Stars
    let nextShootingStarTime = Date.now() + Math.random() * 5000 + 3000;
    let shootingStar: ShootingStar | null = null;

    // Interactive stardust on pointer move/click
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      for (let i = 0; i < 2; i++) {
        sparksRef.current.push({
          x: clientX + (Math.random() - 0.5) * 16,
          y: clientY + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.4 ? '#fef08a' : '#ffffff',
          alpha: 0.9,
          decay: 0.025 + Math.random() * 0.02,
        });
      }
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Render loop
    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.pulseSpeed;
        const currentAlpha = Math.max(
          0.05,
          Math.min(1, s.baseAlpha + Math.sin(s.phase) * 0.3)
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow for bigger stars
        if (s.size > 1.3) {
          ctx.fillStyle = `rgba(254, 240, 138, ${currentAlpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Shooting Star
      const now = Date.now();
      if (showShootingStars) {
        if (!shootingStar && now > nextShootingStarTime) {
          shootingStar = {
            x: Math.random() * (width * 0.7),
            y: Math.random() * (height * 0.35),
            length: Math.random() * 80 + 70,
            speed: Math.random() * 550 + 450,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
            alpha: 1,
            active: true,
          };
          nextShootingStarTime = now + Math.random() * 8000 + 6000;
        }

        if (shootingStar && shootingStar.active) {
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed * dt;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed * dt;
          shootingStar.alpha -= dt * 1.2;

          if (shootingStar.alpha <= 0 || shootingStar.x > width || shootingStar.y > height) {
            shootingStar = null;
          } else {
            const tailX =
              shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
            const tailY =
              shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

            const grad = ctx.createLinearGradient(
              tailX,
              tailY,
              shootingStar.x,
              shootingStar.y
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(
              1,
              `rgba(254, 240, 138, ${Math.max(0, shootingStar.alpha)})`
            );

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(shootingStar.x, shootingStar.y);
            ctx.stroke();

            // Head sparkle
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, shootingStar.alpha)})`;
            ctx.beginPath();
            ctx.arc(shootingStar.x, shootingStar.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Fireflies
      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];
        f.x += f.vx;
        f.y += f.vy;
        f.pulsePhase += f.pulseSpeed;
        f.alpha = Math.max(0, f.baseAlpha + Math.sin(f.pulsePhase) * 0.35);

        // Gentle drift boundaries
        if (f.x < -20) f.x = width + 20;
        if (f.x > width + 20) f.x = -20;
        if (f.y < -20) f.y = height + 20;
        if (f.y > height + 20) f.y = -20;

        // Glow halo
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3.5);
        grad.addColorStop(0, `rgba(253, 224, 71, ${f.alpha * 0.9})`);
        grad.addColorStop(0.4, `rgba(234, 179, 8, ${f.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Jasmine Petals
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.wobblePhase += p.wobbleSpeed;
        p.rotation += p.rotationSpeed;
        p.x += p.vx + Math.sin(p.wobblePhase) * 0.6;
        p.y += p.vy;

        if (p.y > height + 30) {
          p.y = -25;
          p.x = Math.random() * width;
        }
        if (p.x > width + 30) p.x = -25;

        // Draw delicate jasmine petal (almond/teardrop shape)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // 3D tilt squeeze
        const scaleX = Math.cos(p.wobblePhase);
        ctx.scale(scaleX, 1);

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(
          p.size * 0.55,
          -p.size * 0.35,
          p.size * 0.45,
          p.size * 0.55,
          0,
          p.size
        );
        ctx.bezierCurveTo(
          -p.size * 0.45,
          p.size * 0.55,
          -p.size * 0.55,
          -p.size * 0.35,
          0,
          -p.size
        );
        ctx.fill();

        // Subtle center vein
        ctx.strokeStyle = `rgba(240, 245, 235, ${p.alpha * 0.5})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.7);
        ctx.lineTo(0, p.size * 0.65);
        ctx.stroke();

        ctx.restore();
      }

      // Draw Sparks
      const activeSparks: Spark[] = [];
      for (let i = 0; i < sparksRef.current.length; i++) {
        const sp = sparksRef.current[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;
        sp.size *= 0.97;

        if (sp.alpha > 0.02 && sp.size > 0.4) {
          ctx.fillStyle =
            sp.color === '#ffffff'
              ? `rgba(255, 255, 255, ${sp.alpha})`
              : `rgba(254, 240, 138, ${sp.alpha})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
          activeSparks.push(sp);
        }
      }
      sparksRef.current = activeSparks;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [petalDensity, showShootingStars]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
};
