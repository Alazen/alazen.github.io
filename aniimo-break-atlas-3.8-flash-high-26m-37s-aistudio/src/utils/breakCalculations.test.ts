import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getElementalMultiplier,
  getBodySizeHitModifier,
  calculateBreakScore,
  simulateBreakCombat,
} from './breakCalculations.ts';
import type { BreakAniimo, BossTarget } from '../types/aniimo.ts';

test('getElementalMultiplier handles prismatic advantage', () => {
  assert.equal(getElementalMultiplier('Prismatic', 'Fire'), 1.15);
  assert.equal(getElementalMultiplier('Prismatic', 'Water'), 1.15);
});

test('getElementalMultiplier handles elemental advantages correctly', () => {
  assert.equal(getElementalMultiplier('Fire', 'Wind'), 1.25);
  assert.equal(getElementalMultiplier('Wind', 'Earth'), 1.25);
  assert.equal(getElementalMultiplier('Water', 'Fire'), 1.25);
  assert.equal(getElementalMultiplier('Ice', 'Water'), 1.25);
  assert.equal(getElementalMultiplier('Dark', 'Light'), 1.25);
});

test('getElementalMultiplier handles elemental weaknesses', () => {
  assert.equal(getElementalMultiplier('Fire', 'Water'), 0.85);
  assert.equal(getElementalMultiplier('Wind', 'Fire'), 0.85);
});

test('getBodySizeHitModifier adjusts for boss target size', () => {
  assert.equal(getBodySizeHitModifier('Colossal', 'Colossal'), 1.20);
  assert.equal(getBodySizeHitModifier('Medium', 'Large'), 1.10);
  assert.equal(getBodySizeHitModifier('Medium', 'Medium'), 1.0);
});

test('calculateBreakScore evaluates within valid bounds', () => {
  const dummyStats = {
    breakEfficiency: 95,
    timeToBreakSec: 4.1,
    breakMultiplier: 150,
    shieldPenetration: 85,
    staggerDurationBonus: 2.0,
    safetyRating: 88,
    teamSynergy: 92,
  };
  const score = calculateBreakScore(dummyStats);
  assert.ok(score >= 80 && score <= 100, `Score ${score} should be in high tier range`);
});

test('simulateBreakCombat successfully shatters boss gauge and generates timeline', () => {
  const dummyAniimo: BreakAniimo = {
    id: 'inferlupa',
    name: 'Prismana Inferlupa',
    alias: 'Flames of the Alpha',
    element: 'Fire',
    tier: 'S+',
    rarity: 5,
    isPrismana: true,
    bodySize: 'Large',
    avatarColor: '#f97316',
    gradient: 'from-orange-500 to-amber-400',
    borderAccent: '#ea580c',
    breakScore: 99.4,
    headline: 'Undisputed Tier S+ Apex Breaker',
    overview: 'High break stats with Incinerating Shatter.',
    signatureSkill: {
      name: 'Incinerating Claw Sweep',
      type: 'Burst / Ultimate',
      description: 'Shreds shields.',
      breakGaugeMultiplier: 220,
      breakDamageFlat: 650,
      cooldownSec: 4.0,
      hitCount: 5,
    },
    passiveBreakTrait: '+35% Team Break Vulnerability',
    recommendedGear: ['Gargantuan Horn'],
    awakenings: [
      { star: 1, title: 'Ignited Impact', effect: '+10% Break DMG', breakBonusPercent: 10 },
      { star: 2, title: 'Molten Core', effect: '+15% Break DMG', breakBonusPercent: 15 },
    ],
    bestSynergies: [],
    pros: ['Fastest break in game'],
    cons: ['High stamina consumption'],
    stats: {
      breakEfficiency: 98,
      timeToBreakSec: 4.1,
      breakMultiplier: 165,
      shieldPenetration: 92,
      staggerDurationBonus: 2.5,
      safetyRating: 84,
      teamSynergy: 96,
    },
  };

  const dummyBoss: BossTarget = {
    id: 'wind_drake',
    name: 'Zephyr Wyrm Tempest',
    title: 'Gale Tyrant',
    element: 'Wind',
    breakGaugeHp: 8000,
    armorHardness: 30,
    bodySize: 'Colossal',
    breakWindowDurationSec: 8.0,
    description: 'Aerial sovereign',
    iconName: 'Wind',
  };

  const simResult = simulateBreakCombat(dummyAniimo, dummyBoss, null, 2);
  assert.equal(simResult.isBroken, true);
  assert.ok(simResult.timeToBreakSec < 10, 'Should break boss quickly');
  assert.ok(simResult.timeline.length > 2, 'Timeline should record ticks');
  assert.equal(simResult.staggerWindowSec, 10.5, 'Stagger window should include bonus (8.0 + 2.5)');
});
