import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  Shield,
  Sparkles,
  Award,
  ChevronDown,
  Volume2,
  AlertCircle,
  TrendingDown,
  Target,
  Swords,
} from 'lucide-react';
import type { BreakAniimo, BossTarget, BreakGear, SimulationResult } from '../types/aniimo';
import { simulateBreakCombat, getElementalMultiplier, getBodySizeHitModifier } from '../utils/breakCalculations';
import { playBreakShatterSound, playUiClickSound } from '../utils/audio';

interface InteractiveBreakSimulatorProps {
  aniimoList: BreakAniimo[];
  bossList: BossTarget[];
  gearList: BreakGear[];
  initialSelectedAniimoId?: string;
}

export const InteractiveBreakSimulator: React.FC<InteractiveBreakSimulatorProps> = ({
  aniimoList,
  bossList,
  gearList,
  initialSelectedAniimoId,
}) => {
  const [selectedAniimoId, setSelectedAniimoId] = useState<string>(
    initialSelectedAniimoId || aniimoList[0]?.id || 'inferlupa'
  );
  const [selectedBossId, setSelectedBossId] = useState<string>(bossList[0]?.id || 'colossal_tide_drake');
  const [selectedGearId, setSelectedGearId] = useState<string>('gargantuan_horn');
  const [awakeningStars, setAwakeningStars] = useState<number>(2);

  // Live simulation states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentProgressPct, setCurrentProgressPct] = useState<number>(100);
  const [currentPoiseHp, setCurrentPoiseHp] = useState<number>(bossList[0]?.breakGaugeHp || 24000);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isBroken, setIsBroken] = useState<boolean>(false);
  const [staggerCountdown, setStaggerCountdown] = useState<number>(0);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [floatingDamage, setFloatingDamage] = useState<{ id: number; text: string; isCrit: boolean }[]>([]);

  const animTimerRef = useRef<number | null>(null);
  const staggerTimerRef = useRef<number | null>(null);

  // Active objects
  const activeAniimo = aniimoList.find((a) => a.id === selectedAniimoId) || aniimoList[0];
  const activeBoss = bossList.find((b) => b.id === selectedBossId) || bossList[0];
  const activeGear = gearList.find((g) => g.id === selectedGearId) || null;

  // Synced initial selection if prop changes
  useEffect(() => {
    if (initialSelectedAniimoId) {
      setSelectedAniimoId(initialSelectedAniimoId);
      resetSimulation();
    }
  }, [initialSelectedAniimoId]);

  // Reset when boss or attacker changes
  useEffect(() => {
    resetSimulation();
  }, [selectedBossId, selectedAniimoId, selectedGearId, awakeningStars]);

  const resetSimulation = () => {
    if (animTimerRef.current) cancelAnimationFrame(animTimerRef.current);
    if (staggerTimerRef.current) clearInterval(staggerTimerRef.current);
    setIsRunning(false);
    setIsBroken(false);
    setCurrentProgressPct(100);
    setCurrentPoiseHp(activeBoss.breakGaugeHp);
    setElapsedSeconds(0);
    setStaggerCountdown(0);
    setCombatLog([`Arena Ready: ${activeAniimo.name} vs ${activeBoss.name}`]);
    setFloatingDamage([]);
  };

  const startLiveSimulation = () => {
    playUiClickSound();
    resetSimulation();
    setIsRunning(true);

    const sim = simulateBreakCombat(activeAniimo, activeBoss, activeGear, awakeningStars, 25);
    const totalSimDuration = sim.timeToBreakSec;
    const realPlaybackDurationMs = Math.min(6000, Math.max(2500, totalSimDuration * 500)); // Smooth presentation speed
    const startTime = performance.now();

    const updateFrame = (now: number) => {
      const delta = now - startTime;
      const progressRatio = Math.min(1, delta / realPlaybackDurationMs);

      // Interpolate remaining gauge
      const currentPct = 100 - progressRatio * 100;
      const currentHp = Math.max(0, Math.round(activeBoss.breakGaugeHp * (currentPct / 100)));
      const simulatedElapsedSec = Number((progressRatio * totalSimDuration).toFixed(1));

      setCurrentProgressPct(Number(currentPct.toFixed(1)));
      setCurrentPoiseHp(currentHp);
      setElapsedSeconds(simulatedElapsedSec);

      // Periodically trigger hit effects
      if (Math.random() < 0.25 && progressRatio < 0.98) {
        const hitVal = Math.round(activeBoss.breakGaugeHp * 0.05 * (1 + Math.random() * 0.4));
        setFloatingDamage((prev) => [
          ...prev.slice(-4),
          { id: Date.now() + Math.random(), text: `-${hitVal} POISE`, isCrit: Math.random() > 0.6 },
        ]);
      }

      if (progressRatio < 1) {
        animTimerRef.current = requestAnimationFrame(updateFrame);
      } else {
        // BREAK TRIGGERED!
        setIsRunning(false);
        setIsBroken(true);
        setCurrentProgressPct(0);
        setCurrentPoiseHp(0);
        playBreakShatterSound();

        setCombatLog((prev) => [
          `💥 [${totalSimDuration}s] CRITICAL SHATTER: ${activeBoss.name} Break Gauge fully destroyed!`,
          `🔥 Target entered STAGGERED state! +200% Damage window active for ${sim.staggerWindowSec}s.`,
          ...prev,
        ]);

        // Countdown for stagger window
        setStaggerCountdown(sim.staggerWindowSec);
        staggerTimerRef.current = window.setInterval(() => {
          setStaggerCountdown((c) => {
            if (c <= 0.1) {
              if (staggerTimerRef.current) clearInterval(staggerTimerRef.current);
              return 0;
            }
            return Number((c - 0.1).toFixed(1));
          });
        }, 100);
      }
    };

    animTimerRef.current = requestAnimationFrame(updateFrame);
  };

  // Precomputed theoretical result for display
  const theoreticalResult = simulateBreakCombat(activeAniimo, activeBoss, activeGear, awakeningStars);
  const elemMulti = getElementalMultiplier(activeAniimo.element, activeBoss.element);
  const sizeMulti = getBodySizeHitModifier(activeAniimo.bodySize, activeBoss.bodySize);

  return (
    <section id="simulator" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black tracking-wider uppercase mb-2">
          <Zap className="w-3.5 h-3.5 text-cyan-600" />
          Real-Time Combat Sandbox
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Interactive Break Battle Arena
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          Select any Break companion, adjust gear and awakening stars, and witness real-time posture gauge shatter!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Loadout (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-5">
            <h3 className="font-heading font-black text-lg text-slate-800 flex items-center gap-2">
              <Swords className="w-5 h-5 text-cyan-600" />
              Assault Configuration
            </h3>

            {/* 1. Pick Breaker */}
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                1. Select Break Aniimo:
              </label>
              <select
                value={selectedAniimoId}
                onChange={(e) => { playUiClickSound(); setSelectedAniimoId(e.target.value); }}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-800 focus:outline-hidden focus:border-sky-400 cursor-pointer"
              >
                {aniimoList.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.tier}] {a.name} ({a.element} · {a.stats.timeToBreakSec}s TTB)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Pick Boss Target */}
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                2. Select Target Boss:
              </label>
              <select
                value={selectedBossId}
                onChange={(e) => { playUiClickSound(); setSelectedBossId(e.target.value); }}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-800 focus:outline-hidden focus:border-sky-400 cursor-pointer"
              >
                {bossList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.element} · {b.breakGaugeHp.toLocaleString()} Poise HP)
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Pick Gear */}
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                3. Equip Break Relic / Weapon:
              </label>
              <select
                value={selectedGearId}
                onChange={(e) => { playUiClickSound(); setSelectedGearId(e.target.value); }}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-800 focus:outline-hidden focus:border-sky-400 cursor-pointer"
              >
                <option value="">No Gear (Base Stats)</option>
                {gearList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} (+{g.breakBoostPercent}% Break DMG)
                  </option>
                ))}
              </select>
              {activeGear && (
                <div className="mt-1.5 text-[11px] text-cyan-700 bg-cyan-50/70 p-2 rounded-xl border border-cyan-100">
                  <span className="font-bold">Relic Effect:</span> {activeGear.bonusEffect}
                </div>
              )}
            </div>

            {/* 4. Awakening Stars Selector (0 to 5) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  4. Capability Awakening:
                </label>
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {awakeningStars} ★ Stars
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => { playUiClickSound(); setAwakeningStars(star); }}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      awakeningStars === star
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {star === 0 ? 'Base' : `${star}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Matchup Multipliers Summary */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Elemental Affinity Multiplier:</span>
                <span className={`font-mono-num font-black ${elemMulti > 1 ? 'text-emerald-600' : elemMulti < 1 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {elemMulti}x ({elemMulti > 1 ? 'Advantage' : elemMulti < 1 ? 'Disadvantage' : 'Neutral'})
                </span>
              </div>
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Boss Hitbox Size Multiplier:</span>
                <span className="font-mono-num font-black text-cyan-700">
                  {sizeMulti}x ({activeBoss.bodySize})
                </span>
              </div>
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Armor Hardness Mitigation:</span>
                <span className="font-mono-num font-black text-purple-700">
                  {activeBoss.armorHardness} Hardness vs {activeAniimo.stats.shieldPenetration}% Pierce
                </span>
              </div>
            </div>

            {/* Launch / Reset Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={startLiveSimulation}
                disabled={isRunning}
                className={`flex-1 py-3.5 px-5 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                  isRunning
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-600 hover:to-cyan-600 text-white shadow-sky-500/25 hover:scale-[1.02] active:scale-95'
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isRunning ? 'Assault in Progress...' : 'INITIATE BREAK ASSAULT'}</span>
              </button>

              <button
                type="button"
                onClick={resetSimulation}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                title="Reset Arena"
                aria-label="Reset arena"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Live Arena Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="relative rounded-3xl bg-slate-900 border-2 border-sky-400/40 p-6 sm:p-8 text-white shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between">
            
            {/* Ambient Background Grid and Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/40 via-slate-900 to-slate-950 pointer-events-none" />
            
            {/* Top Bar: Combatant Cards */}
            <div className="relative z-10 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              
              {/* Attacker Info */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeAniimo.gradient} p-0.5 shadow-md flex items-center justify-center`}>
                  <div className="w-full h-full bg-slate-900/60 rounded-[14px] flex items-center justify-center font-heading font-black text-lg text-white">
                    {activeAniimo.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    BREAKER · {activeAniimo.tier} TIER
                  </div>
                  <div className="font-heading font-black text-base text-white">
                    {activeAniimo.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    {activeAniimo.element} · {activeAniimo.stats.breakMultiplier}% Multi
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-400">
                VS
              </div>

              {/* Boss Info */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                    BOSS TARGET · {activeBoss.bodySize}
                  </div>
                  <div className="font-heading font-black text-base text-white">
                    {activeBoss.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    {activeBoss.element} · {activeBoss.armorHardness} Armor
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-lg">
                  ☠
                </div>
              </div>

            </div>

            {/* Central Combat Arena Screen */}
            <div className="relative z-10 my-6 py-4 flex flex-col items-center justify-center">
              
              {/* Floating Damage Numbers */}
              <div className="relative h-12 w-full flex items-center justify-center pointer-events-none">
                {floatingDamage.map((d) => (
                  <span
                    key={d.id}
                    className={`absolute animate-bounce font-heading font-black text-sm tracking-wide ${
                      d.isCrit ? 'text-amber-300 text-base' : 'text-cyan-400'
                    }`}
                  >
                    {d.text} {d.isCrit ? '⚡ CRIT' : ''}
                  </span>
                ))}
              </div>

              {/* BOSS BREAK GAUGE */}
              <div className="w-full max-w-lg space-y-2">
                <div className="flex items-center justify-between text-xs font-black tracking-wide">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    BOSS BREAK GAUGE (POISE)
                  </span>
                  <span className="font-mono-num text-cyan-300">
                    {currentPoiseHp.toLocaleString()} / {activeBoss.breakGaugeHp.toLocaleString()} ({currentProgressPct}%)
                  </span>
                </div>

                {/* Meter Bar */}
                <div className={`relative h-6 w-full rounded-full bg-slate-800 p-1 border ${
                  isBroken ? 'border-red-500 animate-break-pulse' : 'border-slate-700'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      isBroken
                        ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-400'
                        : currentProgressPct < 30
                        ? 'bg-gradient-to-r from-amber-500 to-red-500 animate-pulse'
                        : 'bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400'
                    }`}
                    style={{ width: `${currentProgressPct}%` }}
                  />

                  {/* Armor Section Tick Marks */}
                  <div className="absolute inset-0 flex justify-between px-6 pointer-events-none">
                    <div className="w-0.5 h-full bg-slate-900/50" />
                    <div className="w-0.5 h-full bg-slate-900/50" />
                    <div className="w-0.5 h-full bg-slate-900/50" />
                  </div>
                </div>
              </div>

              {/* BREAK STATE CELEBRATION OVERLAY */}
              {isBroken && (
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/20 via-amber-500/20 to-orange-500/20 border-2 border-amber-400 backdrop-blur-md text-center animate-bounce">
                  <div className="inline-flex items-center gap-2 text-amber-300 font-heading font-black text-2xl tracking-wider">
                    <Sparkles className="w-6 h-6 animate-spin" />
                    💥 BREAK STATE ACHIEVED!
                  </div>
                  <div className="text-xs text-white/90 font-bold mt-1">
                    Boss is incapacitated! +200% Team Damage Active:
                    <span className="ml-2 font-mono-num text-amber-300 text-sm font-black">
                      {staggerCountdown}s remaining
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Real-time Analytics & Log */}
            <div className="relative z-10 border-t border-slate-800 pt-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Simulated TTB</div>
                  <div className="font-heading font-black text-lg text-cyan-400 font-mono-num">
                    {theoreticalResult.timeToBreakSec}s
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Effective Break DPS</div>
                  <div className="font-heading font-black text-lg text-emerald-400 font-mono-num">
                    {theoreticalResult.effectiveBreakDps.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Stagger Duration</div>
                  <div className="font-heading font-black text-lg text-amber-400 font-mono-num">
                    {theoreticalResult.staggerWindowSec}s
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Hits</div>
                  <div className="font-heading font-black text-lg text-purple-400 font-mono-num">
                    {theoreticalResult.totalHits}
                  </div>
                </div>

              </div>

              {/* Combat Event Console */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-24 overflow-y-auto space-y-1">
                {combatLog.map((log, i) => (
                  <div key={i} className="leading-snug">
                    <span className="text-cyan-400 font-bold">&gt; </span>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};
