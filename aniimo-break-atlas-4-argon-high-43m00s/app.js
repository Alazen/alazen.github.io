(function () {
  "use strict";

  const RAW_DATA = Array.isArray(window.ANIIMO_BREAK_DATA) ? window.ANIIMO_BREAK_DATA : [];

  const ELEMENT_META = {
    earth: { label: "Earth", color: "#a89879", glow: "rgba(168, 152, 121, 0.34)" },
    fire: { label: "Fire", color: "#e46161", glow: "rgba(228, 97, 97, 0.34)" },
    water: { label: "Water", color: "#529de7", glow: "rgba(82, 157, 231, 0.34)" },
    ice: { label: "Ice", color: "#45c1d6", glow: "rgba(69, 193, 214, 0.34)" },
    grass: { label: "Grass", color: "#51b17a", glow: "rgba(81, 177, 122, 0.34)" },
    electric: { label: "Electric", color: "#d9b310", glow: "rgba(217, 179, 16, 0.34)" },
    wind: { label: "Wind", color: "#2a52be", glow: "rgba(42, 82, 190, 0.38)" },
    dark: { label: "Dark", color: "#a373d2", glow: "rgba(163, 115, 210, 0.36)" }
  };

  const MODE_DESCRIPTIONS = {
    composite: {
      badge: "#1 COMPOSITE CHAMPION",
      metricLabel: "Composite Score",
      desc: "Composite Meta combines Lv.70 Break Gauge fill speed, base BREAK stat, Extra-Large/Large body size bonus, MetaBot boss score, and raid utility into a single customizable index."
    },
    gauge: {
      badge: "#1 GAUGE SPEED CHAMPION",
      metricLabel: "Lv.70 Speed",
      desc: "Aniidex Lv.70 Break Gauge Speed Simulation measures solo shield-shredding velocity relative to #1 Helgon (100%), factoring in skill hit cadence, EP regen, and body size multipliers."
    },
    metabot: {
      badge: "#1 METABOT CHAMPION",
      metricLabel: "MetaBot Score",
      desc: "MetaBot Build 1.0.3634150 Leaderboard evaluates overall combat performance, base stat totals (BST), elemental coverage across 20 bosses, and endgame survivability."
    },
    rawbreak: {
      badge: "#1 RAW BREAK & SIZE",
      metricLabel: "Effective BREAK",
      desc: "Raw BREAK & Size ranks contenders by their base BREAK stat (up to 110 on Wavwal and 108 on Squashel/Inferlupa) combined with body-size hit multipliers (+50% XL, +20% Large)."
    },
    raid: {
      badge: "#1 CO-OP RAID SPECIALIST",
      metricLabel: "Raid Synergy",
      desc: "Raid & Boss Counters prioritizes team-wide Break amplification (Inferlupa +30% Break Taken debuff), boss elemental counter breadth (Shrubclaw 7/20, Magmarex 6/20), and sustained EP uptime."
    }
  };

  const WEIGHT_PRESETS = {
    balanced: { gauge: 35, break: 20, size: 15, meta: 15, utility: 15 },
    speed: { gauge: 75, break: 10, size: 15, meta: 0, utility: 0 },
    raid: { gauge: 15, break: 15, size: 10, meta: 25, utility: 35 },
    juggernaut: { gauge: 25, break: 30, size: 35, meta: 10, utility: 0 }
  };

  const state = {
    mode: "composite",
    view: "matrix",
    weights: { ...WEIGHT_PRESETS.balanced },
    activePreset: "balanced",
    filterElement: "all",
    filterStage: "all",
    filterSize: "all",
    includeBeta: true,
    searchQuery: "",
    tableSort: { col: "activeScore", dir: "desc" },
    spotlightId: "helgon",
    spotlightTab: "trait",
    compareIds: ["helgon", "minespine", "magmarex"],
    nextCompareSlot: 2,
    scatter: {
      x: "break",
      y: "gaugeSpeedPct",
      size: "sizeBonus",
      hoveredId: "helgon"
    },
    sim: {
      breakerId: "helgon",
      bossShield: 2400,
      hornBonus: 24,
      inferlupaBuff: true,
      traitActive: true,
      elementMatch: false,
      regenSupport: true
    }
  };

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function computeCreatureMetrics(pet) {
    const isBeta = pet.release !== "launch";
    const normGauge = clamp(pet.gaugeSpeedPct, 0, 100);
    const normBreak = clamp(((pet.stats.break - 52) / 58) * 100, 0, 100);
    const normSize = pet.sizeBonus === 50 ? 100 : pet.sizeBonus === 20 ? 68 : pet.bodySize === "Medium" ? 42 : 24;
    const normMeta = clamp(pet.metaScore, 0, 100);
    const bossPart = (pet.bossCounters / 7) * 44;
    const teamPart = pet.teamAmplifyPct >= 30 ? 38 : pet.teamAmplifyPct > 0 ? 18 : 0;
    const selfPart = Math.min(12, (pet.selfBuffPct || 0) * 0.3);
    const bulkPart = clamp(((pet.stats.hp + pet.stats.regen - 100) / 115) * 18, 0, 18);
    const normUtility = clamp(bossPart + teamPart + selfPart + bulkPart, 0, 100);

    const w = state.weights;
    const totalWeight = (w.gauge + w.break + w.size + w.meta + w.utility) || 1;
    const rawComposite = (
      normGauge * w.gauge +
      normBreak * w.break +
      normSize * w.size +
      normMeta * w.meta +
      normUtility * w.utility
    ) / totalWeight;
    const compositeScore = isBeta ? rawComposite * 0.94 : rawComposite;

    const rawBreakScore = clamp(
      normBreak * 0.62 + normSize * 0.24 + ((pet.stats.total - 320) / 255) * 14,
      0,
      100
    );

    const raidScore = clamp(
      normUtility * 0.58 + normMeta * 0.24 + normBreak * 0.18,
      0,
      100
    );

    let activeScore = compositeScore;
    if (state.mode === "gauge") {
      activeScore = pet.gaugeSpeedPct;
    } else if (state.mode === "metabot") {
      activeScore = pet.metaScore;
    } else if (state.mode === "rawbreak") {
      activeScore = rawBreakScore;
    } else if (state.mode === "raid") {
      activeScore = raidScore;
    }

    let activeTier = "C";
    if (state.mode === "gauge") {
      activeTier = pet.aniidexTier;
    } else if (state.mode === "metabot") {
      activeTier = pet.metaTier;
    } else {
      if (activeScore >= 76) activeTier = "S";
      else if (activeScore >= 63) activeTier = "A";
      else if (activeScore >= 48) activeTier = "B";
      else if (activeScore >= 33) activeTier = "C";
      else activeTier = "D";
    }

    return {
      ...pet,
      normGauge,
      normBreak,
      normSize,
      normMeta,
      normUtility,
      compositeScore: Number(compositeScore.toFixed(1)),
      rawBreakScore: Number(rawBreakScore.toFixed(1)),
      raidScore: Number(raidScore.toFixed(1)),
      activeScore: Number(activeScore.toFixed(1)),
      activeTier
    };
  }

  function getEnrichedData() {
    const enriched = RAW_DATA.map(computeCreatureMetrics);
    enriched.sort((a, b) => {
      if (b.activeScore !== a.activeScore) return b.activeScore - a.activeScore;
      if (b.gaugeSpeedPct !== a.gaugeSpeedPct) return b.gaugeSpeedPct - a.gaugeSpeedPct;
      return b.stats.break - a.stats.break;
    });
    enriched.forEach((item, index) => {
      item.overallRank = index + 1;
    });
    return enriched;
  }

  function filterData(enrichedList) {
    const q = state.searchQuery.trim().toLowerCase();
    return enrichedList.filter((pet) => {
      if (!state.includeBeta && pet.release !== "launch") return false;
      if (state.filterElement !== "all" && !pet.elements.includes(state.filterElement)) return false;
      if (state.filterStage !== "all" && pet.stage !== state.filterStage) return false;
      if (state.filterSize !== "all" && pet.bodySize !== state.filterSize) return false;
      if (q) {
        const hay = [
          pet.name,
          pet.dex,
          pet.stage,
          pet.bodySize,
          pet.elements.join(" "),
          pet.trait.name,
          pet.trait.desc,
          pet.primarySkill.name,
          pet.ultimate.name,
          pet.habitat,
          pet.summary
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderElementBadgesSkew(elements) {
    return elements
      .map((el) => {
        const meta = ELEMENT_META[el] || { label: el };
        return `<span class="attr-skew-badge ${escapeHtml(el)}">
          <img src="assets/elements/${escapeHtml(el)}.webp" alt="" width="15" height="15" />
          <span>${escapeHtml(meta.label)}</span>
        </span>`;
      })
      .join("");
  }

  function renderHeroChampion(enrichedList, filteredList) {
    const champion = filteredList[0] || enrichedList[0];
    if (!champion) return;

    const modeMeta = MODE_DESCRIPTIONS[state.mode] || MODE_DESCRIPTIONS.composite;
    const badgeEl = document.getElementById("champLensBadge");
    const dexEl = document.getElementById("champDex");
    const nameEl = document.getElementById("champName");
    const sumEl = document.getElementById("champSummary");
    const m1Label = document.getElementById("champMetric1Label");
    const m1Val = document.getElementById("champMetric1Val");
    const m2Val = document.getElementById("champMetric2Val");
    const m3Val = document.getElementById("champMetric3Val");
    const artImg = document.getElementById("champArtImg");
    const traitLine = document.getElementById("champTraitLine");
    const inspectBtn = document.getElementById("champInspectBtn");

    if (badgeEl) badgeEl.textContent = modeMeta.badge;
    if (dexEl) dexEl.textContent = `${champion.dex} | ${champion.stage}`;
    if (nameEl) nameEl.textContent = champion.name;
    if (sumEl) sumEl.textContent = champion.summary;
    if (m1Label) m1Label.textContent = modeMeta.metricLabel;
    if (m1Val) {
      m1Val.textContent = state.mode === "gauge" ? `${champion.activeScore}%` : String(champion.activeScore);
    }
    if (m2Val) m2Val.textContent = `${champion.gaugeSpeedPct}% (${champion.aniidexTier})`;
    if (m3Val) {
      const bonusStr = champion.sizeBonus > 0 ? `+${champion.sizeBonus}%` : "Std";
      m3Val.textContent = `${champion.stats.break} (${bonusStr})`;
    }
    if (artImg) {
      artImg.src = `assets/creatures/${champion.id}.webp`;
      artImg.alt = `${champion.name} full artwork`;
    }
    if (traitLine) {
      traitLine.textContent = `${champion.trait.name}: ${champion.trait.desc}`;
    }
    if (inspectBtn) {
      inspectBtn.onclick = () => {
        selectSpotlightCreature(champion.id, true);
      };
    }
  }

  function renderMilestoneHeader(enrichedList, filteredList) {
    const countEl = document.getElementById("visibleBreakerCount");
    const descEl = document.getElementById("activeModeDescription");
    const labelEl = document.getElementById("activeLensCounterLabel");
    const modeMeta = MODE_DESCRIPTIONS[state.mode] || MODE_DESCRIPTIONS.composite;

    if (countEl) {
      countEl.textContent = `${filteredList.length} / ${enrichedList.length}`;
    }
    if (descEl) {
      descEl.textContent = modeMeta.desc;
    }
    if (labelEl) {
      const topPet = filteredList[0];
      labelEl.textContent = topPet
        ? `Lead: #1 ${topPet.name} (${topPet.activeScore})`
        : "No Matching Breakers";
    }
  }

  function renderTierMatrix(filteredList) {
    const container = document.getElementById("tierMatrixView");
    if (!container) return;

    const tiers = ["S", "A", "B", "C", "D"];
    const tierSubtitles = {
      S: "Apex Gauge Shredders & Meta Leaders",
      A: "High-Velocity Boss Breakers",
      B: "Solid Mid-Game & Elemental Specialists",
      C: "Transitional Gamma / Niche Picks",
      D: "Early-Game Lumin Starters"
    };

    const html = tiers
      .map((tierKey) => {
        const items = filteredList.filter((p) => p.activeTier === tierKey);
        const tilesHtml = items.length
          ? items
              .map((pet) => {
                const isSelected = pet.id === state.spotlightId;
                const sizeChip =
                  pet.sizeBonus > 0
                    ? `<span class="pet-size-tag">+${pet.sizeBonus}%</span>`
                    : "";
                const elDots = pet.elements
                  .map(
                    (el) =>
                      `<img src="assets/elements/${escapeHtml(el)}.webp" alt="${escapeHtml(el)}" class="pet-el-dot" width="18" height="18" />`
                  )
                  .join("");
                const scoreSuffix = state.mode === "gauge" ? "%" : "";

                return `<button type="button" class="pet-tile ${isSelected ? "is-selected" : ""}" data-pet-id="${escapeHtml(pet.id)}" aria-label="Rank ${pet.overallRank} ${escapeHtml(pet.name)}, Tier ${tierKey}, Score ${pet.activeScore}">
                  <div class="pet-tile-portrait-box">
                    <span class="pet-rank-tag">#${pet.overallRank}</span>
                    <div class="pet-elements-stack">${elDots}</div>
                    <img src="assets/portraits/${escapeHtml(pet.id)}.webp" alt="${escapeHtml(pet.name)}" class="pet-avatar" width="96" height="96" loading="lazy" />
                    <span class="pet-dex-tag">${escapeHtml(pet.dex)}</span>
                    ${sizeChip}
                  </div>
                  <div class="pet-tile-name">${escapeHtml(pet.name)}</div>
                  <div class="pet-tile-score-row">
                    <span>BREAK ${pet.stats.break}</span>
                    <strong>${pet.activeScore}${scoreSuffix}</strong>
                  </div>
                  <div class="pet-tile-bar" aria-hidden="true">
                    <div class="pet-tile-bar-fill" style="width: ${clamp(pet.activeScore, 6, 100)}%;"></div>
                  </div>
                </button>`;
              })
              .join("")
          : `<p class="tier-empty-msg">No Break Aniimo in Tier ${tierKey} match the current filter criteria.</p>`;

        return `<div class="tier-row" data-tier-row="${tierKey}">
          <div class="tier-rail" data-tier="${tierKey}" title="${escapeHtml(tierSubtitles[tierKey])}">
            <span class="tier-letter">${tierKey}</span>
            <span class="tier-count">${items.length} ${items.length === 1 ? "Unit" : "Units"}</span>
          </div>
          <div class="tier-shelf">
            ${tilesHtml}
          </div>
        </div>`;
      })
      .join("");

    container.innerHTML = html;

    container.querySelectorAll(".pet-tile").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-pet-id");
        if (id) selectSpotlightCreature(id, true);
      });
    });
  }

  function renderCardsGrid(filteredList) {
    const container = document.getElementById("cardsGridView");
    if (!container) return;

    if (!filteredList.length) {
      container.innerHTML = `<div class="breaker-detail-card"><p>No Break Aniimo match your active filters. Click "Reset All Filters" to restore all 28 contenders.</p></div>`;
      return;
    }

    container.innerHTML = filteredList
      .map((pet) => {
        const elIcons = pet.elements
          .map(
            (el) =>
              `<img src="assets/elements/${escapeHtml(el)}.webp" alt="${escapeHtml(el)}" width="16" height="16" style="display:inline-block; vertical-align:middle;" />`
          )
          .join(" ");
        const sizeLabel =
          pet.sizeBonus > 0 ? `${pet.bodySize} (+${pet.sizeBonus}%)` : pet.bodySize;

        return `<article class="breaker-detail-card" data-card-id="${escapeHtml(pet.id)}">
          <div class="bdc-head">
            <img src="assets/portraits/${escapeHtml(pet.id)}.webp" alt="${escapeHtml(pet.name)}" class="bdc-avatar" width="64" height="64" loading="lazy" />
            <div class="bdc-title-wrap">
              <div class="bdc-top-badges">
                <span class="tier-mini-chip" data-tier="${pet.activeTier}">#${pet.overallRank} | ${pet.activeTier}-TIER</span>
                <span style="font-family: var(--font-num); font-size: 0.74rem; color: var(--ink-muted); font-weight: 700;">${escapeHtml(pet.dex)}</span>
                <span>${elIcons}</span>
              </div>
              <h3 class="bdc-name">${escapeHtml(pet.name)}</h3>
              <div class="bdc-meta-line">${escapeHtml(pet.stage)} Stage | ${escapeHtml(sizeLabel)} | Speed: ${pet.gaugeSpeedPct}%</div>
            </div>
          </div>

          <div class="bdc-stats-strip">
            <div class="bdc-stat-cell"><small>HP</small><strong>${pet.stats.hp}</strong></div>
            <div class="bdc-stat-cell"><small>BREAK</small><strong style="color: var(--aniimo-cyan-deep);">${pet.stats.break}</strong></div>
            <div class="bdc-stat-cell"><small>ATK</small><strong>${pet.stats.atk}</strong></div>
            <div class="bdc-stat-cell"><small>P.DEF</small><strong>${pet.stats.pdef}</strong></div>
            <div class="bdc-stat-cell"><small>M.DEF</small><strong>${pet.stats.mdef}</strong></div>
            <div class="bdc-stat-cell"><small>REGEN</small><strong>${pet.stats.regen}</strong></div>
          </div>

          <p class="bdc-desc">
            <strong>${escapeHtml(pet.primarySkill.name)} (${escapeHtml(pet.primarySkill.share)} Break):</strong> ${escapeHtml(pet.summary)}
          </p>

          <div class="bdc-actions">
            <button type="button" class="bdc-btn primary" data-action="spotlight" data-id="${escapeHtml(pet.id)}">Inspect Dossier</button>
            <button type="button" class="bdc-btn" data-action="compare" data-id="${escapeHtml(pet.id)}">+ Pin to Radar</button>
          </div>
        </article>`;
      })
      .join("");

    container.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const act = btn.getAttribute("data-action");
        if (act === "spotlight") {
          selectSpotlightCreature(id, true);
        } else if (act === "compare") {
          pinCreatureToRadar(id, true);
        }
      });
    });
  }

  function renderTableView(filteredList) {
    const tbody = document.getElementById("rankingTableBody");
    if (!tbody) return;

    const sorted = [...filteredList];
    const { col, dir } = state.tableSort;
    const mult = dir === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      let va;
      let vb;
      if (col === "name") {
        return a.name.localeCompare(b.name) * mult;
      }
      if (col in a.stats) {
        va = a.stats[col];
        vb = b.stats[col];
      } else {
        va = a[col];
        vb = b[col];
      }
      if (va !== vb) return (va > vb ? 1 : -1) * mult;
      return a.overallRank - b.overallRank;
    });

    document.querySelectorAll("#tableView thead th[data-sort-col]").forEach((th) => {
      const c = th.getAttribute("data-sort-col");
      if (c === col) {
        th.setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");
      } else {
        th.setAttribute("aria-sort", "none");
      }
    });

    tbody.innerHTML = sorted
      .map((pet) => {
        const elText = pet.elements.map((e) => ELEMENT_META[e]?.label || e).join(" / ");
        const sizeText = pet.sizeBonus > 0 ? `${pet.bodySize} (+${pet.sizeBonus}%)` : pet.bodySize;

        return `<tr>
          <td>
            <span class="tier-mini-chip" data-tier="${pet.activeTier}">#${pet.overallRank} ${pet.activeTier}</span>
            <strong style="margin-left: 6px; font-family: var(--font-num);">${pet.activeScore}</strong>
          </td>
          <th scope="row">
            <div class="table-pet-cell">
              <img src="assets/portraits/${escapeHtml(pet.id)}.webp" alt="" width="38" height="38" loading="lazy" />
              <div>
                <div style="font-weight: 800;">${escapeHtml(pet.name)}</div>
                <small style="color: var(--ink-muted); font-family: var(--font-num);">${escapeHtml(pet.dex)}</small>
              </div>
            </div>
          </th>
          <td>${escapeHtml(elText)} <small style="color: var(--ink-muted);">(${escapeHtml(pet.stage)})</small></td>
          <td>${escapeHtml(sizeText)}</td>
          <td><strong>${pet.gaugeSpeedPct}%</strong> <small style="color: var(--ink-muted);">(${pet.aniidexTier})</small></td>
          <td><strong>${pet.metaScore}</strong> <small style="color: var(--ink-muted);">(${pet.metaTier})</small></td>
          <td style="font-weight: 800; color: var(--aniimo-cyan-deep);">${pet.stats.break}</td>
          <td>${pet.stats.hp}</td>
          <td>${pet.stats.regen}</td>
          <td><strong>${pet.stats.total}</strong></td>
          <td>${pet.bossCounters} / 20</td>
          <td>
            <button type="button" class="preset-chip" data-table-inspect="${escapeHtml(pet.id)}">Dossier</button>
          </td>
        </tr>`;
      })
      .join("");

    tbody.querySelectorAll("button[data-table-inspect]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-table-inspect");
        if (id) selectSpotlightCreature(id, true);
      });
    });
  }

  function renderSpotlightSection(enrichedList) {
    const pet = enrichedList.find((p) => p.id === state.spotlightId) || enrichedList[0];
    if (!pet) return;

    const primaryEl = pet.elements[0] || "wind";
    const elMeta = ELEMENT_META[primaryEl] || ELEMENT_META.wind;
    const backdrop = document.getElementById("spotlightBackdrop");
    if (backdrop) {
      backdrop.style.setProperty("--spotlight-glow", elMeta.glow);
    }

    const dexEl = document.getElementById("spotlightDex");
    const stagePill = document.getElementById("spotlightStagePill");
    const sizePill = document.getElementById("spotlightSizePill");
    const relPill = document.getElementById("spotlightReleasePill");
    const nameEl = document.getElementById("spotlightName");
    const elBadges = document.getElementById("spotlightElements");
    const roleSub = document.getElementById("spotlightRoleSub");
    const sumEl = document.getElementById("spotlightSummary");
    const mainImg = document.getElementById("spotlightMainImg");

    if (dexEl) dexEl.textContent = pet.dex;
    if (stagePill) stagePill.textContent = `${pet.stage} Stage`;
    if (sizePill) {
      sizePill.textContent =
        pet.sizeBonus > 0
          ? `${pet.bodySize} Body (+${pet.sizeBonus}% BREAK)`
          : `${pet.bodySize} Body (+0% BREAK)`;
    }
    if (relPill) {
      relPill.textContent = pet.release !== "launch" ? "Closed Beta Archive" : "Launch 1.0 Roster";
    }
    if (nameEl) nameEl.textContent = pet.name;
    if (elBadges) elBadges.innerHTML = renderElementBadgesSkew(pet.elements);
    if (roleSub) {
      roleSub.textContent = `RANK #${pet.overallRank} ACTIVE (${pet.activeTier}-TIER) | LV.70 SPEED: ${pet.gaugeSpeedPct}% | METABOT: ${pet.metaScore}`;
    }
    if (sumEl) sumEl.textContent = pet.summary;
    if (mainImg) {
      mainImg.src = `assets/creatures/${pet.id}.webp`;
      mainImg.alt = `${pet.name} full official render`;
    }

    renderSpotlightTabContent(pet);

    const crossTiers = document.getElementById("spotlightCrossTiers");
    if (crossTiers) {
      crossTiers.innerHTML = `
        <span class="op-chip">Aniidex Speed: <strong>${pet.aniidexTier}-Tier (${pet.gaugeSpeedPct}%)</strong></span>
        <span class="op-chip">MetaBot 1.0: <strong>${pet.metaTier}-Tier (${pet.metaScore})</strong></span>
        <span class="op-chip">GameOnPC: <strong>${pet.gopTier}-Tier</strong></span>
        <span class="op-chip">Boss Counters: <strong>${pet.bossCounters} / 20</strong></span>
      `;
    }

    const statGrid = document.getElementById("spotlightStatGrid");
    if (statGrid) {
      const statDefs = [
        { label: "BREAK (Shield Shred)", val: pet.stats.break, max: 115, color: "#76e1f8" },
        { label: "Lv.70 Gauge Speed", val: `${pet.gaugeSpeedPct}%`, num: pet.gaugeSpeedPct, max: 100, color: "#fbbf24" },
        { label: "HP (Health Pool)", val: pet.stats.hp, max: 115, color: "#34d399" },
        { label: "REGEN (EP Recovery)", val: pet.stats.regen, max: 115, color: "#60a5fa" },
        { label: "ATK (Strike Power)", val: pet.stats.atk, max: 115, color: "#f87171" },
        { label: "P.DEF (Physical Armor)", val: pet.stats.pdef, max: 115, color: "#a78bfa" },
        { label: "M.DEF (Magic Resist)", val: pet.stats.mdef, max: 115, color: "#c084fc" },
        { label: "Base Stat Total (BST)", val: pet.stats.total, max: 580, color: "#38bdf8" }
      ];

      statGrid.innerHTML = statDefs
        .map((st) => {
          const rawNum = typeof st.num === "number" ? st.num : st.val;
          const pct = clamp((rawNum / st.max) * 100, 5, 100);
          return `<div class="sp-stat-row">
            <div class="sp-stat-label">
              <span style="color: rgba(243, 245, 255, 0.78);">${escapeHtml(st.label)}</span>
              <strong style="color: #ffffff;">${escapeHtml(st.val)}</strong>
            </div>
            <div class="sp-stat-bar">
              <div class="sp-stat-fill" style="width: ${pct}%; background: ${st.color};"></div>
            </div>
          </div>`;
        })
        .join("");
    }

    renderHexDock(enrichedList);
  }

  function renderSpotlightTabContent(pet) {
    const titleEl = document.getElementById("spDetailTitle");
    const chipsEl = document.getElementById("spDetailChips");
    const descEl = document.getElementById("spDetailDesc");
    if (!titleEl || !chipsEl || !descEl) return;

    document.querySelectorAll(".op-tab-btn[data-sp-tab]").forEach((btn) => {
      const t = btn.getAttribute("data-sp-tab");
      btn.setAttribute("aria-selected", t === state.spotlightTab ? "true" : "false");
    });

    if (state.spotlightTab === "trait") {
      titleEl.textContent = pet.trait.name;
      chipsEl.innerHTML = `
        <span class="op-chip">${escapeHtml(pet.trait.type)}</span>
        <span class="op-chip">Size Multiplier: +${pet.sizeBonus}% BREAK</span>
        ${pet.teamAmplifyPct > 0 ? `<span class="op-chip" style="background: rgba(239, 68, 68, 0.35); color: #fecaca;">Team Debuff: +${pet.teamAmplifyPct}%</span>` : ""}
      `;
      descEl.textContent = pet.trait.desc;
    } else if (state.spotlightTab === "skill") {
      titleEl.textContent = pet.primarySkill.name;
      chipsEl.innerHTML = `
        <span class="op-chip">Might: ${escapeHtml(pet.primarySkill.might)}</span>
        <span class="op-chip">EP Cost: ${pet.primarySkill.ep}</span>
        <span class="op-chip">Cooldown: ${escapeHtml(pet.primarySkill.cd)}</span>
        <span class="op-chip" style="background: rgba(53, 134, 226, 0.35); color: #bae6fd;">Share: ${escapeHtml(pet.primarySkill.share)} of Break</span>
      `;
      descEl.textContent = pet.primarySkill.desc;
    } else if (state.spotlightTab === "ultimate") {
      titleEl.textContent = pet.ultimate.name;
      chipsEl.innerHTML = `
        <span class="op-chip">Might: ${escapeHtml(pet.ultimate.might)}</span>
        <span class="op-chip">EP Cost: ${pet.ultimate.ep}</span>
        <span class="op-chip">Cooldown: ${escapeHtml(pet.ultimate.cd)}</span>
        <span class="op-chip" style="background: rgba(245, 158, 11, 0.35); color: #fde68a;">Share: ${escapeHtml(pet.ultimate.share)} of Break</span>
      `;
      descEl.textContent = pet.ultimate.desc;
    } else {
      titleEl.textContent = "Evolution Line, Habitat & Gargantuan Horn Synergy";
      chipsEl.innerHTML = `
        <span class="op-chip">Habitat: ${escapeHtml(pet.habitat)}</span>
        <span class="op-chip">Traversal: ${escapeHtml(pet.traversal.join(", "))}</span>
      `;
      const evoChain = pet.evolutionLine.join(" -> ");
      descEl.textContent = `Evolution Path: ${evoChain}. Equip the Homeland Gargantuan Horn weapon before engaging bosses to stack up to +36% additional BREAK efficiency on top of ${pet.name}'s +${pet.sizeBonus}% ${pet.bodySize} body bonus.`;
    }
  }

  function renderHexDock(enrichedList) {
    const dock = document.getElementById("hexDockScroll");
    if (!dock) return;

    dock.innerHTML = enrichedList
      .map((pet) => {
        const isSelected = pet.id === state.spotlightId;
        return `<button type="button" class="hex-control-item" role="option" aria-selected="${isSelected ? "true" : "false"}" data-hex-id="${escapeHtml(pet.id)}" title="#${pet.overallRank} ${escapeHtml(pet.name)} (${escapeHtml(pet.dex)})">
          <div class="hex-bg"></div>
          <img src="assets/portraits/${escapeHtml(pet.id)}.webp" alt="${escapeHtml(pet.name)}" width="64" height="64" loading="lazy" />
          <span class="hex-seq-tag">#${pet.overallRank}</span>
        </button>`;
      })
      .join("");

    dock.querySelectorAll(".hex-control-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-hex-id");
        if (id) selectSpotlightCreature(id, false);
      });
    });
  }

  function selectSpotlightCreature(id, shouldScroll) {
    state.spotlightId = id;
    const enriched = getEnrichedData();
    renderSpotlightSection(enriched);
    document.querySelectorAll(".pet-tile").forEach((el) => {
      el.classList.toggle("is-selected", el.getAttribute("data-pet-id") === id);
    });
    if (shouldScroll) {
      const section = document.getElementById("spotlight");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function populateSelectOptions(enrichedList) {
    const compareSelectIds = ["compareSelect0", "compareSelect1", "compareSelect2"];
    compareSelectIds.forEach((selId, slotIdx) => {
      const sel = document.getElementById(selId);
      if (!sel) return;
      const currentVal = state.compareIds[slotIdx];
      sel.innerHTML = enrichedList
        .map(
          (p) =>
            `<option value="${escapeHtml(p.id)}" ${p.id === currentVal ? "selected" : ""}>#${p.overallRank} ${escapeHtml(p.name)} (${escapeHtml(p.dex)})</option>`
        )
        .join("");
    });

    const simSelect = document.getElementById("simBreakerSelect");
    if (simSelect) {
      simSelect.innerHTML = enrichedList
        .map(
          (p) =>
            `<option value="${escapeHtml(p.id)}" ${p.id === state.sim.breakerId ? "selected" : ""}>#${p.overallRank} ${escapeHtml(p.name)} - ${p.gaugeSpeedPct}% Speed | ${p.stats.break} BREAK (${escapeHtml(p.bodySize)})</option>`
        )
        .join("");
    }
  }

  function renderRadarComparator(enrichedList) {
    const svgWrap = document.getElementById("radarSvgContainer");
    const tbody = document.getElementById("radarDeltaBody");
    if (!svgWrap || !tbody) return;

    const contenders = state.compareIds.map(
      (id) => enrichedList.find((p) => p.id === id) || enrichedList[0]
    );

    const slotColors = [
      { stroke: "#10a7e6", fill: "rgba(16, 167, 230, 0.22)" },
      { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.20)" },
      { stroke: "#8b5cf6", fill: "rgba(139, 92, 246, 0.20)" }
    ];

    contenders.forEach((pet, idx) => {
      const th = document.getElementById(`radarTh${idx}`);
      if (th && pet) th.textContent = pet.name;
    });

    const axes = [
      { key: "break", label: "BREAK", max: 115 },
      { key: "hp", label: "HP", max: 115 },
      { key: "regen", label: "REGEN", max: 115 },
      { key: "atk", label: "ATK", max: 115 },
      { key: "pdef", label: "P.DEF", max: 115 },
      { key: "mdef", label: "M.DEF", max: 115 }
    ];

    const cx = 190;
    const cy = 165;
    const radius = 112;

    const rings = [0.25, 0.5, 0.75, 1.0];
    const gridPolygons = rings
      .map((r) => {
        const pts = axes
          .map((_, i) => {
            const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius * r;
            const y = cy + Math.sin(angle) * radius * r;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ");
        return `<polygon points="${pts}" fill="none" stroke="rgba(100, 116, 139, 0.26)" stroke-width="1" />`;
      })
      .join("");

    const axisLines = axes
      .map((ax, i) => {
        const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        const x2 = cx + Math.cos(angle) * radius;
        const y2 = cy + Math.sin(angle) * radius;
        const lx = cx + Math.cos(angle) * (radius + 26);
        const ly = cy + Math.sin(angle) * (radius + 20);
        return `
          <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(100, 116, 139, 0.32)" stroke-width="1" />
          <text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" font-family="Chakra Petch, sans-serif" font-size="11.5" font-weight="700" fill="currentColor">${ax.label}</text>
        `;
      })
      .join("");

    const dataPolygons = contenders
      .map((pet, idx) => {
        if (!pet) return "";
        const style = slotColors[idx];
        const pts = axes
          .map((ax, i) => {
            const val = pet.stats[ax.key] || 0;
            const ratio = clamp(val / ax.max, 0.1, 1.0);
            const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius * ratio;
            const y = cy + Math.sin(angle) * radius * ratio;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ");

        const dots = axes
          .map((ax, i) => {
            const val = pet.stats[ax.key] || 0;
            const ratio = clamp(val / ax.max, 0.1, 1.0);
            const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius * ratio;
            const y = cy + Math.sin(angle) * radius * ratio;
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${style.stroke}" />`;
          })
          .join("");

        return `<g>
          <polygon points="${pts}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2.4" />
          ${dots}
        </g>`;
      })
      .join("");

    svgWrap.innerHTML = `<svg class="radar-svg" viewBox="0 0 380 330">
      ${gridPolygons}
      ${axisLines}
      ${dataPolygons}
    </svg>`;

    const tableRows = [
      { label: "Active Score", get: (p) => p.activeScore },
      { label: "Lv.70 Speed (%)", get: (p) => p.gaugeSpeedPct, suffix: "%" },
      { label: "Body Size Bonus", get: (p) => p.sizeBonus, prefix: "+", suffix: "%" },
      { label: "Base BREAK", get: (p) => p.stats.break },
      { label: "Base HP", get: (p) => p.stats.hp },
      { label: "Base REGEN", get: (p) => p.stats.regen },
      { label: "Base Stat Total", get: (p) => p.stats.total },
      { label: "MetaBot Score", get: (p) => p.metaScore },
      { label: "Boss Counters", get: (p) => p.bossCounters, suffix: " / 20" }
    ];

    tbody.innerHTML = tableRows
      .map((row) => {
        const vals = contenders.map((c) => (c ? row.get(c) : 0));
        const maxVal = Math.max(...vals);
        const cells = vals
          .map((v) => {
            const isBest = v === maxVal && maxVal > 0;
            const text = `${row.prefix || ""}${v}${row.suffix || ""}`;
            return `<td style="${isBest ? "font-weight: 800; color: var(--aniimo-cyan-deep);" : ""}">${text}</td>`;
          })
          .join("");
        return `<tr><td>${escapeHtml(row.label)}</td>${cells}</tr>`;
      })
      .join("");
  }

  function pinCreatureToRadar(id, shouldScroll) {
    if (!state.compareIds.includes(id)) {
      state.compareIds[state.nextCompareSlot] = id;
      state.nextCompareSlot = (state.nextCompareSlot + 1) % 3;
    }
    const enriched = getEnrichedData();
    populateSelectOptions(enriched);
    renderRadarComparator(enriched);
    if (shouldScroll) {
      const el = document.getElementById("analytics");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function getMetricValue(pet, key) {
    if (key in pet.stats) return pet.stats[key];
    if (key in pet.breakdown) return pet.breakdown[key];
    return pet[key] ?? 0;
  }

  function getMetricLabel(key) {
    const labels = {
      break: "Base BREAK Stat",
      total: "Base Stat Total (BST)",
      hp: "Base HP",
      regen: "Base REGEN",
      bossCounters: "Boss Counters (of 20)",
      gaugeSpeedPct: "Lv.70 Gauge Speed (%)",
      metaScore: "MetaBot Score",
      activeScore: "Active Ranking Score",
      skillPct: "Primary Skill Share (%)",
      sizeBonus: "Body Size Bonus (%)"
    };
    return labels[key] || key;
  }

  function renderScatterExplorer(filteredList) {
    const container = document.getElementById("scatterSvgContainer");
    const readout = document.getElementById("scatterHoverReadout");
    if (!container) return;

    const list = filteredList.length ? filteredList : getEnrichedData();
    const xKey = state.scatter.x;
    const yKey = state.scatter.y;
    const sKey = state.scatter.size;

    const xVals = list.map((p) => getMetricValue(p, xKey));
    const yVals = list.map((p) => getMetricValue(p, yKey));

    const minX = Math.min(...xVals);
    const maxX = Math.max(...xVals, minX + 1);
    const minY = Math.min(...yVals);
    const maxY = Math.max(...yVals, minY + 1);

    const width = 560;
    const height = 310;
    const padL = 48;
    const padR = 26;
    const padT = 22;
    const padB = 38;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const scaleX = (v) => padL + ((v - minX) / (maxX - minX || 1)) * plotW;
    const scaleY = (v) => padT + plotH - ((v - minY) / (maxY - minY || 1)) * plotH;

    const gridLines = [0, 0.25, 0.5, 0.75, 1]
      .map((t) => {
        const y = padT + plotH * (1 - t);
        const valY = Math.round(minY + (maxY - minY) * t);
        const x = padL + plotW * t;
        const valX = Math.round(minX + (maxX - minX) * t);
        return `
          <line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="rgba(100, 116, 139, 0.18)" stroke-dasharray="3 3" />
          <text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-family="Chakra Petch, sans-serif" font-size="10.5" fill="currentColor" opacity="0.75">${valY}</text>
          <text x="${x.toFixed(1)}" y="${height - 14}" text-anchor="middle" font-family="Chakra Petch, sans-serif" font-size="10.5" fill="currentColor" opacity="0.75">${valX}</text>
        `;
      })
      .join("");

    const nodesHtml = list
      .map((pet) => {
        const xv = getMetricValue(pet, xKey);
        const yv = getMetricValue(pet, yKey);
        const sv = getMetricValue(pet, sKey);
        const cx = scaleX(xv);
        const cy = scaleY(yv);

        let r = 7;
        if (sKey === "sizeBonus") {
          r = pet.sizeBonus === 50 ? 12 : pet.sizeBonus === 20 ? 9.5 : 6.5;
        } else if (sKey === "bossCounters") {
          r = 5.5 + pet.bossCounters * 1.1;
        } else {
          r = 5 + ((pet.stats.break - 55) / 55) * 7;
        }

        const elColor = ELEMENT_META[pet.elements[0]]?.color || "#10a7e6";
        const showLabel = pet.overallRank <= 7 || pet.id === state.spotlightId;

        return `<g class="scatter-node" data-scatter-id="${escapeHtml(pet.id)}" tabindex="0" role="button" aria-label="${escapeHtml(pet.name)}: ${getMetricLabel(xKey)} ${xv}, ${getMetricLabel(yKey)} ${yv}">
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${elColor}" fill-opacity="0.82" stroke="#ffffff" stroke-width="1.8" />
          ${
            showLabel
              ? `<text x="${cx.toFixed(1)}" y="${(cy - r - 4).toFixed(1)}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="10.5" font-weight="700" fill="currentColor">${escapeHtml(pet.name)}</text>`
              : ""
          }
        </g>`;
      })
      .join("");

    container.innerHTML = `<svg class="scatter-svg" viewBox="0 0 ${width} ${height}">
      ${gridLines}
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${height - padB}" stroke="rgba(100, 116, 139, 0.45)" stroke-width="1.5" />
      <line x1="${padL}" y1="${height - padB}" x2="${width - padR}" y2="${height - padB}" stroke="rgba(100, 116, 139, 0.45)" stroke-width="1.5" />
      <text x="${width / 2}" y="${height - 1}" text-anchor="middle" font-family="Chakra Petch, sans-serif" font-size="11" font-weight="700" fill="currentColor">${escapeHtml(getMetricLabel(xKey))}</text>
      ${nodesHtml}
    </svg>`;

    const updateReadout = (pet) => {
      if (!readout || !pet) return;
      const xv = getMetricValue(pet, xKey);
      const yv = getMetricValue(pet, yKey);
      readout.innerHTML = `
        <span><strong>#${pet.overallRank} ${escapeHtml(pet.name)} (${escapeHtml(pet.dex)})</strong> | ${escapeHtml(getMetricLabel(xKey))}: <strong>${xv}</strong> | ${escapeHtml(getMetricLabel(yKey))}: <strong>${yv}</strong></span>
        <strong style="font-family: var(--font-num); color: var(--aniimo-cyan-deep);">${escapeHtml(pet.bodySize)} (+${pet.sizeBonus}%)</strong>
      `;
    };

    container.querySelectorAll(".scatter-node").forEach((node) => {
      const id = node.getAttribute("data-scatter-id");
      const pet = list.find((p) => p.id === id);
      node.addEventListener("mouseenter", () => updateReadout(pet));
      node.addEventListener("focus", () => updateReadout(pet));
      node.addEventListener("click", () => {
        if (id) selectSpotlightCreature(id, true);
      });
    });
  }

  function renderDecompositionBars(filteredList) {
    const container = document.getElementById("decompBarsList");
    if (!container) return;

    const topItems = filteredList.slice(0, 12);
    container.innerHTML = topItems
      .map((pet) => {
        const { skillPct, ultPct, basicPct } = pet.breakdown;
        return `<div class="decomp-item">
          <div class="decomp-item-top">
            <span>#${pet.overallRank} ${escapeHtml(pet.name)} <small style="color: var(--ink-muted);">(${pet.gaugeSpeedPct}% Speed)</small></span>
            <span style="font-family: var(--font-num); font-size: 0.76rem; color: var(--aniimo-cyan-deep);">${escapeHtml(pet.primarySkill.name)}</span>
          </div>
          <div class="decomp-stacked-track" role="img" aria-label="${escapeHtml(pet.name)} Break damage sources: Skill ${skillPct}%, Ultimate ${ultPct}%, Basic ${basicPct}%">
            <div class="seg-skill" style="width: ${skillPct}%;" title="Primary Skill: ${skillPct}%"></div>
            <div class="seg-ult" style="width: ${ultPct}%;" title="Ultimate: ${ultPct}%"></div>
            <div class="seg-basic" style="width: ${basicPct}%;" title="Basic Attack: ${basicPct}%"></div>
          </div>
          <div class="decomp-legend-row">
            <span>Skill: <strong>${skillPct}%</strong></span>
            <span>Ult: <strong>${ultPct}%</strong></span>
            <span>Basic: <strong>${basicPct}%</strong></span>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderSimulator(enrichedList) {
    const pet = enrichedList.find((p) => p.id === state.sim.breakerId) || enrichedList[0];
    if (!pet) return;

    const bossShield = Number(state.sim.bossShield) || 2400;
    const hornPct = Number(state.sim.hornBonus) || 0;

    // Helgon Lv.70 base shred rate calibrated so Helgon + Horn II + Inferlupa shreds 2,400 shield in ~6.2s
    const baseRateFromSpeed = 165 * (pet.gaugeSpeedPct / 100) + pet.stats.break * 0.55;
    const hornMult = 1 + hornPct / 100;
    const inferlupaMult = state.sim.inferlupaBuff ? 1.30 : 1.0;
    const traitBonusPct = state.sim.traitActive ? Math.max(12, pet.selfBuffPct || 15) : 0;
    const traitMult = 1 + traitBonusPct / 100;
    const elemMult = state.sim.elementMatch ? 1.20 : 1.0;
    const epPenalty = !state.sim.regenSupport && pet.epDowntimePct > 0 ? 1 - (pet.epDowntimePct / 100) * 0.45 : 1.0;

    const totalMultiplier = hornMult * inferlupaMult * traitMult * elemMult * epPenalty;
    const effectiveBreakPerSec = Math.max(28, Math.round(baseRateFromSpeed * totalMultiplier));
    const timeToStagger = (bossShield / effectiveBreakPerSec).toFixed(1);
    const shredIn10sPct = clamp(Math.round(((effectiveBreakPerSec * 10) / bossShield) * 100), 8, 100);

    const bossNames = {
      1200: "Field Alpha Boss",
      2400: "Apex Raid Boss",
      4000: "Elder Calamity Boss",
      5800: "Abyssal Tyrant"
    };
    const bossName = bossNames[bossShield] || "Apex Raid Boss";

    const titleEl = document.getElementById("simBossTitle");
    const subEl = document.getElementById("simSubtitleTag");
    const badgeEl = document.getElementById("simStaggerBadge");
    const fillEl = document.getElementById("simGaugeFill");
    const progEl = document.getElementById("simProgressBar");
    const noteEl = document.getElementById("simShieldshredNote");
    const vsHelgonEl = document.getElementById("simVsHelgonNote");
    const kpiTime = document.getElementById("simKpiTime");
    const kpiDps = document.getElementById("simKpiDps");
    const kpiMult = document.getElementById("simKpiMult");
    const kpiBurst = document.getElementById("simKpiBurst");
    const adviceEl = document.getElementById("simRotationAdvice");

    if (titleEl) titleEl.textContent = `${pet.name} vs. ${bossName} (${bossShield.toLocaleString()} Shield)`;
    if (subEl) {
      subEl.textContent = `${pet.bodySize} (+${pet.sizeBonus}% Size Bonus) | ${pet.primarySkill.name} (${pet.breakdown.skillPct}% share)`;
    }
    if (badgeEl) badgeEl.textContent = `STAGGER IN ${timeToStagger}s`;
    if (fillEl) fillEl.style.width = `${shredIn10sPct}%`;
    if (progEl) progEl.setAttribute("aria-valuenow", String(shredIn10sPct));
    if (noteEl) {
      noteEl.textContent = `10-Second Burst Window Depletes ${shredIn10sPct}% of Boss Shield Gauge`;
    }
    if (vsHelgonEl) {
      vsHelgonEl.textContent = `Lv.70 Gauge Speed Index: ${pet.gaugeSpeedPct}% | Meta Score: ${pet.metaScore}`;
    }
    if (kpiTime) kpiTime.textContent = `${timeToStagger}s`;
    if (kpiDps) kpiDps.textContent = `${effectiveBreakPerSec} / s`;
    if (kpiMult) kpiMult.textContent = `${totalMultiplier.toFixed(2)}x`;
    if (kpiBurst) kpiBurst.textContent = `${shredIn10sPct}%`;

    if (adviceEl) {
      const hornText = hornPct > 0 ? `1. Pre-cast Homeland Gargantuan Horn (+${hornPct}% BREAK). ` : "1. Equip a Gargantuan Horn at your Homeland camp for up to +36% extra BREAK. ";
      const debuffText = state.sim.inferlupaBuff
        ? "2. Apply Inferlupa's Unbroken Flameruff Spirit (+30% Break Taken on boss). "
        : "2. Pair with Inferlupa or a Regen battery to amplify Break efficiency. ";
      const skillText = `3. Channel ${pet.name}'s ${pet.primarySkill.name} (${pet.primarySkill.cd} CD, ${pet.primarySkill.ep} EP) for ${pet.breakdown.skillPct}% of total shield shred, then detonate ${pet.ultimate.name} to finish the stagger window.`;
      adviceEl.textContent = hornText + debuffText + skillText;
    }
  }

  function renderAll() {
    const enriched = getEnrichedData();
    const filtered = filterData(enriched);

    renderHeroChampion(enriched, filtered);
    renderMilestoneHeader(enriched, filtered);
    renderTierMatrix(filtered);
    renderCardsGrid(filtered);
    renderTableView(filtered);
    renderSpotlightSection(enriched);
    populateSelectOptions(enriched);
    renderRadarComparator(enriched);
    renderScatterExplorer(filtered);
    renderDecompositionBars(filtered);
    renderSimulator(enriched);
  }

  function bindEvents() {
    // Theme toggle
    const themeBtn = document.getElementById("themeToggleBtn");
    const sunIcon = document.getElementById("themeIconSun");
    const moonIcon = document.getElementById("themeIconMoon");

    const applyTheme = (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      if (sunIcon && moonIcon) {
        if (theme === "dark") {
          sunIcon.removeAttribute("hidden");
          moonIcon.setAttribute("hidden", "");
        } else {
          moonIcon.removeAttribute("hidden");
          sunIcon.setAttribute("hidden", "");
        }
      }
      try {
        localStorage.setItem("aniimo-break-theme", theme);
      } catch (_) {}
    };

    try {
      const saved = localStorage.getItem("aniimo-break-theme");
      if (saved === "dark" || saved === "light") applyTheme(saved);
    } catch (_) {}

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    }

    // Standout 4 Podium Cards
    document.querySelectorAll(".standout-card[data-standout-id]").forEach((card) => {
      const activate = () => {
        const id = card.getAttribute("data-standout-id");
        const mode = card.getAttribute("data-standout-mode");
        if (mode) {
          state.mode = mode;
          document.querySelectorAll(".mode-btn[data-mode]").forEach((b) => {
            b.setAttribute("aria-pressed", b.getAttribute("data-mode") === mode ? "true" : "false");
          });
        }
        if (id) {
          state.spotlightId = id;
          state.sim.breakerId = id;
        }
        renderAll();
        const sp = document.getElementById("spotlight");
        if (sp) sp.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      card.addEventListener("click", activate);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });

    // Ranking mode buttons
    document.querySelectorAll(".mode-btn[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode");
        if (!mode) return;
        state.mode = mode;
        document.querySelectorAll(".mode-btn[data-mode]").forEach((b) => {
          b.setAttribute("aria-pressed", b.getAttribute("data-mode") === mode ? "true" : "false");
        });
        renderAll();
      });
    });

    // View switcher buttons
    document.querySelectorAll(".view-btn[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        if (!view) return;
        state.view = view;
        document.querySelectorAll(".view-btn[data-view]").forEach((b) => {
          b.setAttribute("aria-pressed", b.getAttribute("data-view") === view ? "true" : "false");
        });

        const matrixEl = document.getElementById("tierMatrixView");
        const cardsEl = document.getElementById("cardsGridView");
        const tableEl = document.getElementById("tableView");

        if (matrixEl) matrixEl.hidden = view !== "matrix";
        if (cardsEl) cardsEl.hidden = view !== "cards";
        if (tableEl) tableEl.hidden = view !== "table";
      });
    });

    // Weight sliders
    const sliderMap = [
      { id: "weightGauge", key: "gauge", valId: "weightGaugeVal" },
      { id: "weightBreak", key: "break", valId: "weightBreakVal" },
      { id: "weightSize", key: "size", valId: "weightSizeVal" },
      { id: "weightMeta", key: "meta", valId: "weightMetaVal" },
      { id: "weightUtility", key: "utility", valId: "weightUtilityVal" }
    ];

    const syncWeightInputs = () => {
      sliderMap.forEach((s) => {
        const input = document.getElementById(s.id);
        const label = document.getElementById(s.valId);
        if (input) input.value = String(state.weights[s.key]);
        if (label) label.textContent = `${state.weights[s.key]}%`;
      });
    };

    sliderMap.forEach((s) => {
      const input = document.getElementById(s.id);
      if (!input) return;
      input.addEventListener("input", () => {
        state.weights[s.key] = Number(input.value) || 0;
        state.mode = "composite";
        document.querySelectorAll(".mode-btn[data-mode]").forEach((b) => {
          b.setAttribute("aria-pressed", b.getAttribute("data-mode") === "composite" ? "true" : "false");
        });
        document.querySelectorAll(".preset-chip[data-preset]").forEach((p) => {
          p.setAttribute("aria-pressed", "false");
        });
        syncWeightInputs();
        renderAll();
      });
    });

    // Weight presets
    document.querySelectorAll(".preset-chip[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const presetKey = btn.getAttribute("data-preset");
        if (!presetKey || !WEIGHT_PRESETS[presetKey]) return;
        state.weights = { ...WEIGHT_PRESETS[presetKey] };
        state.mode = "composite";
        document.querySelectorAll(".mode-btn[data-mode]").forEach((b) => {
          b.setAttribute("aria-pressed", b.getAttribute("data-mode") === "composite" ? "true" : "false");
        });
        document.querySelectorAll(".preset-chip[data-preset]").forEach((p) => {
          p.setAttribute("aria-pressed", p.getAttribute("data-preset") === presetKey ? "true" : "false");
        });
        syncWeightInputs();
        renderAll();
      });
    });

    // Element filter pills
    document.querySelectorAll(".el-filter-btn[data-element]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const el = btn.getAttribute("data-element") || "all";
        state.filterElement = el;
        document.querySelectorAll(".el-filter-btn[data-element]").forEach((b) => {
          b.setAttribute("aria-pressed", b.getAttribute("data-element") === el ? "true" : "false");
        });
        renderAll();
      });
    });

    // Stage, Size, Beta, Search
    const stageSelect = document.getElementById("stageFilter");
    if (stageSelect) {
      stageSelect.addEventListener("change", () => {
        state.filterStage = stageSelect.value;
        renderAll();
      });
    }

    const sizeSelect = document.getElementById("sizeFilter");
    if (sizeSelect) {
      sizeSelect.addEventListener("change", () => {
        state.filterSize = sizeSelect.value;
        renderAll();
      });
    }

    const betaCheck = document.getElementById("includeBetaToggle");
    if (betaCheck) {
      betaCheck.addEventListener("change", () => {
        state.includeBeta = betaCheck.checked;
        renderAll();
      });
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value;
        renderAll();
      });
    }

    const resetBtn = document.getElementById("resetFiltersBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.filterElement = "all";
        state.filterStage = "all";
        state.filterSize = "all";
        state.includeBeta = true;
        state.searchQuery = "";
        if (stageSelect) stageSelect.value = "all";
        if (sizeSelect) sizeSelect.value = "all";
        if (betaCheck) betaCheck.checked = true;
        if (searchInput) searchInput.value = "";
        document.querySelectorAll(".el-filter-btn[data-element]").forEach((b) => {
          b.setAttribute("aria-pressed", b.getAttribute("data-element") === "all" ? "true" : "false");
        });
        renderAll();
      });
    }

    // Table sorting
    document.querySelectorAll(".sort-header-btn[data-sort]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const col = btn.getAttribute("data-sort");
        if (!col) return;
        if (state.tableSort.col === col) {
          state.tableSort.dir = state.tableSort.dir === "desc" ? "asc" : "desc";
        } else {
          state.tableSort.col = col;
          state.tableSort.dir = col === "name" ? "asc" : "desc";
        }
        renderAll();
      });
    });

    // Spotlight tabs & navigation
    document.querySelectorAll(".op-tab-btn[data-sp-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-sp-tab");
        if (!tab) return;
        state.spotlightTab = tab;
        const enriched = getEnrichedData();
        const pet = enriched.find((p) => p.id === state.spotlightId) || enriched[0];
        if (pet) renderSpotlightTabContent(pet);
      });
    });

    const spPrevBtn = document.getElementById("spPrevBtn");
    const spNextBtn = document.getElementById("spNextBtn");
    if (spPrevBtn) {
      spPrevBtn.addEventListener("click", () => {
        const enriched = getEnrichedData();
        const idx = enriched.findIndex((p) => p.id === state.spotlightId);
        const prevIdx = (idx - 1 + enriched.length) % enriched.length;
        selectSpotlightCreature(enriched[prevIdx].id, false);
      });
    }
    if (spNextBtn) {
      spNextBtn.addEventListener("click", () => {
        const enriched = getEnrichedData();
        const idx = enriched.findIndex((p) => p.id === state.spotlightId);
        const nextIdx = (idx + 1) % enriched.length;
        selectSpotlightCreature(enriched[nextIdx].id, false);
      });
    }

    const spCompareBtn = document.getElementById("spAddCompareBtn");
    if (spCompareBtn) {
      spCompareBtn.addEventListener("click", () => {
        pinCreatureToRadar(state.spotlightId, true);
      });
    }

    const spSimBtn = document.getElementById("spLoadSimBtn");
    if (spSimBtn) {
      spSimBtn.addEventListener("click", () => {
        state.sim.breakerId = state.spotlightId;
        renderAll();
        const simSec = document.getElementById("simulator");
        if (simSec) simSec.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    // Radar compare selects
    [0, 1, 2].forEach((slotIdx) => {
      const sel = document.getElementById(`compareSelect${slotIdx}`);
      if (!sel) return;
      sel.addEventListener("change", () => {
        state.compareIds[slotIdx] = sel.value;
        renderRadarComparator(getEnrichedData());
      });
    });

    // Scatter controls
    const sx = document.getElementById("scatterXSelect");
    const sy = document.getElementById("scatterYSelect");
    const ss = document.getElementById("scatterSizeSelect");
    [sx, sy, ss].forEach((el) => {
      if (!el) return;
      el.addEventListener("change", () => {
        if (sx) state.scatter.x = sx.value;
        if (sy) state.scatter.y = sy.value;
        if (ss) state.scatter.size = ss.value;
        renderScatterExplorer(filterData(getEnrichedData()));
      });
    });

    // Simulator controls
    const simBreaker = document.getElementById("simBreakerSelect");
    const simBoss = document.getElementById("simBossSelect");
    const simHorn = document.getElementById("simHornSelect");
    const simInf = document.getElementById("simInferlupaBuff");
    const simTrait = document.getElementById("simTraitActive");
    const simElem = document.getElementById("simElementMatch");
    const simRegen = document.getElementById("simRegenSupport");

    const updateSimState = () => {
      if (simBreaker) state.sim.breakerId = simBreaker.value;
      if (simBoss) state.sim.bossShield = Number(simBoss.value);
      if (simHorn) state.sim.hornBonus = Number(simHorn.value);
      if (simInf) state.sim.inferlupaBuff = simInf.checked;
      if (simTrait) state.sim.traitActive = simTrait.checked;
      if (simElem) state.sim.elementMatch = simElem.checked;
      if (simRegen) state.sim.regenSupport = simRegen.checked;
      renderSimulator(getEnrichedData());
    };

    [simBreaker, simBoss, simHorn, simInf, simTrait, simElem, simRegen].forEach((ctrl) => {
      if (ctrl) ctrl.addEventListener("change", updateSimState);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    renderAll();
  });
})();
