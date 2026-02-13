'use client';

import { useEffect, useRef } from 'react';

interface Shape {
  type: 'circle' | 'rect' | 'line' | 'triangle';
  x: number;
  y: number;
  size: number;
  baseSize: number;
  rotation: number;
  rotationSpeed: number;
  driftX: number;
  driftY: number;
  driftPhaseX: number;
  driftPhaseY: number;
  driftAmplitudeX: number;
  driftAmplitudeY: number;
  color: string;
  opacity: number;
  baseOpacity: number;
  lineWidth: number;
  filled: boolean;
  pulsePhase: number;
  pulseSpeed: number;
  scalePhase: number;
  scaleSpeed: number;
  scaleRange: number;
}

const COLORS = [
  '#E8710A', // Pixyo orange
  '#F5A623', // warm amber
  '#FFFFFF', // white
  '#E8710A', // orange weighted
  '#457B9D', // muted blue
  '#F1FAEE', // off-white
];

function createShape(w: number, h: number): Shape {
  const types: Shape['type'][] = ['circle', 'rect', 'line', 'triangle'];
  const type = types[Math.floor(Math.random() * types.length)];
  const baseOpacity = 0.03 + Math.random() * 0.09;
  const baseSize = 30 + Math.random() * 250;
  return {
    type,
    x: Math.random() * w,
    y: Math.random() * h,
    size: baseSize,
    baseSize,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.004,
    driftX: (Math.random() - 0.5) * 0.25,
    driftY: (Math.random() - 0.5) * 0.18,
    // Sinusoidal wandering — each shape gets its own phase and amplitude
    driftPhaseX: Math.random() * Math.PI * 2,
    driftPhaseY: Math.random() * Math.PI * 2,
    driftAmplitudeX: 0.15 + Math.random() * 0.4,
    driftAmplitudeY: 0.1 + Math.random() * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: baseOpacity,
    baseOpacity,
    lineWidth: 0.5 + Math.random() * 2.5,
    filled: Math.random() > 0.6,
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.005 + Math.random() * 0.015,
    // Scale breathing — subtle size oscillation
    scalePhase: Math.random() * Math.PI * 2,
    scaleSpeed: 0.003 + Math.random() * 0.008,
    scaleRange: 0.08 + Math.random() * 0.15, // 8-23% size variation
  };
}

export function BauhausCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.scale(dpr, dpr);
    }

    function initShapes() {
      const count = Math.min(28, Math.floor(window.innerWidth / 55));
      shapesRef.current = Array.from({ length: count }, () =>
        createShape(window.innerWidth, window.innerHeight)
      );
    }

    resize();
    initShapes();

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function drawTriangle(ctx: CanvasRenderingContext2D, size: number) {
      const h = size * 0.866;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(-size / 2, h / 2);
      ctx.lineTo(size / 2, h / 2);
      ctx.closePath();
    }

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      timeRef.current += 1;

      ctx!.clearRect(0, 0, w, h);

      const shapes = shapesRef.current;

      // Draw connecting lines between nearby shapes
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const dx = shapes[i].x - shapes[j].x;
          const dy = shapes[i].y - shapes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const alpha = (1 - dist / 300) * 0.04;
            ctx!.strokeStyle = `rgba(232, 113, 10, ${alpha})`;
            ctx!.beginPath();
            ctx!.moveTo(shapes[i].x, shapes[i].y);
            ctx!.lineTo(shapes[j].x, shapes[j].y);
            ctx!.stroke();
          }
        }
      }

      for (const shape of shapes) {
        const t = timeRef.current;

        // Sinusoidal wandering — organic, flowing movement
        const wanderX = Math.sin(t * 0.008 + shape.driftPhaseX) * shape.driftAmplitudeX;
        const wanderY = Math.cos(t * 0.006 + shape.driftPhaseY) * shape.driftAmplitudeY;
        shape.x += shape.driftX + wanderX;
        shape.y += shape.driftY + wanderY;
        shape.rotation += shape.rotationSpeed;

        // Scale breathing — shapes gently grow and shrink
        const scaleFactor = 1 + Math.sin(t * shape.scaleSpeed + shape.scalePhase) * shape.scaleRange;
        shape.size = shape.baseSize * scaleFactor;

        // Mouse proximity glow
        const dmx = shape.x - mx;
        const dmy = shape.y - my;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        const mouseInfluence = Math.max(0, 1 - mouseDist / 400);

        // Pulsing opacity
        const pulse = Math.sin(t * shape.pulseSpeed + shape.pulsePhase) * 0.3 + 0.7;
        shape.opacity = shape.baseOpacity * pulse + mouseInfluence * 0.12;

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = w + shape.size;
        if (shape.x > w + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = h + shape.size;
        if (shape.y > h + shape.size) shape.y = -shape.size;

        ctx!.save();
        ctx!.translate(shape.x, shape.y);
        ctx!.rotate(shape.rotation);
        ctx!.globalAlpha = shape.opacity;
        ctx!.strokeStyle = shape.color;
        ctx!.fillStyle = shape.color;
        ctx!.lineWidth = shape.lineWidth;

        if (shape.type === 'circle') {
          ctx!.beginPath();
          ctx!.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
          if (shape.filled) {
            ctx!.fill();
          } else {
            ctx!.stroke();
          }
        } else if (shape.type === 'rect') {
          const half = shape.size / 2;
          if (shape.filled) {
            ctx!.fillRect(-half, -half * 0.6, shape.size, shape.size * 0.6);
          } else {
            ctx!.strokeRect(-half, -half * 0.6, shape.size, shape.size * 0.6);
          }
        } else if (shape.type === 'triangle') {
          drawTriangle(ctx!, shape.size);
          if (shape.filled) {
            ctx!.fill();
          } else {
            ctx!.stroke();
          }
        } else {
          ctx!.beginPath();
          ctx!.moveTo(-shape.size / 2, 0);
          ctx!.lineTo(shape.size / 2, 0);
          ctx!.stroke();
        }

        // Glow effect on mouse proximity
        if (mouseInfluence > 0.1 && shape.type === 'circle') {
          ctx!.globalAlpha = mouseInfluence * 0.06;
          ctx!.shadowColor = shape.color;
          ctx!.shadowBlur = 40;
          ctx!.beginPath();
          ctx!.arc(0, 0, shape.size / 2 + 10, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.shadowBlur = 0;
        }

        ctx!.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', () => {
      resize();
      initShapes();
    });

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
