// src/components/PatternLock.tsx
import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Pattern success → calls Supabase email/password login
interface Props {
  onSuccess: () => void;
}

type Point = { x: number; y: number; index: number };

const PatternLock: React.FC<Props> = ({ onSuccess }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<[number, number][]>([]);

  const secretPattern = (import.meta.env.VITE_SITE_PATTERN || "").trim();
  const loginEmail = import.meta.env.VITE_SITE_USER_EMAIL;
  const loginPassword = import.meta.env.VITE_SITE_USER_PASSWORD;

  const getPoints = (): Point[] => {
    const el = containerRef.current;
    if (!el) return [];
    const rect = el.getBoundingClientRect();
    const gapX = rect.width / 3;
    const gapY = rect.height / 3;

    const pts: Point[] = [];
    let idx = 1;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        pts.push({
          x: gapX * c + gapX / 2,
          y: gapY * r + gapY / 2,
          index: idx++,
        });
      }
    }
    return pts;
  };

  const pointsRef = useRef<Point[]>([]);
  useEffect(() => {
    pointsRef.current = getPoints();
  }, []);

  const findDotUnder = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (const p of pointsRef.current) {
      const dx = p.x - x,
        dy = p.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < rect.width / 10) {
        return p.index;
      }
    }
    return null;
  };

  useEffect(() => {
    const onMove = (e: any) => {
      if (!isDrawing) return;
      const point = "touches" in e ? e.touches[0] : e;
      const hit = findDotUnder(point.clientX, point.clientY);

      if (hit && !selected.includes(hit)) {
        setSelected((prev) => {
          if (prev.length)
            setLines((lines) => [...lines, [prev[prev.length - 1], hit]]);
          return [...prev, hit];
        });
      }
    };

    const onEnd = async () => {
      if (!isDrawing) return;
      setIsDrawing(false);

      const pattern = selected.join("-");

      if (pattern === secretPattern) {
        // LOGIN THROUGH SUPABASE
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });

        if (error) {
          alert("Auth failed: " + error.message);
        } else {
          onSuccess();
        }
      } else {
        const el = containerRef.current;
        if (el) {
          el.classList.add("shake");
          setTimeout(() => el.classList.remove("shake"), 400);
        }
      }

      setSelected([]);
      setLines([]);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDrawing, selected]);

  const startPattern = (e: any) => {
    e.preventDefault();
    setIsDrawing(true);
    const p = "touches" in e ? e.touches[0] : e;
    const hit = findDotUnder(p.clientX, p.clientY);

    if (hit) setSelected([hit]);
  };

  const pts = getPoints();

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-white text-lg font-medium">Draw Unlock Pattern</div>

      <div
        ref={containerRef}
        onMouseDown={startPattern}
        onTouchStart={startPattern}
        className="w-72 h-72 bg-white/10 rounded-xl relative"
        style={{ touchAction: "none" }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {lines.map(([a, b], i) => {
            const A = pointsRef.current.find((p) => p.index === a);
            const B = pointsRef.current.find((p) => p.index === b);
            if (!A || !B) return null;

            return (
              <line
                key={i}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke="rgba(99,102,241,0.8)"
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {pts.map((p) => (
          <div
            key={p.index}
            style={{ left: p.x - 12, top: p.y - 12 }}
            className={`absolute w-6 h-6 rounded-full border-2 ${
              selected.includes(p.index)
                ? "bg-indigo-500 border-indigo-600"
                : "bg-white/10 border-white/30"
            }`}
          />
        ))}
      </div>

      <style>{`
        .shake { animation: shake 0.4s; }
        @keyframes shake {
          0% { transform: translateX(0) }
          25% { transform: translateX(-6px) }
          50% { transform: translateX(6px) }
          75% { transform: translateX(-4px) }
          100% { transform: translateX(0) }
        }
      `}</style>
    </div>
  );
};

export default PatternLock;
