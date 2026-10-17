import React from 'react';
import { X, Sparkles, Shield, Zap, Award, Check, Play, Flame } from 'lucide-react';
import type { BreakAniimo } from '../types/aniimo';
import { playUiClickSound } from '../utils/audio';

interface AniimoDetailModalProps {
  aniimo: BreakAniimo | null;
  onClose: () => void;
  onLaunchInSim: (aniimo: BreakAniimo) => void;
}

export const AniimoDetailModal: React.FC<AniimoDetailModalProps> = ({
  aniimo,
  onClose,
  onLaunchInSim,
}) => {
  if (!aniimo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Banner with gradient & character title */}
        <div className={`relative p-6 sm:p-8 bg-gradient-to-r ${aniimo.gradient} text-white`}>
          <button
            onClick={() => { playUiClickSound(); onClose(); }}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-xs font-black">
              TIER {aniimo.tier}
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-xs font-black">
              {aniimo.rarity}★ {aniimo.element}
            </span>
            {aniimo.isPrismana && (
              <span className="px-3 py-1 rounded-xl bg-white text-purple-900 text-xs font-black flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" /> Prismana
              </span>
            )}
          </div>

          <h3 className="font-heading font-black text-3xl sm:text-4xl tracking-tight">
            {aniimo.name}
          </h3>
          <p className="text-white/80 font-medium italic text-sm mt-0.5">
            "{aniimo.alias}" — {aniimo.headline}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Overview */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Break Role Overview
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {aniimo.overview}
            </p>
          </div>

          {/* Core Stagger Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Rank Score</div>
              <div className="font-heading font-black text-2xl text-cyan-600 font-mono-num">
                {aniimo.breakScore}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Time to Break</div>
              <div className="font-heading font-black text-2xl text-emerald-600 font-mono-num">
                {aniimo.stats.timeToBreakSec}s
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Break Multiplier</div>
              <div className="font-heading font-black text-2xl text-purple-600 font-mono-num">
                +{aniimo.stats.breakMultiplier}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Shield Piercing</div>
              <div className="font-heading font-black text-2xl text-amber-600 font-mono-num">
                {aniimo.stats.shieldPenetration}%
              </div>
            </div>
          </div>

          {/* Signature Skill Breakdown */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-800 uppercase tracking-wider">
                Signature Skill: {aniimo.signatureSkill.name}
              </span>
              <span className="text-[11px] font-extrabold text-sky-600 bg-white px-2.5 py-0.5 rounded-full border border-sky-200">
                {aniimo.signatureSkill.cooldownSec}s CD · {aniimo.signatureSkill.hitCount} Hits
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {aniimo.signatureSkill.description}
            </p>
            {aniimo.signatureSkill.specialEffect && (
              <div className="text-[11px] font-bold text-cyan-700 bg-white p-2 rounded-xl border border-sky-100">
                Special Trait: {aniimo.signatureSkill.specialEffect}
              </div>
            )}
          </div>

          {/* Awakenings 1-5★ Progression */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Capability Awakenings (1★ - 5★)
            </h4>
            <div className="space-y-2">
              {aniimo.awakenings.map((awk) => (
                <div
                  key={awk.star}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 font-black flex items-center justify-center shrink-0 text-[11px]">
                      {awk.star}★
                    </span>
                    <div>
                      <span className="font-black text-slate-800">{awk.title}: </span>
                      <span className="text-slate-600 font-medium">{awk.effect}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-700 font-mono-num shrink-0">
                    +{awk.breakBonusPercent}% Break
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-2">
                Combat Advantages
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                {aniimo.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
              <div className="text-xs font-black text-rose-800 uppercase tracking-wider mb-2">
                Weaknesses & Constraints
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                {aniimo.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={() => { playUiClickSound(); onClose(); }}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              playUiClickSound();
              onClose();
              onLaunchInSim(aniimo);
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-black text-xs shadow-md shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch in Break Simulator</span>
          </button>
        </div>

      </div>

    </div>
  );
};
