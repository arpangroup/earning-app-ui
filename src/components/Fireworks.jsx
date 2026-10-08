import { useEffect, useRef } from 'react';

const COLORS = ['#ffcc33', '#ff3d8b', '#a78bfa', '#22d3ee', '#4ade80', '#ff7a18', '#ffffff', '#f472b6'];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Canvas firework show: rockets rise from the bottom and burst into glowing, gravity-bound sparks. */
export default function Fireworks({ duration = 4500, intensity = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const rockets = [];
    const sparks = [];
    const scale = Math.sqrt(h / 800);

    const launch = () =>
      rockets.push({
        x: rand(w * 0.12, w * 0.88),
        y: h,
        vx: rand(-0.9, 0.9),
        vy: -rand(9.5, 12.5) * scale,
        ty: rand(h * 0.1, h * 0.42),
        color: pick(COLORS),
      });

    const explode = (x, y, color) => {
      const count = Math.round(rand(70, 110) * intensity);
      const ring = Math.random() < 0.3;
      const second = pick(COLORS);
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + rand(-0.05, 0.05);
        const sp = ring ? rand(4.2, 4.8) : rand(1, 5.8);
        sparks.push({
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 1,
          decay: rand(0.009, 0.018),
          color: Math.random() < 0.25 ? second : color,
          size: rand(1.2, 2.8),
          glitter: Math.random() < 0.3,
        });
      }
      // central flash
      sparks.push({ x, y, vx: 0, vy: 0, life: 1, decay: 0.08, color: '#fff', size: 18, flash: true });
    };

    let raf;
    let lastLaunch = 0;
    const t0 = performance.now();
    launch();
    setTimeout(launch, 180);

    const loop = (t) => {
      const elapsed = t - t0;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      if (elapsed < duration && t - lastLaunch > rand(260, 520) / intensity) {
        launch();
        if (Math.random() < 0.35) launch();
        lastLaunch = t;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.vy += 0.12;
        r.x += r.vx;
        r.y += r.vy;
        ctx.globalAlpha = 1;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        sparks.push({ x: r.x, y: r.y, vx: rand(-0.3, 0.3), vy: rand(0.5, 1.5), life: 0.6, decay: 0.04, color: '#ffd27a', size: 1.4 });
        if (r.y <= r.ty || r.vy >= -1) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= 0.975;
        s.vy = s.vy * 0.975 + 0.055;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.glitter ? s.life * (Math.random() < 0.5 ? 1 : 0.2) : s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.flash ? s.size * (1.5 - s.life) : s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed >= duration && !rockets.length && !sparks.length) {
        ctx.clearRect(0, 0, w, h);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [duration, intensity]);

  return <canvas ref={ref} className="fireworks-canvas" />;
}
