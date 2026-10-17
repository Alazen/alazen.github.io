import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BreakTierList } from './components/BreakTierList';
import { InteractiveBreakSimulator } from './components/InteractiveBreakSimulator';
import { BreakComparisonView } from './components/BreakComparisonView';
import { BreakMechanicsInfographic } from './components/BreakMechanicsInfographic';
import { TeamBuilder } from './components/TeamBuilder';
import { LaunchEventsSection } from './components/LaunchEventsSection';
import { QuickCompanionDock } from './components/QuickCompanionDock';
import { Footer } from './components/Footer';
import { AniimoDetailModal } from './components/AniimoDetailModal';
import { BREAK_ANIIMO_LIST, BOSS_TARGETS, BREAK_GEAR_LIST } from './data/aniimoData';
import type { BreakAniimo } from './types/aniimo';
import { playUiClickSound, playSelectCardSound } from './utils/audio';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('tier-list');
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>(['inferlupa', 'helgon']);
  const [selectedDetailAniimo, setSelectedDetailAniimo] = useState<BreakAniimo | null>(null);
  const [simulatorTargetAniimoId, setSimulatorTargetAniimoId] = useState<string>('inferlupa');

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleCompare = (id: string) => {
    playUiClickSound();
    setSelectedCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        // Swap out the first one if already 3
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleRemoveFromCompare = (id: string) => {
    playUiClickSound();
    setSelectedCompareIds((prev) => prev.filter((item) => item !== id));
  };

  const handleAddCompareId = (id: string) => {
    playUiClickSound();
    if (!selectedCompareIds.includes(id) && selectedCompareIds.length < 3) {
      setSelectedCompareIds((prev) => [...prev, id]);
    }
  };

  const handleClearCompare = () => {
    playUiClickSound();
    setSelectedCompareIds([]);
  };

  const handleLaunchInSim = (aniimo: BreakAniimo) => {
    playUiClickSound();
    setSimulatorTargetAniimoId(aniimo.id);
    setActiveSection('simulator');
    const el = document.getElementById('simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCompare = () => {
    playUiClickSound();
    setActiveSection('comparison');
    const el = document.getElementById('comparison');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eaf6ff] text-slate-800">
      
      {/* Top Navigation */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        selectedCompareCount={selectedCompareIds.length}
        onOpenCompare={handleOpenCompare}
      />

      {/* Main Page Sections */}
      <main className="flex-1">
        
        {/* Hero Section with Official Look & Milestones */}
        <HeroSection
          onExploreTierList={() => handleNavigate('tier-list')}
          onLaunchSimulator={() => handleNavigate('simulator')}
        />

        {/* Interactive Break Tier List & Grid */}
        <BreakTierList
          aniimoList={BREAK_ANIIMO_LIST}
          selectedCompareIds={selectedCompareIds}
          onToggleCompare={handleToggleCompare}
          onSelectAniimo={(aniimo) => {
            playSelectCardSound();
            setSelectedDetailAniimo(aniimo);
          }}
          onLaunchInSim={handleLaunchInSim}
        />

        {/* Live Interactive Break Arena Simulator */}
        <InteractiveBreakSimulator
          aniimoList={BREAK_ANIIMO_LIST}
          bossList={BOSS_TARGETS}
          gearList={BREAK_GEAR_LIST}
          initialSelectedAniimoId={simulatorTargetAniimoId}
        />

        {/* Side-by-Side Breaker Comparison & Radar Chart */}
        <BreakComparisonView
          allAniimo={BREAK_ANIIMO_LIST}
          selectedCompareIds={selectedCompareIds}
          onRemoveFromCompare={handleRemoveFromCompare}
          onAddCompareId={handleAddCompareId}
          onClearCompare={handleClearCompare}
          onSelectForDetails={(aniimo) => {
            playSelectCardSound();
            setSelectedDetailAniimo(aniimo);
          }}
        />

        {/* Break Combat Mechanics & Formula Deep Dive */}
        <BreakMechanicsInfographic />

        {/* Break Team Composition Builder */}
        <TeamBuilder allAniimo={BREAK_ANIIMO_LIST} />

        {/* Launch Events & Prismana Rewards Calendar */}
        <LaunchEventsSection />

      </main>

      {/* Quick Access Companion Dock */}
      <QuickCompanionDock onNavigate={handleNavigate} />

      {/* Official Style Footer */}
      <Footer />

      {/* Detail Modal for 1-5★ Awakenings and Skill Inspect */}
      <AniimoDetailModal
        aniimo={selectedDetailAniimo}
        onClose={() => setSelectedDetailAniimo(null)}
        onLaunchInSim={handleLaunchInSim}
      />

    </div>
  );
}
