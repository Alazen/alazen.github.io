import React from 'react';
import { X, Plus, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import type { BreakAniimo } from '../types/aniimo';
import { playUiClickSound } from '../utils/audio';

interface BreakComparisonViewProps {
  allAniimo: BreakAniimo[];
  selectedCompareIds: string[];
  onRemoveFromCompare: (id: string) => void;
  onAddCompareId: (id: string) => void;
  onClearCompare: () => void;
  onSelectForDetails: (aniimo: BreakAniimo) => void;
}

export const BreakComparisonView: React.FC<BreakComparisonViewProps> = ({
  allAniimo,
  selectedCompareIds,
  onRemoveFromCompare,
  onAddCompareId,
  onClearCompare,
  onSelectForDetails,
}) => {
  const selectedAniimo = allAniimo.filter((a) => selectedCompareIds.includes(a.id));
  const availableToAdd = allAniimo.filter((a) => !selectedCompareIds.includes(a.id));

  const metrics = [
    { key: 'breakEfficiency', label: 'Break Efficiency', max: 100, unit: '/100' },
    { key: 'breakMultiplier', label: 'Break Multiplier', max: 200, unit: '%' },
    { key: 'shieldPenetration', label: 'Shield Piercing', max: 100, unit: '%' },
    { key: 'teamSynergy', label: 'Team Synergy', max: 100, unit: '/100' },
    { key: 'safetyRating', label: 'Safety / Iframes', max: 100, unit: '/100' },
    { key: 'staggerDurationBonus', label: 'Stagger Bonus', max: 4.0, unit: 's' },
  ];

  // SVG Radar Coordinates Generator
  const numAxes = metrics.length;
  const radius = 100;
  const centerX = 140;
  const centerY = 140;

  const getAxisPoint = (axisIndex: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numAxes) * axisIndex - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const colors = ['#f97316', '#8b5cf6', '#0ea5e9']; // Orange, Purple, Sky

  return (
    <section id="comparison" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Direct Face-Off
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Side-by-Side Breaker Comparison
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            Compare up to 3 Aniimo across stagger stats, shield destruction, and kit multipliers.
          </p>
        </div>

        {selectedCompareIds.length > 0 && (
          <button
            onClick={() => { playUiClickSound(); onClearCompare(); }}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
          >
            Clear Selection ({selectedCompareIds.length})
          </button>
        )}
      </div>

      {selectedAniimo.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-sky-200 shadow-xs max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-cyan-600" />
          </div>
          <h3 className="font-heading font-black text-xl text-slate-800">
            No Aniimo Selected for Comparison
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1 max-w-md mx-auto">
            Click the "Compare" button on any Aniimo in the tier list, or select quick candidates below:
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {allAniimo.slice(0, 3).map((a) => (
              <button
                key={a.id}
                onClick={() => { playUiClickSound(); onAddCompareId(a.id); }}
                className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {a.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TOP: Cards & Radar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* SVG RADAR CHART (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                Multi-Axis Posture Performance Radar
              </span>

              <div className="relative w-[280px] h-[280px]">
                <svg width="280" height="280" className="overflow-visible">
                  {/* Background concentric polygons (25%, 50%, 75%, 100%) */}
                  {[0.25, 0.5, 0.75, 1.0].map((level) => {
                    const points = Array.from({ length: numAxes }, (_, i) => {
                      const p = getAxisPoint(i, level);
                      return `${p.x},${p.y}`;
                    }).join(' ');

                    return (
                      <polygon
                        key={level}
                        points={points}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray={level === 1 ? undefined : '3 3'}
                      />
                    );
                  })}

                  {/* Spokes */}
                  {Array.from({ length: numAxes }, (_, i) => {
                    const p = getAxisPoint(i, 1.0);
                    return (
                      <line
                        key={i}
                        x1={centerX}
                        y1={centerY}
                        x2={p.x}
                        y2={p.y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Axis labels */}
                  {metrics.map((m, i) => {
                    const p = getAxisPoint(i, 1.18);
                    return (
                      <text
                        key={m.key}
                        x={p.x}
                        y={p.y}
                        fontSize="9"
                        fontWeight="700"
                        fill="#64748b"
                        textAnchor="middle"
                        alignmentBaseline="central"
                      >
                        {m.label}
                      </text>
                    );
                  })}

                  {/* Render Polygons for each selected Aniimo */}
                  {selectedAniimo.map((aniimo, idx) => {
                    const pts = metrics.map((m, mIdx) => {
                      const rawVal = (aniimo.stats as any)[m.key] || 0;
                      const ratio = Math.max(0.1, Math.min(1.0, rawVal / m.max));
                      return getAxisPoint(mIdx, ratio);
                    });
                    const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(' ');

                    return (
                      <g key={aniimo.id}>
                        <polygon
                          points={pointsStr}
                          fill={colors[idx % colors.length]}
                          fillOpacity="0.25"
                          stroke={colors[idx % colors.length]}
                          strokeWidth="2.5"
                        />
                        {pts.map((p, pIdx) => (
                          <circle
                            key={pIdx}
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            fill={colors[idx % colors.length]}
                          />
                        ))}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Radar Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                {selectedAniimo.map((a, idx) => (
                  <div key={a.id} className="flex items-center gap-1.5 text-xs font-bold">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span className="text-slate-800">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SELECTED ANIIMO PROFILES (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedAniimo.map((aniimo, idx) => (
                <div
                  key={aniimo.id}
                  className="bg-white rounded-3xl p-5 border-2 relative flex flex-col justify-between shadow-xs"
                  style={{ borderColor: colors[idx % colors.length] }}
                >
                  <button
                    onClick={() => { playUiClickSound(); onRemoveFromCompare(aniimo.id); }}
                    className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      Tier {aniimo.tier} · {aniimo.element}
                    </span>
                    <h4 className="font-heading font-black text-lg text-slate-900 mt-0.5">
                      {aniimo.name}
                    </h4>

                    <div className="mt-3 p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
                      <div className="text-[10px] font-bold text-slate-500">Rank Score</div>
                      <div className="font-heading font-black text-2xl text-cyan-600 font-mono-num">
                        {aniimo.breakScore}
                      </div>
                      <div className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
                        ⚡ {aniimo.stats.timeToBreakSec}s TTB
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <div className="text-slate-600">
                        <span className="font-bold">Skill: </span>
                        {aniimo.signatureSkill.name}
                      </div>
                      <div className="text-slate-500 text-[11px] italic">
                        "{aniimo.passiveBreakTrait}"
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { playUiClickSound(); onSelectForDetails(aniimo); }}
                    className="mt-4 w-full py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors"
                  >
                    Full Kit Analysis
                  </button>
                </div>
              ))}

              {/* Add slot placeholder if < 3 */}
              {selectedAniimo.length < 3 && (
                <div className="rounded-3xl border-2 border-dashed border-sky-200 p-5 flex flex-col items-center justify-center text-center bg-white/50">
                  <span className="text-xs font-bold text-slate-500 mb-2">
                    Add another ({selectedAniimo.length}/3)
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        playUiClickSound();
                        onAddCompareId(e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="px-3 py-2 rounded-xl bg-white border border-sky-300 text-xs font-bold text-sky-700 cursor-pointer"
                  >
                    <option value="" disabled>Select Aniimo...</option>
                    {availableToAdd.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.tier})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

          </div>

          {/* METRIC BREAKDOWN BARS */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-6">
            <h3 className="font-heading font-black text-lg text-slate-800">
              Detailed Stat Differential Matrix
            </h3>

            <div className="space-y-4">
              {metrics.map((m) => (
                <div key={m.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black text-slate-700">
                    <span>{m.label}</span>
                    <span className="text-slate-400">Max {m.max}{m.unit}</span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedAniimo.map((a, idx) => {
                      const val = (a.stats as any)[m.key] || 0;
                      const pct = Math.min(100, (val / m.max) * 100);

                      return (
                        <div key={a.id} className="flex items-center gap-3">
                          <span className="w-24 text-[11px] font-bold text-slate-600 truncate">
                            {a.name}
                          </span>
                          <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: colors[idx % colors.length],
                              }}
                            />
                          </div>
                          <span className="w-16 text-right font-mono-num font-black text-xs text-slate-800">
                            {val}{m.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </section>
  );
};
