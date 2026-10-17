export type AniimoElement = 'Fire' | 'Water' | 'Ice' | 'Dark' | 'Wind' | 'Earth' | 'Electric' | 'Light' | 'Prismatic';

export type BreakTier = 'S+' | 'S' | 'A+' | 'A' | 'B+';

export type BodySize = 'Small' | 'Medium' | 'Large' | 'Colossal';

export interface AniimoSkill {
  name: string;
  type: 'Basic' | 'Skill' | 'Burst / Ultimate';
  description: string;
  breakGaugeMultiplier: number; // e.g. 180%
  breakDamageFlat: number;      // e.g. 450
  cooldownSec: number;
  hitCount: number;
  specialEffect?: string;
}

export interface AniimoStats {
  breakEfficiency: number;   // 0 - 100
  timeToBreakSec: number;     // Theoretical baseline against standard boss (e.g. 4.1s)
  breakMultiplier: number;    // % bonus applied to posture damage (e.g. 145%)
  shieldPenetration: number;  // % ignores defensive shields
  staggerDurationBonus: number; // seconds added to boss break incapacitated window
  safetyRating: number;       // i-frames, range, armor (0 - 100)
  teamSynergy: number;        // vulnerability debuffs, break surge auras (0 - 100)
}

export interface BreakAniimo {
  id: string;
  name: string;
  alias: string;
  element: AniimoElement;
  tier: BreakTier;
  rarity: 4 | 5;
  isPrismana: boolean;
  bodySize: BodySize;
  avatarColor: string;
  gradient: string;
  borderAccent: string;
  imageUrl: string;
  portraitUrl?: string;
  stats: AniimoStats;
  breakScore: number;         // 0 - 100 overall score
  headline: string;
  overview: string;
  signatureSkill: AniimoSkill;
  passiveBreakTrait: string;
  recommendedGear: string[];
  awakenings: {
    star: number;
    title: string;
    effect: string;
    breakBonusPercent: number;
  }[];
  bestSynergies: string[];    // IDs of partner Aniimo (DPS/Support)
  pros: string[];
  cons: string[];
}

export interface BossTarget {
  id: string;
  name: string;
  title: string;
  element: AniimoElement;
  breakGaugeHp: number;
  armorHardness: number;      // 0 - 100 (reduces break dmg unless penetrated)
  bodySize: BodySize;
  breakWindowDurationSec: number;
  description: string;
  iconName: string;
  imageUrl?: string;
}

export interface BreakGear {
  id: string;
  name: string;
  rarity: 4 | 5;
  breakBoostPercent: number;
  bonusEffect: string;
  description: string;
  imageUrl?: string;
}

export interface SimulationResult {
  aniimoId: string;
  bossId: string;
  timeToBreakSec: number;
  totalHits: number;
  effectiveBreakDps: number;
  staggerWindowSec: number;
  isBroken: boolean;
  timeline: {
    second: number;
    remainingGaugePercent: number;
    damageDealt: number;
    event?: string;
  }[];
}
