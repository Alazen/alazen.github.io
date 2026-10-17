import React from 'react';
import { Sparkles, Shield, Zap, Target, BookOpen, Clock, Activity, Cpu } from 'lucide-react';

export const BreakMechanicsInfographic: React.FC = () => {
  return (
    <section id="mechanics" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black tracking-wider uppercase mb-2">
          <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
          Combat Deep Dive
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How the Aniimo Break System Works
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          Understanding the mathematical formulas, poise posture thresholds, and stagger damage multipliers.
        </p>
      </div>

      {/* 3 Phases of Combat Break - Styled like Launch Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Phase 1 */}
        <div className="rounded-3xl aniimo-card p-6 border border-sky-100 relative flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-black">
              01
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-sky-600">
              Phase 1 · Poise Depletion
            </div>
            <h3 className="font-heading font-black text-xl text-slate-800">
              Shield & Posture Erosion
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Every elite enemy and boss possesses a dedicated Break Gauge (Poise HP).
              Attacks from Break-role Aniimo deal specialized posture damage scaled by their
              <span className="font-bold text-sky-700"> Break Multiplier (%)</span>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-50 text-[11px] font-bold text-cyan-700 bg-sky-50/70 p-2.5 rounded-xl">
            Key Stat: Break Multiplier & Hit Frequency
          </div>
        </div>

        {/* Phase 2 */}
        <div className="rounded-3xl aniimo-card p-6 border border-sky-100 relative flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
              02
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-orange-600">
              Phase 2 · Armor Hardness Shatter
            </div>
            <h3 className="font-heading font-black text-xl text-slate-800">
              Shield Penetration Check
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Heavily armored bosses (like Ruin Golem Exarch) reduce incoming posture damage
              by up to 80%. Breakers equipped with high <span className="font-bold text-orange-700">Shield Penetration</span> bypass
              defensive mitigation directly.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-50 text-[11px] font-bold text-orange-700 bg-orange-50/70 p-2.5 rounded-xl">
            Key Stat: Shield Piercing % (Minespine / Inferlupa)
          </div>
        </div>

        {/* Phase 3 */}
        <div className="rounded-3xl aniimo-card p-6 border border-sky-100 relative flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black">
              03
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-purple-600">
              Phase 3 · Stagger State
            </div>
            <h3 className="font-heading font-black text-xl text-slate-800">
              +200% Burst DPS Window
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              When the gauge reaches 0%, the boss collapses into an incapacitated Stagger state.
              Enemy boss ultimate arts are completely canceled and all party damage is multiplied by
              <span className="font-bold text-purple-700"> 2.0x ~ 2.5x</span> for 7-12 seconds!
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-50 text-[11px] font-bold text-purple-700 bg-purple-50/70 p-2.5 rounded-xl">
            Key Stat: Stagger Duration Extension (Irisalis / Geoclaw)
          </div>
        </div>

      </div>

      {/* FORMULA CARD (Styled like Aniimo Event Calendar Card) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm">
        
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-cyan-600" />
          <h3 className="font-heading font-black text-lg text-slate-800">
            Official Break Gauge Damage Formula
          </h3>
        </div>

        {/* Math code banner */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto shadow-inner leading-relaxed">
          <code>
            Break DPS = [ Base Break Stat × Multiplier% ] × Elemental Factor (0.85x ~ 1.25x) × Hitbox Multi (0.90x ~ 1.20x) × [ 1 - (Armor × (1 - ShieldPen%)) / 150 ]
          </code>
        </div>

        {/* Explanatory Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
            <div className="font-black text-slate-800 mb-1">Elemental Synergy</div>
            <p className="text-slate-600">
              Element counters grant +25% posture damage. Prismana breakers like Inferlupa and Wavwal possess universal 1.15x affinity!
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
            <div className="font-black text-slate-800 mb-1">Hitbox Density</div>
            <p className="text-slate-600">
              Colossal boss models take 1.20x posture damage because multi-hit broad swings land all intermediate damage ticks.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
            <div className="font-black text-slate-800 mb-1">Gear Calibration</div>
            <p className="text-slate-600">
              Equipping the Gargantuan Horn or Shatter Core Mk. IV boosts break power by +20-24% and adds critical stun seconds.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
            <div className="font-black text-slate-800 mb-1">5★ Awakening Cap</div>
            <p className="text-slate-600">
              Full 5★ awakening unlocks execute mechanics (e.g. Inferlupa instantly shatters remaining 15% gauge when boss is weak).
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};
