'use client';

import { useRef, useEffect, useState } from 'react';
import type { MonthlyData } from '@/types/dashboard';

const PAD = { top: 24, right: 52, bottom: 40, left: 52 };

interface LineGraphProps {
  data: MonthlyData[];
}

export default function LineGraph({ data }: LineGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1000, h: 300 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDims({ w: Math.round(width), h: Math.round(height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = dims.w;
  const H = dims.h;
  const gW = W - PAD.left - PAD.right;
  const gH = H - PAD.top - PAD.bottom;
  const step = gW / (data.length - 1);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0) * 1.1 || 1;
  const maxUsers = Math.max(...data.map((d) => d.users), 0) * 1.1 || 1;

  function sy(v: number, m: number) {
    return PAD.top + gH - (v / m) * gH;
  }

  function buildLine(key: 'revenue' | 'users', max: number) {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${PAD.left + i * step},${sy(d[key], max)}`)
      .join(' ');
  }

  const revTicks = [0, maxRevenue / 2, maxRevenue];
  const usrTicks = [0, maxUsers / 2, maxUsers];

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD.left} y1={PAD.top + gH * (1 - f)} x2={PAD.left + gW} y2={PAD.top + gH * (1 - f)} stroke="#F0F0F0" strokeWidth="1" strokeDasharray="4,4" />
        ))}

        {data.map((d, i) => (
          <text key={d.month} x={PAD.left + i * step} y={PAD.top + gH + 22} textAnchor="middle" className="fill-text-secondary text-[10px] font-[family-name:var(--font-manrope)]">
            {d.month}
          </text>
        ))}

        {revTicks.map((t, i) => (
          <text key={`rev-${i}`} x={PAD.left - 10} y={sy(t, maxRevenue) + 4} textAnchor="end" className="fill-text-secondary text-[9px] font-[family-name:var(--font-manrope)]">
            ${(t / 1000).toFixed(0)}K
          </text>
        ))}

        {usrTicks.map((t, i) => (
          <text key={`usr-${i}`} x={PAD.left + gW + 10} y={sy(t, maxUsers) + 4} textAnchor="start" className="fill-text-secondary text-[9px] font-[family-name:var(--font-manrope)]">
            {(t / 1000).toFixed(1)}K
          </text>
        ))}

        <path d={buildLine('revenue', maxRevenue)} fill="none" stroke="#781E36" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={buildLine('users', maxUsers)} fill="none" stroke="#D4A24C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {data.map((d, i) => {
          const x = PAD.left + i * step;
          return (
            <g key={`dots-${i}`}>
              <circle cx={x} cy={sy(d.revenue, maxRevenue)} r="4" fill="#781E36" stroke="white" strokeWidth="2" />
              <circle cx={x} cy={sy(d.users, maxUsers)} r="4" fill="#D4A24C" stroke="white" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
