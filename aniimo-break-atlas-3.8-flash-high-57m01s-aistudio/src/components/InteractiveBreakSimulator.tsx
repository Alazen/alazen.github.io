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
  Flame,
  Droplets,
  Layers,
} from 'lucide-react';
import type { BreakAniimo, BossTarget, BreakGear, SimulationResult } from '../types/aniimo';
import {
  BREAK_ANIIMO_LIST,
  BOSS_TARGETS,
  BREAK_GEAR_LIST,
  ELEMENT_ICONS,
} from '../data/aniimoData';
import {
  simulateBreakCombat,
  getElementalMultiplier,
  getBodySizeHitModifier,
} from '../utils/breakCalculations';
import { playUiClickSound, playBreakShatterSound, playCombatTickSound } from '../utils/audio';

interface InteractiveBreakSimulatorProps {
  initialAniimoId?: string;
  aniimoList?: BreakAniimo[];
  bossList?: BossTarget[];
  gearList?: BreakGear[];
}

export const InteractiveBreakSimulator: React.FC<InteractiveBreakSimulatorProps> = ({
  initialAniimoId,
  aniimoList = BREAK_ANIIMO_LIST,
  bossList = BOSS_TARGETS,
  gearList = BREAK_GEAR_LIST,
}) => {
  // Simulator State
  const [selectedAniimoId, setSelectedAniimoId] = useState<string>(
    initialAniimoId || aniimoList[0]?.id || 'inferlupa'
  );
  const [selectedBossId, setSelectedBossId] = useState<string>(bossList[0]?.id || 'colossal_tide_drake');
  const [selectedGearId, setSelectedGearId] = useState<string>('gargantuan_horn');
  const [awakeningStars, setAwakeningStars] = useState<number>(3);

  // Live Animation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentProgressPct, setCurrentProgressPct] = useState<number>(100); // 100% full poise down to 0%
  const [currentPoiseHp, setCurrentPoiseHp] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isBroken, setIsBroken] = useState<boolean>(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [staggerCountdown, setStaggerCountdown] = useState<number>(0);

  // Active Entities
  const activeAniimo = aniimoList.find((a) => a.id === selectedAniimoId) || aniimoList[0];
  const activeBoss = bossList.find((b) => b.id === selectedBossId) || bossList[0];
  const activeGear = gearList.find((g) => g.id === selectedGearId);

  // Keep gauge full when boss changes
  useEffect(() => {
    setCurrentPoiseHp(activeBoss.breakGaugeHp);
    setCurrentProgressPct(100);
    setIsBroken(false);
    setElapsedSeconds(0);
    setCombatLog([`Arena initialized: ${activeBoss.name} entered the field.`]);
  }, [activeBoss]);

  // Synchronize when initialAniimoId prop changes
  useEffect(() => {
    if (initialAniimoId) {
      setSelectedAniimoId(initialAniimoId);
    }
  }, [initialAniimoId]);

  const animTimerRef = useRef<number | null>(null);
  const staggerTimerRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) cancelAnimationFrame(animTimerRef.current);
      if (staggerTimerRef.current) clearInterval(staggerTimerRef.current);
    };
  }, []);

  // Run or Pause Break Assault
  const startSimulation = () => {
    if (isRunning) return;
    playUiClickSound();

    setIsRunning(true);
    setIsBroken(false);
    setCurrentProgressPct(100);
    setCurrentPoiseHp(activeBoss.breakGaugeHp);
    setElapsedSeconds(0);
    setCombatLog([
      `⚔️ [0.0s] ${activeAniimo.name} activated Break Twining against ${activeBoss.name}!`,
      `✨ Break Efficiency: ${activeAniimo.stats.breakEfficiency}% · Multiplier: +${activeAniimo.stats.breakMultiplier}%`,
    ]);

    const sim = simulateBreakCombat(activeAniimo, activeBoss, activeGear, awakeningStars);
    const totalSimDuration = sim.timeToBreakSec;
    const startTime = performance.now();
    let lastSoundSec = 0;

    const updateFrame = (now: DOMHighResTimeStamp) => {
      const elapsed = (now - startTime) / 1000;
      setElapsedSeconds(Number(elapsed.toFixed(2)));

      // Play periodic combat hit sound
      if (elapsed - lastSoundSec >= 0.8) {
        lastSoundSec = elapsed;
        playCombatTickSound();
      }

      if (elapsed < totalSimDuration) {
        const remainingPct = Math.max(0, 100 - (elapsed / totalSimDuration) * 100);
        const remainingHp = Math.max(0, Math.round(activeBoss.breakGaugeHp * (remainingPct / 100)));
        setCurrentProgressPct(remainingPct);
        setCurrentPoiseHp(remainingHp);

        animTimerRef.current = requestAnimationFrame(updateFrame);
      } else {
        // BREAK OCCURRED!
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

  const resetSimulation = () => {
    playUiClickSound();
    if (animTimerRef.current) cancelAnimationFrame(animTimerRef.current);
    if (staggerTimerRef.current) clearInterval(staggerTimerRef.current);
    setIsRunning(false);
    setIsBroken(false);
    setCurrentProgressPct(100);
    setCurrentPoiseHp(activeBoss.breakGaugeHp);
    setElapsedSeconds(0);
    setStaggerCountdown(0);
    setCombatLog([`Arena reset. Ready for new assault configuration.`]);
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
          Real-Time Battle Laboratory
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Interactive Break & Stagger Simulator
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          Simulate posture destruction in real time. Adjust awakening stars, weapon relics, and boss matchups to benchmark time-to-break speed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Loadout (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-sm space-y-5">
            <h3 className="font-heading font-black text-xl text-slate-800 flex items-center gap-2">
              <Swords className="w-5 h-5 text-sky-500" />
              <span>Combat Loadout Configuration</span>
            </h3>

            {/* 1. Pick Attacker */}
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                1. Select Attacking Break Aniimo:
              </label>
              <select
                value={selectedAniimoId}
                onChange={(e) => { playUiClickSound(); setSelectedAniimoId(e.target.value); }}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-800 focus:outline-hidden focus:border-sky-400 cursor-pointer"
              >
                {aniimoList.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.tier}] {a.name} ({a.element} · {a.rarity}★)
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
                <div className="mt-1.5 text-[11px] text-cyan-700 bg-cyan-50/70 p-2 rounded-xl border border-cyan-100 flex items-center gap-2">
                  <img src={activeGear.imageUrl} alt={activeGear.name} className="w-6 h-6 object-contain shrink-0" />
                  <div>
                    <span className="font-bold">Relic Effect:</span> {activeGear.bonusEffect}
                  </div>
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
                <span>Calculated Break Rate:</span>
                <span className="font-mono-num font-black text-sky-700">
                  {theoreticalResult.effectiveBreakDps.toLocaleString()} Poise/sec
                </span>
              </div>
            </div>

            {/* Trigger Simulation Button */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={startSimulation}
                disabled={isRunning}
                className={`flex-1 py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                  isRunning
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
          <div className="relative rounded-3xl bg-slate-900 border-2 border-sky-400/40 p-6 sm:p-8 text-white shadow-2xl overflow-hidden min-h-[480px] flex flex-col justify-between">
            
            {/* Ambient Background Boss Screenshot Wallpaper with overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
              style={{ backgroundImage: `url('${activeBoss.imageUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-950 pointer-events-none" />
            
            {/* Top Bar: Combatant Cards with real images */}
            <div className="relative z-10 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              
              {/* Attacker Info with Real Creature Artwork */}
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeAniimo.gradient} p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0`}>
                  <img
                    src={activeAniimo.imageUrl}
                    alt={activeAniimo.name}
                    className="w-full h-full object-contain bg-slate-900/80 rounded-[14px] p-0.5"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    BREAKER · {activeAniimo.tier} TIER
                  </div>
                  <div className="font-heading font-black text-base text-white">
                    {activeAniimo.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <img src={ELEMENT_ICONS[activeAniimo.element]} alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>{activeAniimo.element} · {activeAniimo.stats.breakMultiplier}% Multi</span>
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                VS
              </div>

              {/* Boss Info with Real Boss Image */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                    BOSS TARGET · {activeBoss.bodySize}
                  </div>
                  <div className="font-heading font-black text-base text-white">
                    {activeBoss.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-end gap-1.5">
                    <span>{activeBoss.element} · {activeBoss.armorHardness} Armor</span>
                    <img src={ELEMENT_ICONS[activeBoss.element]} alt="" className="w-3.5 h-3.5 object-contain" />
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/30 overflow-hidden shadow-md shrink-0">
                  <img
                    src={activeBoss.imageUrl}
                    alt={activeBoss.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>

            {/* Central Combat Arena: Dynamic Visual Faceoff */}
            <div className="relative z-10 my-4 py-4 flex flex-col items-center justify-center">
              
              {/* Visual Sprites Facing Off */}
              <div className="w-full flex items-center justify-around py-2">
                
                {/* Attacker Sprite with combat recoil */}
                <div className={`relative transition-transform duration-200 ${isRunning ? 'animate-bounce scale-110' : ''}`}>
                  <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center">
                    <img
                      src={activeAniimo.imageUrl}
                      alt={activeAniimo.name}
                      className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(56,189,248,0.4)]"
                    />
                    {isRunning && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black animate-ping">
                        ATTACK!
                      </span>
                    )}
                  </div>
                </div>

                {/* Energy Clash / Impact Center */}
                <div className="flex flex-col items-center justify-center">
                  {isRunning ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest mt-1">
                        CLASHING
                      </span>
                    </div>
                  ) : isBroken ? (
                    <div className="text-center animate-bounce">
                      <span className="px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs tracking-wider">
                        SHATTERED!
                      </span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                      <Swords className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Boss Sprite with Stagger Shake */}
                <div className={`relative transition-transform duration-200 ${
                  isRunning ? 'animate-pulse' : ''
                } ${isBroken ? 'rotate-12 opacity-80 filter brightness-125' : ''}`}>
                  <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center">
                    <img
                      src={activeBoss.imageUrl}
                      alt={activeBoss.name}
                      className="w-full h-full object-cover rounded-2xl border-2 border-rose-500/50 shadow-lg drop-shadow-[0_10px_15px_rgba(244,63,94,0.3)]"
                    />
                    {isBroken && (
                      <div className="absolute inset-0 bg-amber-400/20 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl animate-ping">💥</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Status Banner when Broken */}
              {isBroken ? (
                <div className="animate-in zoom-in-95 duration-200 text-center space-y-1">
                  <div className="inline-block px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black text-xl tracking-wider shadow-lg shadow-amber-500/30">
                    💥 BREAK SHATTER ACHIEVED!
                  </div>
                  <div className="text-xs text-amber-300 font-bold">
                    Target Incapacitated for {staggerCountdown}s · All Team Burst Damage +200%
                  </div>
                </div>
              ) : isRunning ? (
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-black animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>SHREDDING POISE GAUGE... {currentProgressPct.toFixed(0)}% REMAINING</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-400">
                  Press "Initiate Break Assault" to begin real-time posture destruction
                </div>
              )}

              {/* THE BREAK GAUGE BAR */}
              <div className="w-full max-w-lg mt-4 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono-num font-bold">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Boss Break Gauge:</span>
                  </span>
                  <span className={isBroken ? 'text-rose-400 font-black' : 'text-cyan-300'}>
                    {currentPoiseHp.toLocaleString()} / {activeBoss.breakGaugeHp.toLocaleString()} HP
                  </span>
                </div>

                <div className="relative h-6 w-full rounded-full bg-slate-950 border border-sky-400/30 p-0.5 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      isBroken
                        ? 'bg-rose-500 w-0'
                        : currentProgressPct < 30
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse'
                        : 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500'
                    }`}
                    style={{ width: `${currentProgressPct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-white drop-shadow-md">
                    {isBroken ? 'POSTURE COLLAPSED' : `${currentProgressPct.toFixed(1)}%`}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Real-time Stats Strip */}
            <div className="relative z-10 grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Elapsed Time</div>
                <div className="font-heading font-black text-lg text-cyan-400 font-mono-num">
                  {elapsedSeconds}s
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Time to Break</div>
                <div className="font-heading font-black text-lg text-emerald-400 font-mono-num">
                  {theoreticalResult.timeToBreakSec}s
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Stagger Window</div>
                <div className="font-heading font-black text-lg text-amber-400 font-mono-num">
                  +{theoreticalResult.staggerWindowSec}s
                </div>
              </div>
            </div>

          </div>

          {/* Real-time Combat Log Console */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-xs font-mono text-slate-300 space-y-1 max-h-36 overflow-y-auto">
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
              Combat Event Stream:
            </div>
            {combatLog.map((log, i) => (
              <div key={i} className="text-slate-300 leading-relaxed">
                {log}
              </div>
            ))}
          </div>

        </div>

      </div>

    </section>
  );
};
