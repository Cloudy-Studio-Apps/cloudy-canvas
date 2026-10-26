import { useEffect, useRef } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { ConfettiPiece, ConfettiProps } from "./confetti.types";

const DURATION = 3.2;
const THEME_COLORS = ["--primary", "--accent", "--success", "--warning", "--design", "--board"];

/** The theme's own colors, for confetti given none. */
function themeColors(): string[] {
  const style = getComputedStyle(document.documentElement);
  return THEME_COLORS.map((name) => style.getPropertyValue(name).trim()).filter(Boolean);
}

function launch(width: number, height: number, colors: readonly string[], count: number) {
  return Array.from({ length: count }, (_, i): ConfettiPiece => ({
    x: width / 2 + (Math.random() - 0.5) * 160,
    y: height * 0.32,
    vx: (Math.random() - 0.5) * 13,
    vy: -6 - Math.random() * 10,
    w: 5 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.35,
    color: colors[i % colors.length] ?? "currentColor",
    round: Math.random() < 0.25,
  }));
}

/**
 * A burst of confetti over its positioned parent, falling and fading out in about three seconds;
 * clicks pass through it. Nothing moves when the system asks for reduced motion.
 */
export function Confetti({ colors, burst = 0, count = 170, className }: ConfettiProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Read once per burst, so new colors don't restart it.
  const colorsRef = useRef(colors);
  // Runs before the burst's effect below, so a burst uses the colors it rendered with.
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const g = canvas.getContext("2d");
    if (!g) return;
    g.scale(dpr, dpr);
    const palette = colorsRef.current?.length ? colorsRef.current : themeColors();
    const pieces = launch(width, height, palette, count);
    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      g.clearRect(0, 0, width, height);
      g.globalAlpha = Math.max(0, Math.min(1, DURATION - t));
      for (const p of pieces) {
        p.vy += 0.32;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.angle);
        g.fillStyle = p.color;
        if (p.round) {
          g.beginPath();
          g.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          g.fill();
        } else {
          // Turning over: its height shrinks and grows as it flips.
          g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.angle * 2)) + 2);
        }
        g.restore();
      }
      if (t < DURATION + 0.1) frame = requestAnimationFrame(draw);
      else g.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [burst, count]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-50 size-full", className)}
    />
  );
}
