import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Play,
  Check,
  Plus,
  ArrowUpDown,
  Flame,
  Droplets,
  Wind,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { BreakAniimo, AniimoElement, BreakTier, BodySize } from '../types/aniimo';
import { ELEMENT_ICONS } from '../data/aniimoData';
import { playUiClickSound, playSelectCardSound } from '../utils/audio';

interface BreakTierListProps {
  aniimoList: BreakAniimo[];
  selectedCompareIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectAniimo: (aniimo: BreakAniimo) => void;
  onLaunchInSim: (aniimo: BreakAniimo) => void;
}

export const BreakTierList: React.FC<BreakTierListProps> = ({
  aniimoList,
  selectedCompareIds,
  onToggleCompare,
  onSelectAniimo,
  onLaunchInSim,
}) => {
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [elementFilter, setElementFilter] = useState<string>('ALL');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'ttb' | 'multiplier' | 'penetration'>('score');
  const [viewMode, setViewMode] = useState<'cards' | 'board' | 'table'>('cards');

  const tiers: BreakTier[] = ['S+', 'S', 'A+', 'A', 'B+'];
  const elements: AniimoElement[] = ['Fire', 'Water', 'Ice', 'Dark', 'Wind', 'Earth', 'Electric', 'Light', 'Prismatic'];

  const filteredAndSorted = useMemo(() => {
    return aniimoList
      .filter((a) => {
        if (tierFilter !== 'ALL' && a.tier !== tierFilter) return false;
        if (elementFilter !== 'ALL' && a.element !== elementFilter) return false;
        if (sizeFilter !== 'ALL' && a.bodySize !== sizeFilter) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = a.name.toLowerCase().includes(q);
          const matchAlias = a.alias.toLowerCase().includes(q);
          const matchElement = a.element.toLowerCase().includes(q);
          const matchSkill = a.signatureSkill.name.toLowerCase().includes(q);
          if (!matchName && !matchAlias && !matchElement && !matchSkill) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.breakScore - a.breakScore;
        if (sortBy === 'ttb') return a.stats.timeToBreakSec - b.stats.timeToBreakSec; // lower is faster
        if (sortBy === 'multiplier') return b.stats.breakMultiplier - a.stats.breakMultiplier;
        if (sortBy === 'penetration') return b.stats.shieldPenetration - a.stats.shieldPenetration;
        return 0;
      });
  }, [aniimoList, tierFilter, elementFilter, sizeFilter, searchQuery, sortBy]);

  const getTierBadgeStyle = (tier: BreakTier) => {
    switch (tier) {
      case 'S+':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs';
      case 'S':
        return 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs';
      case 'A+':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white';
      case 'A':
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white';
      case 'B+':
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <section id="tier-list" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            Empirical Stagger Rankings
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Best Break Aniimo Tier List
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            Ranked by Break gauge destruction speed, shield piercing, team multiplier synergy, and safety.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex rounded-2xl bg-white p-1 border border-sky-200 shadow-xs">
          <button
            onClick={() => { playUiClickSound(); setViewMode('cards'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-600'
            }`}
          >
            Prismana Cards
          </button>
          <button
            onClick={() => { playUiClickSound(); setViewMode('board'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'board'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-600'
            }`}
          >
            Tier Board
          </button>
          <button
            onClick={() => { playUiClickSound(); setViewMode('table'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-600'
            }`}
          >
            Matrix Table
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white/95 rounded-3xl p-5 border border-sky-100 shadow-sm mb-8 space-y-4">
        
        {/* Tier filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
            Tier:
          </span>
          <button
            onClick={() => { playUiClickSound(); setTierFilter('ALL'); }}
            className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
              tierFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Tiers ({aniimoList.length})
          </button>
          {tiers.map((t) => {
            const count = aniimoList.filter((a) => a.tier === t).length;
            const isSel = tierFilter === t;
            return (
              <button
                key={t}
                onClick={() => { playUiClickSound(); setTierFilter(t); }}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                  isSel
                    ? getTierBadgeStyle(t)
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tier {t} ({count})
              </button>
            );
          })}
        </div>

        {/* Second Row: Element, Search, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-sky-50 items-center">
          
          {/* Search box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Aniimo name, skill, or trait..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-sky-400 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Element Selector */}
          <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 shrink-0">Elem:</span>
            <select
              value={elementFilter}
              onChange={(e) => { playUiClickSound(); setElementFilter(e.target.value); }}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden focus:border-sky-400 cursor-pointer"
            >
              <option value="ALL">All Elements</option>
              {elements.map((el) => (
                <option key={el} value={el}>{el}</option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-4 flex items-center justify-end gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-400 shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => { playUiClickSound(); setSortBy(e.target.value as any); }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden focus:border-sky-400 cursor-pointer"
            >
              <option value="score">Rank Score (Highest)</option>
              <option value="ttb">Time to Break (Fastest)</option>
              <option value="multiplier">Break Multiplier (%)</option>
              <option value="penetration">Shield Penetration (%)</option>
            </select>
          </div>

        </div>

      </div>

      {/* VIEW MODE: PRISMANA CARDS (Featuring Official Aniimo Creature Art) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map((aniimo) => {
            const isComparing = selectedCompareIds.includes(aniimo.id);
            const elementIcon = ELEMENT_ICONS[aniimo.element];

            return (
              <div
                key={aniimo.id}
                className="group relative rounded-3xl aniimo-card p-5 flex flex-col justify-between transition-all duration-300"
              >
                {/* Top Card Badges: Tier & Prismana status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide ${getTierBadgeStyle(aniimo.tier)}`}>
                        {aniimo.tier} TIER
                      </span>
                      {aniimo.isPrismana && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                          Prismana
                        </span>
                      )}
                    </div>

                    {/* Compare Checkbox Button */}
                    <button
                      onClick={() => { playUiClickSound(); onToggleCompare(aniimo.id); }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        isComparing
                          ? 'bg-amber-400 text-amber-950 font-extrabold shadow-xs'
                          : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300'
                      }`}
                      title="Compare up to 3 Aniimo"
                    >
                      {isComparing ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                    </button>
                  </div>

                  {/* Character Artwork Showcase Banner */}
                  <div className={`relative h-36 rounded-2xl bg-gradient-to-r ${aniimo.gradient} p-4 text-white overflow-hidden shadow-inner flex items-center justify-between`}>
                    
                    {/* Background glow circle */}
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/20 blur-md pointer-events-none" />

                    {/* Official Creature Art Pop-Out */}
                    <div className="absolute right-14 -bottom-1 h-34 w-34 pointer-events-none z-10 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                      <img
                        src={aniimo.imageUrl}
                        alt={aniimo.name}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to portrait if main fails
                          if (aniimo.portraitUrl) {
                            (e.target as HTMLImageElement).src = aniimo.portraitUrl;
                          }
                        }}
                      />
                    </div>

                    <div className="relative z-10 max-w-[55%]">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-white/90 uppercase tracking-widest">
                        <span>{aniimo.rarity}★</span>
                        <span>·</span>
                        <span>{aniimo.bodySize}</span>
                      </div>
                      <h3 className="font-heading font-black text-2xl tracking-tight text-white drop-shadow-sm leading-tight">
                        {aniimo.name}
                      </h3>
                      <div className="text-xs text-white/80 font-semibold italic truncate">
                        "{aniimo.alias}"
                      </div>
                    </div>

                    {/* Circular Break Score Badge */}
                    <div className="relative z-20 w-16 h-16 rounded-2xl bg-white/95 backdrop-blur-md p-1 flex flex-col items-center justify-center text-slate-900 shadow-lg border border-white">
                      <span className="text-[9px] font-black uppercase text-cyan-700 tracking-tighter">
                        SCORE
                      </span>
                      <span className="font-heading font-black text-xl text-slate-900 leading-none">
                        {aniimo.breakScore}
                      </span>
                      <span className="text-[8px] font-extrabold text-slate-500">
                        / 100
                      </span>
                    </div>
                  </div>

                  {/* Element & Headline with Official Attribute Icon */}
                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-sky-100 bg-white shadow-xs">
                      {elementIcon && (
                        <img src={elementIcon} alt={aniimo.element} className="w-4 h-4 object-contain" />
                      )}
                      <span>{aniimo.element} Affinity</span>
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 font-mono-num">
                      ⚡ {aniimo.stats.timeToBreakSec}s TTB
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                    {aniimo.overview}
                  </p>

                  {/* Core Metrics Progress Mini-Grid */}
                  <div className="mt-4 bg-sky-50/70 rounded-2xl p-3 border border-sky-100/80 space-y-2">
                    
                    {/* Gauge Multiplier */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Break Multiplier</span>
                        <span className="text-sky-700 font-mono-num font-black">+{aniimo.stats.breakMultiplier}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-sky-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full"
                          style={{ width: `${Math.min(100, (aniimo.stats.breakMultiplier / 180) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Shield Penetration */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Shield Piercing</span>
                        <span className="text-cyan-700 font-mono-num font-black">{aniimo.stats.shieldPenetration}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-sky-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full"
                          style={{ width: `${aniimo.stats.shieldPenetration}%` }}
                        />
                      </div>
                    </div>

                    {/* Team Synergy */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Team Stagger Synergy</span>
                        <span className="text-purple-700 font-mono-num font-black">{aniimo.stats.teamSynergy}/100</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-sky-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
                          style={{ width: `${aniimo.stats.teamSynergy}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Signature Skill Snippet */}
                  <div className="mt-3 text-[11px] bg-white rounded-xl p-2.5 border border-slate-100">
                    <span className="font-black text-slate-800">Skill: </span>
                    <span className="font-bold text-sky-600">{aniimo.signatureSkill.name}</span>
                    <span className="text-slate-500 font-medium"> ({aniimo.signatureSkill.breakGaugeMultiplier}% Poise Multiplier, {aniimo.signatureSkill.hitCount} hits)</span>
                  </div>
                </div>

                {/* Bottom Actions: Test in Simulator & View Details */}
                <div className="mt-4 pt-3 border-t border-sky-100 flex items-center gap-2">
                  <button
                    onClick={() => { playSelectCardSound(); onSelectAniimo(aniimo); }}
                    className="flex-1 py-2 px-3 rounded-xl border border-sky-200 bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-sky-500" />
                    <span>Deep Kit</span>
                  </button>

                  <button
                    onClick={() => { playUiClickSound(); onLaunchInSim(aniimo); }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Simulate</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE: TIER BOARD */}
      {viewMode === 'board' && (
        <div className="space-y-6">
          {tiers.map((tier) => {
            const list = filteredAndSorted.filter((a) => a.tier === tier);
            if (list.length === 0) return null;

            return (
              <div key={tier} className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-1 rounded-xl text-sm font-black ${getTierBadgeStyle(tier)}`}>
                    TIER {tier}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {list.length} Combatant{list.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((aniimo) => (
                    <div
                      key={aniimo.id}
                      onClick={() => { playSelectCardSound(); onSelectAniimo(aniimo); }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-cyan-400 hover:bg-sky-50/50 cursor-pointer transition-all flex items-center justify-between"
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 p-1 border border-slate-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={aniimo.imageUrl}
                            alt={aniimo.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <div className="font-heading font-black text-sm text-slate-800">
                            {aniimo.name}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500">
                            {aniimo.element} · {aniimo.stats.timeToBreakSec}s TTB
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono-num font-black text-base text-cyan-600">
                          {aniimo.breakScore}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE: MATRIX TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50/80 border-b border-sky-100 text-slate-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Aniimo</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Element</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Time-To-Break</th>
                  <th className="py-3 px-4">Multiplier</th>
                  <th className="py-3 px-4">Shield Pierce</th>
                  <th className="py-3 px-4">Stagger Extra</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAndSorted.map((aniimo, index) => (
                  <tr key={aniimo.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-black font-mono-num text-slate-400">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={aniimo.imageUrl}
                          alt={aniimo.name}
                          className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5"
                          loading="lazy"
                        />
                        <div>
                          <div className="font-heading font-black text-slate-800 text-sm">
                            {aniimo.name}
                          </div>
                          <div className="text-[10px] text-slate-500 italic">"{aniimo.alias}"</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${getTierBadgeStyle(aniimo.tier)}`}>
                        {aniimo.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        {ELEMENT_ICONS[aniimo.element] && (
                          <img src={ELEMENT_ICONS[aniimo.element]} alt={aniimo.element} className="w-3.5 h-3.5" />
                        )}
                        <span>{aniimo.element}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num font-black text-cyan-600 text-sm">
                      {aniimo.breakScore}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num font-bold text-emerald-600">
                      {aniimo.stats.timeToBreakSec}s
                    </td>
                    <td className="py-3.5 px-4 font-mono-num font-bold text-slate-700">
                      +{aniimo.stats.breakMultiplier}%
                    </td>
                    <td className="py-3.5 px-4 font-mono-num font-bold text-slate-700">
                      {aniimo.stats.shieldPenetration}%
                    </td>
                    <td className="py-3.5 px-4 font-mono-num font-bold text-purple-600">
                      +{aniimo.stats.staggerDurationBonus}s
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => { playSelectCardSound(); onSelectAniimo(aniimo); }}
                        className="px-2.5 py-1 rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-50 font-bold"
                      >
                        Info
                      </button>
                      <button
                        onClick={() => { playUiClickSound(); onLaunchInSim(aniimo); }}
                        className="px-2.5 py-1 rounded-lg bg-sky-500 text-white hover:bg-sky-600 font-bold"
                      >
                        Sim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </section>
  );
};
