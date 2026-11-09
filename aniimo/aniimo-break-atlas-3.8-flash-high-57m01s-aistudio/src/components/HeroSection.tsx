import React from 'react';
import { Sparkles, Play, Shield, Zap, Target, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { MILESTONES, OFFICIAL_PLATFORM_LOGOS } from '../data/aniimoData';
import { playUiClickSound } from '../utils/audio';

interface HeroSectionProps {
  onExploreTierList: () => void;
  onLaunchSimulator: () => void;
  onExploreGallery: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreTierList,
  onLaunchSimulator,
  onExploreGallery,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-[#e9f6ff] pt-8 pb-16">
      
      {/* Official Steam Key Background Wallpaper with blend */}
      <div 
        className="absolute inset-0 bg-cover bg-top pointer-events-none opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4126040/437120a74f1cb3a7dd315852485f645e49787967/page_bg_raw.jpg')`,
        }}
      />

      {/* Soft gradient wash over the background to ensure pristine text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/40 via-sky-100/70 to-[#eaf6ff] pointer-events-none" />

      {/* Floating Animated Official Aniimo Creatures around Hero */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Inferlupa 3D creature floating on left */}
        <div className="absolute -left-6 top-16 sm:left-8 sm:top-20 w-32 sm:w-44 animate-float-slow opacity-90 hover:opacity-100 transition-opacity">
          <img
            src="https://aniimotools.dev/assets/creatures/inferlupa.webp"
            alt="Prismana Inferlupa Aniimo"
            className="w-full h-auto drop-shadow-2xl"
            loading="lazy"
          />
        </div>

        {/* Wavwal creature floating on right */}
        <div className="absolute -right-4 top-16 sm:right-10 sm:top-20 w-28 sm:w-40 animate-float-gentle opacity-90 hover:opacity-100 transition-opacity">
          <img
            src="https://aniimotools.dev/assets/creatures/wavwal.webp"
            alt="Prismana Wavwal Aniimo"
            className="w-full h-auto drop-shadow-2xl"
            loading="lazy"
          />
        </div>

        {/* Skippy mascot floating near bottom corner */}
        <div className="hidden lg:block absolute right-24 bottom-24 w-28 animate-float-slow opacity-85">
          <img
            src="https://aniimotools.dev/assets/creatures/skippy.webp"
            alt="Skippy Aniimo"
            className="w-full h-auto drop-shadow-lg"
            loading="lazy"
          />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tagline Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-sky-300 shadow-sm text-xs font-bold text-sky-800 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>GLOBAL LAUNCH BREAK META · PATCH 1.0.0</span>
            <span className="text-sky-300">|</span>
            <span className="text-cyan-600 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> OFFICIAL MECHANICS & ART
            </span>
          </div>
        </div>

        {/* Main Title & Hero Heading */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
            RANK THE BEST{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600">
              ANIIMO BREAK
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-xs">
            Twine with companions to shatter boss poise. Discover theoretical and empirical rankings,
            time-to-break speedruns, live gauge simulations, and official creature art.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => { playUiClickSound(); onExploreTierList(); }}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>Explore Break Tier List</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => { playUiClickSound(); onLaunchSimulator(); }}
              className="px-7 py-3.5 rounded-full bg-white/95 text-slate-800 border-2 border-sky-300 font-bold text-sm tracking-wide shadow-sm hover:bg-sky-50 hover:border-sky-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-sky-500 fill-sky-500" />
              <span>Interactive Stagger Simulator</span>
            </button>

            <button
              onClick={() => { playUiClickSound(); onExploreGallery(); }}
              className="px-6 py-3.5 rounded-full bg-white/90 text-cyan-800 border border-cyan-300 font-bold text-sm tracking-wide shadow-sm hover:bg-cyan-50 hover:border-cyan-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-cyan-600" />
              <span>Visual Gallery</span>
            </button>
          </div>

          {/* Official Capsule Banner & Live Creature Ribbon */}
          <div className="pt-6 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md p-3 rounded-3xl border border-sky-200/80 shadow-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4126040/0acdc54dbcb7326bd8777ee25ff168efef004fd1/capsule_616x353.jpg"
                  alt="Aniimo Launch Key Art"
                  className="h-12 w-20 object-cover rounded-xl shadow-xs"
                />
                <div className="text-left">
                  <div className="text-[11px] font-black uppercase text-sky-600">Official Release Key Art</div>
                  <div className="text-xs font-bold text-slate-800">Available on PC, PS5, Xbox & Mobile</div>
                </div>
              </div>

              {/* Quick Creature Avatar Thumbs */}
              <div className="flex items-center -space-x-2">
                {[
                  { name: 'Inferlupa', img: 'https://aniimotools.dev/assets/creatures/inferlupa.webp', border: 'border-orange-400' },
                  { name: 'Wavwal', img: 'https://aniimotools.dev/assets/creatures/wavwal.webp', border: 'border-cyan-400' },
                  { name: 'Glacy', img: 'https://aniimotools.dev/assets/creatures/glacy.webp', border: 'border-sky-300' },
                  { name: 'Fulmintis', img: 'https://aniimotools.dev/assets/creatures/fulmintis.webp', border: 'border-amber-400' },
                  { name: 'Stellarys', img: 'https://aniimotools.dev/assets/creatures/stellarys.webp', border: 'border-purple-400' },
                ].map((c) => (
                  <div
                    key={c.name}
                    title={c.name}
                    className={`w-9 h-9 rounded-full bg-slate-900 border-2 ${c.border} p-0.5 overflow-hidden shadow-xs hover:scale-125 transition-transform z-10`}
                  >
                    <img src={c.img} alt={c.name} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Official Launch Platforms Bar */}
          <div className="pt-4 flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              PLAYABLE PLATFORMS & CROSS-SAVE
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
              {Object.entries(OFFICIAL_PLATFORM_LOGOS).map(([key, logoUrl]) => (
                <div
                  key={key}
                  className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-sky-200/80 shadow-xs flex items-center justify-center h-8"
                >
                  <img
                    src={logoUrl}
                    alt={`${key} platform`}
                    className="h-4 w-auto object-contain max-w-[70px]"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-[10px] font-black uppercase text-slate-700 ml-1">
                    {key.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Global Milestone Counter Card */}
        <div className="mt-12 bg-white/95 rounded-3xl p-6 sm:p-8 border border-sky-200 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-heading font-black text-xl text-slate-900">
                  Global Launch Milestones Achieved!
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Over <span className="font-extrabold text-sky-600">40,000,000+ Pathfinders</span> have pre-registered worldwide. All tier rewards unlocked!
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                100% COMPLETE
              </span>
            </div>
          </div>

          {/* Milestone Items Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {MILESTONES.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 hover:border-sky-300 transition-colors flex flex-col items-center text-center space-y-1.5"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 shadow-xs flex items-center justify-center p-1.5">
                    <img
                      src={m.iconUrl}
                      alt={m.reward}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                    ✓
                  </span>
                </div>

                <div className="font-mono-num font-black text-sm text-slate-900">
                  {m.count}
                </div>
                <div className="text-[11px] font-bold text-slate-700 leading-tight">
                  {m.reward}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
