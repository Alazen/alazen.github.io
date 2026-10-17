import React from 'react';
import { Calendar, Gift, Sparkles, Clock, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import { EVENT_CALENDAR_ITEMS } from '../data/aniimoData';
import { playUiClickSound } from '../utils/audio';

export const LaunchEventsSection: React.FC = () => {
  const days = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, '01', '02', '03', '04', '05', '06'];

  return (
    <section id="events" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black tracking-wider uppercase mb-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-600" />
          Official Launch Roadmap
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Aniimo Event Calendar & Break Rewards
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          Collect free 5★ Prismana Break selectors, gacha rate-up schedules, and raid boss challenges.
        </p>
      </div>

      {/* DUAL HIGHLIGHT BANNERS (Mirroring the screenshot "Global Launch Rewards") */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        
        {/* Banner 1: Choose Your Own Rare Prismana Aniimo */}
        <div className="relative rounded-3xl aniimo-card p-6 sm:p-8 overflow-hidden flex flex-col justify-between border-2 border-sky-300">
          <div className="relative z-10 space-y-3">
            <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black uppercase">
              Permanent Novice Reward
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Choose Your Own Rare Prismana Break Aniimo
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Become a Junior Wayfarer to select one top-tier Prismana form Aniimo for free.
              Choose between <span className="font-bold text-sky-700">Prismana Inferlupa</span> (Fire / Break S+),
              <span className="font-bold text-cyan-700"> Prismana Wavwal</span> (Water / Break S), or
              <span className="font-bold text-emerald-700"> Glynsera</span> (Wind / Break A+).
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-sky-100 flex items-center justify-between">
            <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Always Active for New Wayfarers
            </span>
            <span className="text-xs font-bold text-sky-600">Claim in Game ➔</span>
          </div>
        </div>

        {/* Banner 2: 4 Outfits Free & Homeland Check-ins */}
        <div className="relative rounded-3xl aniimo-card p-6 sm:p-8 overflow-hidden flex flex-col justify-between border-2 border-purple-200">
          <div className="relative z-10 space-y-3">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase">
              Launch Campaign
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Obtain 4 Explorer Outfits For Free
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Participate in story quests, Homeland-related features, and cumulative check-ins
              to unlock the exclusive "Sunlit Meadow" and "Companion Promise" avatar frames and expedition attire.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-purple-100 flex items-center justify-between">
            <span className="text-xs font-black text-purple-600 flex items-center gap-1">
              <Gift className="w-4 h-4" /> 4 Outfits Cumulative Check-in
            </span>
            <span className="text-xs font-bold text-purple-600">In Progress ➔</span>
          </div>
        </div>

      </div>

      {/* EVENT CALENDAR TIMELINE TABLE (Faithful recreation from screenshot) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-50 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <h3 className="font-heading font-black text-lg text-slate-800">
              Launch Event Schedule Grid
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-3 h-3 rounded-full bg-emerald-400" /> Permanent
            <span className="w-3 h-3 rounded-full bg-orange-400 ml-2" /> Rate Up
            <span className="w-3 h-3 rounded-full bg-purple-400 ml-2" /> Raid Challenge
          </div>
        </div>

        {/* Days Header Bar */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto py-2 px-3 bg-sky-50/70 rounded-2xl border border-sky-100">
          <span className="text-[11px] font-black text-slate-400 uppercase w-20 shrink-0">Oct / Nov</span>
          {days.map((d, i) => (
            <div
              key={i}
              className={`flex-1 text-center py-1 rounded-lg text-[11px] font-mono-num font-bold ${
                d === 16 ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-white'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Event Schedule Rows */}
        <div className="space-y-3">
          {EVENT_CALENDAR_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:bg-sky-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {item.category}
                  </span>
                </div>
                <h4 className="font-heading font-black text-sm text-slate-800">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  {item.description}
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-xs font-mono-num font-extrabold text-cyan-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 inline-block">
                  {item.dates}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
};
