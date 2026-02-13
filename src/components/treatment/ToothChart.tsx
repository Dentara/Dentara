// components/treatment/ToothChart.tsx
"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/** Public API */
export type ToothLatestInfo = {
  category?: string | null;
  dateISO?: string | null;
  provider?: string | null;
  code?: string | null;
  name?: string | null;
};
export type ToothChartProps = {
  latestMap?: Record<number, ToothLatestInfo>;      // { 36: { category: "ENDODONTIC", ... } }
  segmentsMap?: Record<number, string[]>;           // { 36: ["ENDODONTIC","RESTORATIVE","PROSTHETIC"] }
  multiple?: boolean;
  value?: number[];
  onChange?: (numbers: number[]) => void;
  readOnly?: boolean;
  className?: string;
};

/* ---------- FDI sıraları ---------- */
const TOP_R = [18,17,16,15,14,13,12,11];
const TOP_L = [21,22,23,24,25,26,27,28];
const BOT_R = [48,47,46,45,44,43,42,41];
const BOT_L = [31,32,33,34,35,36,37,38];

/* ---------- Rənglər (legend ilə eyni) ---------- */
const CAT_HEX: Record<string, string> = {
  EXAM: "#0ea5e9",
  PREVENTIVE: "#0ea5e9",
  RESTORATIVE: "#2563eb",
  ENDODONTIC: "#7c3aed",
  PERIODONTIC: "#059669",
  PROSTHETIC: "#d97706",
  ORTHODONTIC: "#f97316",
  SURGICAL: "#dc2626",
  IMPLANT: "#dc2626",
  OTHER: "#e5e7eb",
};

function colorOf(cat?: string | null) {
  if (!cat) return CAT_HEX.OTHER;
  const key = String(cat).toUpperCase();
  return CAT_HEX[key] ?? CAT_HEX.OTHER;
}

/* ---------- Yardımçı ---------- */
function latestCategory(latestMap?: Record<number, ToothLatestInfo>, n?: number) {
  if (!latestMap || n == null) return undefined;
  return latestMap[n]?.category ?? undefined;
}

/* ---------- Diş kapsulu (kvadrat) ---------- */
function ToothPill({
  n,
  bands,
  active,
  disabled,
  onClick,
  tooltip,
}: {
  n: number;
  bands: string[]; // 0..3 hex rəng
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  tooltip?: string;
}) {
  const [c1, c2, c3] = [
    bands[0] ?? "transparent",
    bands[1] ?? "transparent",
    bands[2] ?? "transparent",
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-10 h-12 rounded-md border flex flex-col items-center justify-between p-1 bg-white",
        disabled ? "cursor-default opacity-100" : "hover:bg-slate-50",
        active ? "ring-2 ring-offset-2 ring-slate-800" : ""
      )}
      title={tooltip || `Tooth ${n}`}
      aria-label={`Tooth ${n}`}
    >
      <div className="w-full h-2 rounded-sm" style={{ background: c1 }} />
      <div className="w-full h-2 rounded-sm" style={{ background: c2 }} />
      <div className="w-full h-2 rounded-sm" style={{ background: c3 }} />
      <div className="text-[10px] leading-none text-slate-700 mt-1">{n}</div>
    </button>
  );
}

/* ---------- Başlıq (Upper/Lower) ---------- */
function RowHeader({ title }: { title: string }) {
  return (
    <div className="text-center text-xs font-medium text-slate-700 mb-1">
      {title}
    </div>
  );
}

/* ---------- Əsas komponent ---------- */
export default function ToothChart({
  latestMap,
  segmentsMap,
  multiple = true,
  value,
  onChange,
  readOnly,
  className,
}: ToothChartProps) {
  const [internal, setInternal] = useState<number[]>(value || []);
  const selected = value ?? internal;

  const makeBands = (n: number) => {
    const seg = segmentsMap?.[n];
    if (Array.isArray(seg) && seg.length) {
      return seg.slice(0, 3).map(colorOf); // max 3 rəng (üst→alt)
    }
    const single = latestCategory(latestMap, n);
    return single ? [colorOf(single)] : []; // yoxdursa rəngsiz qalır
  };

  function toggle(n: number) {
    if (readOnly) return;
    if (!multiple) {
      const next = [n];
      setInternal(next);
      onChange?.(next);
      return;
    }
    const has = selected.includes(n);
    const next = has ? selected.filter((x) => x !== n) : [...selected, n];
    setInternal(next);
    onChange?.(next);
  }

  const pillTooltip = (n: number) => {
    const seg = segmentsMap?.[n];
    const cat = latestCategory(latestMap, n);
    const cats = seg?.length ? seg.join(" / ") : (cat ? String(cat) : "No data");
    return `${n} • ${cats}`;
  };

  return (
    <div className={cn("rounded-md border p-3 bg-white", className)}>
      {/* Upper jaw */}
      <RowHeader title="Upper jaw" />
      <div className="flex items-center justify-center gap-2 mb-2">
        {TOP_R.map((n) => (
          <ToothPill
            key={n}
            n={n}
            bands={makeBands(n)}
            active={selected.includes(n)}
            disabled={!!readOnly}
            onClick={() => toggle(n)}
            tooltip={pillTooltip(n)}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mb-4">
        {TOP_L.map((n) => (
          <ToothPill
            key={n}
            n={n}
            bands={makeBands(n)}
            active={selected.includes(n)}
            disabled={!!readOnly}
            onClick={() => toggle(n)}
            tooltip={pillTooltip(n)}
          />
        ))}
      </div>

      {/* nazik separator */}
      <div className="my-2 h-px bg-slate-200" />

      {/* Lower jaw — əvvəl 31→38, sonra 41→48 (sənin istədiyin kimi) */}
      <RowHeader title="Lower jaw" />
      <div className="flex items-center justify-center gap-2 mt-2 mb-2">
        {BOT_L.map((n) => ( // 31..38 BİRİNCİ
          <ToothPill
            key={n}
            n={n}
            bands={makeBands(n)}
            active={selected.includes(n)}
            disabled={!!readOnly}
            onClick={() => toggle(n)}
            tooltip={pillTooltip(n)}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        {BOT_R.map((n) => ( // 41..48 İKİNCİ
          <ToothPill
            key={n}
            n={n}
            bands={makeBands(n)}
            active={selected.includes(n)}
            disabled={!!readOnly}
            onClick={() => toggle(n)}
            tooltip={pillTooltip(n)}
          />
        ))}
      </div>

      {!readOnly && selected.length > 0 && (
        <div className="mt-3 text-center text-xs text-slate-600">
          Selected: {selected.sort((a, b) => a - b).join(", ")}
        </div>
      )}
    </div>
  );
}
