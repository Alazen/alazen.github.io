import React, { useState } from 'react';
import { Users, Sparkles, Shield, Zap, Plus, X, Award, Check } from 'lucide-react';
import type { BreakAniimo } from '../types/aniimo';
import { playUiClickSound } from '../utils/audio';

interface TeamBuilderProps {
  allAniimo: BreakAniimo[];
}

interface TeamPreset {
  name: string;
  desc: string;
  breakerId: string;
  subDps: string;
  carryDps: string;
  support: string;
  rating: string;
}

const PRESETS: TeamPreset[] = [
  {
    name: 'Infernal Cataclysm (Meta S+)',
    desc: 'The #1 competitive break cycle. Inferlupa strips poise in 4.1s while applying +35% vulnerability for the hypercarry.',
    breakerId: 'inferlupa',
    subDps: 'Glynsera',
    carryDps: 'Ignis Prime',
    support: 'Mellobium',
    rating: '99.8 / 100',
  },
  {
    name: 'Glacial Absolute Zero',
    desc: 'Wavwal drenches boss with Hydro soaking, enabling Geoclaw to freeze & detonate 250% poise chunks.',
    breakerId: 'wavwal',
    subDps: 'geoclaw',
    carryDps: 'Frost Fang',
    support: 'Irisalis',
    rating: '96.5 / 100',
  },
  {
    name: 'Unstoppable Seismic Burrow',
    desc: 'Minespine burrows with 100% invulnerability frames to shred heavy armor without taking a scratch.',
    breakerId: 'minespine',
    subDps: 'dazmand',
    carryDps: 'Terra Drake',
    support: 'Mellobium',
    rating: '95.2 / 100',
  },
];

