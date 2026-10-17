import type { BreakAniimo, BossTarget, BreakGear, SimulationResult, AniimoElement } from '../types/aniimo.ts';

/**
 * Calculates element advantage multiplier for Break posture damage.
 * Follows Aniimo elemental affinity matrix:
 * Fire > Wind > Earth > Electric > Water > Fire
 * Ice is strong vs Water & Wind
 * Dark & Light counter each other
 * Prismatic has universal 1.15x advantage against all elements
 */
export function getElementalMultiplier(attacker: AniimoElement, defender: AniimoElement): number {
  if (attacker === 'Prismatic') return 1.15;
  if (attacker === defender) return 1.0;

  const advantages: Record<AniimoElement, AniimoElement[]> = {
    Fire: ['Wind'],
    Wind: ['Earth'],
    Earth: ['Electric'],
    Electric: ['Water'],
    Water: ['Fire'],
    Ice: ['Water', 'Wind'],
    Dark: ['Light'],
    Light: ['Dark'],
    Prismatic: ['Fire', 'Water', 'Ice', 'Dark', 'Wind', 'Earth', 'Electric', 'Light', 'Prismatic'],
  };

  const weakAgainst: Record<AniimoElement, AniimoElement[]> = {
    Wind: ['Fire', 'Ice'],
    Earth: ['Wind'],
    Electric: ['Earth'],
    Water: ['Electric', 'Ice'],
    Fire: ['Water'],
    Ice: ['Fire'],
    Dark: ['Dark'],
    Light: ['Light'],
    Prismatic: [],
  };

  if (advantages[attacker]?.includes(defender)) return 1.25;
  if (weakAgainst[attacker]?.includes(defender)) return 0.85;
  return 1.0;
}

/**
 * Body size modifier: Colossal and Large bosses have larger hitboxes,
 * causing wide-arc multi-hit attacks (e.g. Inferlupa sweep, Minespine tremor)
 * to land more sub-ticks.
 */
export function getBodySizeHitModifier(aniimoSize: string, bossSize: string): number {
  if (bossSize === 'Colossal') return 1.20;
  if (bossSize === 'Large') return 1.10;
  if (bossSize === 'Small' && (aniimoSize === 'Colossal' || aniimoSize === 'Large')) return 0.90;
  return 1.0;
}

/**
 * Computes the simulated Time to Break against a specific Boss.
 */
export function simulateBreakCombat(
  aniimo: BreakAniimo,
  boss: BossTarget,
  gear: BreakGear | null = null,
  awakeningStars: number = 0,
  maxDurationSec: number = 30
): SimulationResult {
  const elemMulti = getElementalMultiplier(aniimo.element, boss.element);
  const sizeMulti = getBodySizeHitModifier(aniimo.bodySize, boss.bodySize);

  // Awakening bonus: sum of unlocked stars
  let awakeningBonus = 0;
  for (let i = 0; i < awakeningStars && i < aniimo.awakenings.length; i++) {
    awakeningBonus += aniimo.awakenings[i].breakBonusPercent;
  }

  // Gear bonus
  const gearBonus = gear ? gear.breakBoostPercent : 0;
  const totalMultiplierPercent = aniimo.stats.breakMultiplier + awakeningBonus + gearBonus;

  // Armor reduction mitigation: shieldPenetration mitigates boss armorHardness
  const effectiveArmor = Math.max(0, boss.armorHardness * (1 - aniimo.stats.shieldPenetration / 100));
  const armorMitigationFactor = 1 - (effectiveArmor / 150); // Hard cap resistance

  // Base Break DPS = (breakEfficiency * 18) * Multiplier * Elem * Size * Armor
  const baseBreakDps = (aniimo.stats.breakEfficiency * 18.5)
    * (totalMultiplierPercent / 100)
    * elemMulti
    * sizeMulti
    * armorMitigationFactor;

  let currentGauge = boss.breakGaugeHp;
  let elapsed = 0;
  const timeStep = 0.2; // 200ms intervals
  const timeline: SimulationResult['timeline'] = [];
  let isBroken = false;
  let breakTime = maxDurationSec;
  let totalHits = 0;

  timeline.push({
    second: 0,
    remainingGaugePercent: 100,
    damageDealt: 0,
    event: 'Assault Commenced',
  });

  while (elapsed < maxDurationSec) {
    elapsed += timeStep;
    totalHits += Math.round(aniimo.signatureSkill.hitCount * timeStep * 1.5);

    // Signature skill triggers periodically (every cooldownSec)
    const isSkillCycle = Math.abs(elapsed % aniimo.signatureSkill.cooldownSec) < timeStep;
    const skillBonusDmg = isSkillCycle
      ? (aniimo.signatureSkill.breakDamageFlat * (aniimo.signatureSkill.breakGaugeMultiplier / 100) * elemMulti)
      : 0;

    const damageThisStep = (baseBreakDps * timeStep) + skillBonusDmg;
    currentGauge = Math.max(0, currentGauge - damageThisStep);

    // Record timeline at every full 0.5s or on break
    if (Math.abs(elapsed % 0.5) < timeStep / 2 || currentGauge <= 0) {
      const remainingPct = Math.round((currentGauge / boss.breakGaugeHp) * 100);
      timeline.push({
        second: Number(elapsed.toFixed(1)),
        remainingGaugePercent: remainingPct,
        damageDealt: Math.round(boss.breakGaugeHp - currentGauge),
        event: isSkillCycle ? `${aniimo.signatureSkill.name} Burst!` : undefined,
      });
    }

    if (currentGauge <= 0 && !isBroken) {
      isBroken = true;
      breakTime = Number(elapsed.toFixed(2));
      timeline[timeline.length - 1].event = '💥 SHATTERED! BREAK STATE!';
      break;
    }
  }

  const finalStaggerWindow = boss.breakWindowDurationSec + (aniimo.stats.staggerDurationBonus || 0);

  return {
    aniimoId: aniimo.id,
    bossId: boss.id,
    timeToBreakSec: isBroken ? breakTime : maxDurationSec,
    totalHits,
    effectiveBreakDps: Math.round(boss.breakGaugeHp / (isBroken ? breakTime : maxDurationSec)),
    staggerWindowSec: finalStaggerWindow,
    isBroken,
    timeline,
  };
}

/**
 * Calculates dynamic rank score out of 100 based on core metrics.
 */
export function calculateBreakScore(stats: BreakAniimo['stats']): number {
  // Normalize speed: 3.5s or faster = 100, 10s or slower = 0
  const normalizedSpeed = Math.max(0, Math.min(100, ((10 - stats.timeToBreakSec) / (10 - 3.5)) * 100));

  const efficiencyWeight = stats.breakEfficiency * 0.35;
  const speedWeight = normalizedSpeed * 0.25;
  const shieldWeight = stats.shieldPenetration * 0.15;
  const synergyWeight = stats.teamSynergy * 0.15;
  const safetyWeight = stats.safetyRating * 0.10;

  const score = efficiencyWeight + speedWeight + shieldWeight + synergyWeight + safetyWeight;
  return Number(Math.min(99.9, Math.max(50, score)).toFixed(1));
}
