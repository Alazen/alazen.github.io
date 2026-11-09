import React from 'react';
import { X, Sparkles, Shield, Zap, Award, Check, Play, Flame, ExternalLink } from 'lucide-react';
import type { BreakAniimo } from '../types/aniimo';
import { ELEMENT_ICONS } from '../data/aniimoData';
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
        
        {/* Top Banner with gradient, character art showcase & title */}
        <div className={`relative p-6 sm:p-8 bg-gradient-to-r ${aniimo.gradient} text-white overflow-hidden`}>
          
          {/* Background Ambient Glow */}
          <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-white/20 blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => { playUiClickSound(); onClose(); }}
            className="absolute top-5 right-5 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="space-y-2 max-w-md">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-xs font-black">
                  TIER {aniimo.tier}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-xs font-black flex items-center gap-1.5">
                  <img src={ELEMENT_ICONS[aniimo.element]} alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>{aniimo.rarity}★ {aniimo.element}</span>
                </span>
                {aniimo.isPrismana && (
                  <span className="px-3 py-1 rounded-xl bg-white text-purple-900 text-xs font-black flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" /> Prismana
                  </span>
                )}
              </div>

              <h3 className="font-heading font-black text-3xl sm:text-4xl tracking-tight leading-tight">
                {aniimo.name}
              </h3>
              <p className="text-white/90 font-medium italic text-sm">
                "{aniimo.alias}" — {aniimo.headline}
              </p>
            </div>

            {/* Official 3D Character Model / Artwork */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-md" />
              <img
                src={aniimo.imageUrl}
                alt={aniimo.name}
                className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform"
              />
            </div>

          </div>

        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
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
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Signature Break Ability
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                {aniimo.signatureSkill.type}
              </span>
            </div>

            <div>
              <div className="font-heading font-black text-lg text-slate-800">
                {aniimo.signatureSkill.name}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {aniimo.signatureSkill.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold">Gauge Shred</div>
                <div className="font-black text-sky-600 font-mono-num">
                  {aniimo.signatureSkill.breakGaugeMultiplier}%
                </div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold">Cooldown</div>
                <div className="font-black text-slate-800 font-mono-num">
                  {aniimo.signatureSkill.cooldownSec}s
                </div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold">Hit Count</div>
                <div className="font-black text-slate-800 font-mono-num">
                  {aniimo.signatureSkill.hitCount} Hits
                </div>
              </div>
            </div>

            <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{aniimo.signatureSkill.specialEffect}</span>
            </div>
          </div>

          {/* Awakening 1-5 Stars */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Awakening Potentials (1★ – 5★)
            </h4>
            <div className="space-y-2">
              {aniimo.awakenings.map((a) => (
                <div
                  key={a.star}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-300 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center font-mono-num">
                      {a.star}★
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 mr-2">{a.title}:</span>
                      <span className="text-slate-600 font-medium">{a.effect}</span>
                    </div>
                  </div>
                  <span className="font-mono-num font-black text-emerald-600 shrink-0 ml-2">
                    +{a.breakBonusPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
              <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Strengths
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {aniimo.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100">
              <div className="text-xs font-black text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Considerations
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {aniimo.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTAs in Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => { playUiClickSound(); onClose(); }}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => { playUiClickSound(); onLaunchInSim(aniimo); onClose(); }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black text-xs shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Simulate in Battle Lab</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