export const TeamBuilder: React.FC<TeamBuilderProps> = ({ allAniimo }) => {
  const [selectedBreakerId, setSelectedBreakerId] = useState<string>('inferlupa');
  const [subBreakerId, setSubBreakerId] = useState<string>('glynsera');
  const [carryRole, setCarryRole] = useState<string>('Prismana Astral Hypercarry');
  const [supportRole, setSupportRole] = useState<string>('Aureate Light Buffer');

  const activeBreaker = allAniimo.find((a) => a.id === selectedBreakerId) || allAniimo[0];
  const activeSub = allAniimo.find((a) => a.id === subBreakerId) || allAniimo[1];

  // Calculated Party Synergies
  const combinedTimeToBreak = Number(((activeBreaker.stats.timeToBreakSec * 0.7) + (activeSub.stats.timeToBreakSec * 0.3)).toFixed(1));
  const totalStaggerWindow = Number((8.0 + activeBreaker.stats.staggerDurationBonus + (activeSub.stats.staggerDurationBonus * 0.5)).toFixed(1));
  const teamVulnerabilityPct = 200 + (activeBreaker.id === 'inferlupa' ? 35 : 15) + (activeSub.id === 'irisalis' ? 25 : 10);

  const applyPreset = (preset: TeamPreset) => {
    playUiClickSound();
    setSelectedBreakerId(preset.breakerId);
    setSubBreakerId(preset.subDps);
    setCarryRole(preset.carryDps);
    setSupportRole(preset.support);
  };

  return (
    <section id="team-builder" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black tracking-wider uppercase mb-2">
          <Users className="w-3.5 h-3.5 text-purple-600" />
          Party Synergy Engine
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Break Team Composition Architect
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          Combine primary breakers, sub-stagger specialists, and DPS carries for flawless boss break cycles.
        </p>
      </div>

      {/* Recommended Meta Presets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PRESETS.map((p) => (
          <div
            key={p.name}
            onClick={() => applyPreset(p)}
            className="p-4 rounded-3xl bg-white border border-sky-100 hover:border-cyan-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            role="button"
            tabIndex={0}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-heading font-black text-sm text-slate-800">{p.name}</span>
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {p.rating}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{p.desc}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-cyan-600">
              <span>Load Archetype</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Team Visualizer Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-8">
        
        {/* 4 Team Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Slot 1: Primary Breaker */}
          <div className="rounded-2xl border-2 border-sky-400 p-4 bg-sky-50/50 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-600 mb-1">
                SLOT 1 · MAIN BREAKER
              </div>
              <select
                value={selectedBreakerId}
                onChange={(e) => { playUiClickSound(); setSelectedBreakerId(e.target.value); }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-bold text-xs text-slate-800 cursor-pointer"
              >
                {allAniimo.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.tier} · {a.element})
                  </option>
                ))}
              </select>

              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">{activeBreaker.name}</div>
                <div className="text-[11px] font-mono-num text-emerald-600 font-bold">
                  ⚡ {activeBreaker.stats.timeToBreakSec}s Solo TTB
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  "{activeBreaker.passiveBreakTrait}"
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-sky-200/60 text-[10px] font-extrabold text-sky-700">
              Core Posture Crusher
            </div>
          </div>

          {/* Slot 2: Sub-Breaker */}
          <div className="rounded-2xl border border-purple-200 p-4 bg-purple-50/40 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-purple-600 mb-1">
                SLOT 2 · SUB-BREAKER / OFF-FIELD
              </div>
              <select
                value={subBreakerId}
                onChange={(e) => { playUiClickSound(); setSubBreakerId(e.target.value); }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 font-bold text-xs text-slate-800 cursor-pointer"
              >
                {allAniimo.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.tier} · {a.element})
                  </option>
                ))}
              </select>

              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">{activeSub.name}</div>
                <div className="text-[11px] font-mono-num text-purple-600 font-bold">
                  +{activeSub.stats.staggerDurationBonus}s Stagger Extension
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  "{activeSub.signatureSkill.name}"
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-purple-200/60 text-[10px] font-extrabold text-purple-700">
              CC & Stagger Enhancer
            </div>
          </div>

          {/* Slot 3: Hypercarry DPS */}
          <div className="rounded-2xl border border-amber-200 p-4 bg-amber-50/40 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-1">
                SLOT 3 · BURST HYPERCARRY
              </div>
              <input
                type="text"
                value={carryRole}
                onChange={(e) => setCarryRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-bold text-xs text-slate-800"
              />
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Unleashes Stagger Window</div>
                <div className="text-[11px] text-amber-700 font-bold">
                  Takes advantage of +{teamVulnerabilityPct}% Burst Damage!
                </div>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-amber-200/60 text-[10px] font-extrabold text-amber-700">
              Primary DPS Finisher
            </div>
          </div>

          {/* Slot 4: Support / Healer */}
          <div className="rounded-2xl border border-emerald-200 p-4 bg-emerald-50/40 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1">
                SLOT 4 · UTILITY / BUFFER
              </div>
              <input
                type="text"
                value={supportRole}
                onChange={(e) => setSupportRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 font-bold text-xs text-slate-800"
              />
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Sustains Break Energy</div>
                <div className="text-[11px] text-emerald-700 font-bold">
                  Resets dash stamina & grants +25% Aura
                </div>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-emerald-200/60 text-[10px] font-extrabold text-emerald-700">
              Stamina & Aura Engine
            </div>
          </div>

        </div>

        {/* Party Metrics Output */}
        <div className="rounded-2xl bg-slate-900 p-6 text-white grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Estimated Team Break Speed</div>
            <div className="font-heading font-black text-3xl text-cyan-400 font-mono-num mt-1">
              {combinedTimeToBreak}s
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Dual-assault break rotation</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Total Stagger DPS Window</div>
            <div className="font-heading font-black text-3xl text-amber-400 font-mono-num mt-1">
              {totalStaggerWindow}s
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Base 8s + Breaker Stun extensions</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Stagger Damage Multiplier</div>
            <div className="font-heading font-black text-3xl text-rose-400 font-mono-num mt-1">
              +{teamVulnerabilityPct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Critical break execution multiplier</div>
          </div>
        </div>

      </div>

    </section>
  );
};
