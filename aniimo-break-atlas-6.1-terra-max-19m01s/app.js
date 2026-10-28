const aniimo = [
  { id: 'inferlupa', name: 'Inferlupa', tier: 'S', elements: ['Fire', 'Dark'], breakStat: 108, hp: 95, description: 'A team-friendly breaker that can make an enemy easier for everyone to break. Its stacking debuff reaches up to 30%.', note: 'A strong pick when the whole team can take advantage of its debuff.' },
  { id: 'geoclaw', name: 'Geoclaw', tier: 'S', elements: ['Ice'], breakStat: 103, hp: 93, description: 'Builds Ice stacks through its own attacks, then gains a large BREAK boost when the stacks are in place.', note: 'Its setup is self-contained, so it does not need another Ice teammate to get going.' },
  { id: 'wavwal', name: 'Wavwal', tier: 'S', elements: ['Ice'], breakStat: null, hp: null, upcoming: true, description: 'A high-risk Ice breaker featured in the source guide. Its BREAK bonus is tied to fighting at low health.', note: 'Wavwal was expected with Whisperwake Isles on October 29, 2026. Its launch performance may change.' },
  { id: 'tubster', name: 'Tubster', tier: 'S', elements: ['Wind'], breakStat: 107, hp: 108, description: 'Shields itself to boost its BREAK effectiveness, while bringing useful protection and crowd control to the team.', note: 'A well-rounded choice when you want a breaker with defensive utility.' },
  { id: 'minespine', name: 'Minespine', tier: 'A', elements: ['Earth'], breakStat: 105, hp: 110, description: 'A sturdy Earth breaker that gains extra BREAK effectiveness underground and can avoid ranged attacks there.', note: 'Its reliable multi-hit skill makes it a straightforward pick.' },
  { id: 'helgon', name: 'Helgon', tier: 'A', elements: ['Wind'], breakStat: 102, hp: 104, description: 'Rewards close-range play with BREAK bonuses when attacked and after a well-timed counter.', note: 'Good timing brings out more of its potential.' },
  { id: 'panpanta', name: 'Panpanta', tier: 'A', elements: ['Water'], breakStat: 100, hp: 104, description: 'Can combine two BREAK bonuses through a specific teammate and a puddle-based setup.', note: 'A high-ceiling choice if you enjoy preparing a combo.' },
  { id: 'rookey', name: 'Rookey', tier: 'A', elements: ['Dark'], breakStat: 105, hp: 100, description: 'Applies a debuff that makes the enemy take more BREAK damage and follows up with a stunning combo.', note: 'Its debuff can help the rest of the team break the same target.' },
  { id: 'pomawk', name: 'Pomawk', tier: 'B', elements: ['Grass'], breakStat: 107, hp: 87, description: 'Pairs a high base BREAK stat with a timing-based skill that can improve BREAK damage and silence enemies.', note: 'Its timing matters, so practice helps make the most of it.' },
  { id: 'blazen', name: 'Blazen', tier: 'B', elements: ['Lightning'], breakStat: 104, hp: 100, description: 'Critical hits can trigger an overcharge state that reduces skill costs and raises critical chance.', note: 'Its kit favors a steady flow of skills over one large BREAK multiplier.' },
  { id: 'tuckin', name: 'Tuckin', tier: 'B', elements: ['Grass'], breakStat: 100, hp: 106, description: 'Summons Hummin and can improve their BREAK effectiveness, healing, and strength.', note: 'Its payoff depends on keeping the summons active.' },
  { id: 'shrubclaw', name: 'Shrubclaw', tier: 'C', elements: ['Earth', 'Grass'], breakStat: 104, hp: 95, description: 'Builds stacks before gaining a BREAK bonus, giving it a slower setup than the higher tiers.', note: 'The reward is useful when a fight gives it time to build stacks.' },
  { id: 'magmarex', name: 'Magmarex', tier: 'D', elements: ['Fire', 'Earth'], breakStat: 104, hp: 110, description: 'Has a solid base BREAK stat, but the source guide values its BREAK-specific kit below the other picks.', note: 'A useful reminder that base stats and overall tier placements measure different things.' }
];

const tierInfo = {
  S: { name: 'Top picks', color: '#e98591', background: '#fff0f1' },
  A: { name: 'Strong', color: '#dfac62', background: '#fff7e9' },
  B: { name: 'Reliable', color: '#75bda7', background: '#edf9f3' },
  C: { name: 'Situational', color: '#75a9d2', background: '#eef7fd' },
  D: { name: 'Niche', color: '#a593c9', background: '#f5f0fc' }
};
const elements = ['All', 'Fire', 'Water', 'Grass', 'Wind', 'Earth', 'Ice', 'Lightning', 'Dark'];
const state = { view: 'tier', element: 'All', query: '', selected: 'inferlupa' };
const board = document.querySelector('#ranking-board');
const detail = document.querySelector('#detail-panel');
const filterContainer = document.querySelector('#element-filters');
const search = document.querySelector('#search');

function colors(tier) {
  const info = tierInfo[tier];
  return `--tier-color:${info.color};--tier-bg:${info.background}`;
}

function matchingAniimo() {
  const query = state.query.trim().toLowerCase();
  return aniimo.filter(item => (state.element === 'All' || item.elements.includes(state.element)) && item.name.toLowerCase().includes(query));
}

function renderFilters() {
  filterContainer.innerHTML = elements.map(element => `<button type="button" class="element-filter ${state.element === element ? 'is-active' : ''}" data-element="${element}" aria-pressed="${state.element === element}">${element}</button>`).join('');
}

function tile(item) {
  const active = state.selected === item.id;
  return `<button type="button" class="creature-tile ${active ? 'is-selected' : ''}" data-select="${item.id}" aria-pressed="${active}" aria-label="${item.name}, ${item.tier} tier${item.upcoming ? ', upcoming' : ''}">
    ${item.upcoming ? '<span class="tile-upcoming">Upcoming</span>' : ''}
    <img class="tile-image" src="assets/${item.id}.webp" alt="">
    <span class="tile-name">${item.name}</span><span class="tile-type">${item.elements.join(' / ')}</span>
  </button>`;
}

function renderTierBoard(items) {
  return Object.entries(tierInfo).map(([tier, info]) => {
    const group = items.filter(item => item.tier === tier);
    if (!group.length) return '';
    return `<div class="tier-row" style="${colors(tier)}"><div class="tier-label"><span class="tier-letter">${tier}</span><span class="tier-name">${info.name}</span></div><div class="tier-creatures">${group.map(tile).join('')}</div></div>`;
  }).join('');
}

function renderStatBoard(items) {
  const ordered = [...items].sort((a, b) => (b.breakStat ?? -1) - (a.breakStat ?? -1) || aniimo.indexOf(a) - aniimo.indexOf(b));
  return `<div class="stat-list">${ordered.map((item, index) => `<button type="button" class="stat-row ${state.selected === item.id ? 'is-selected' : ''}" data-select="${item.id}" aria-pressed="${state.selected === item.id}" aria-label="${item.name}, ${item.breakStat === null ? 'base BREAK not listed' : `base BREAK ${item.breakStat}`}\u002c ${item.tier} tier">
    <span class="stat-rank">${item.breakStat === null ? '--' : String(ordered.findIndex(other => other.breakStat === item.breakStat) + 1).padStart(2, '0')}</span>
    <img src="assets/${item.id}.webp" alt="">
    <span class="stat-identity"><strong>${item.name}</strong><span>${item.upcoming ? 'Upcoming' : `${item.tier} tier`}</span></span>
    <span class="bar-track" aria-hidden="true"><span class="bar-fill" style="display:block;width:${item.breakStat === null ? 0 : Math.min(item.breakStat / 120 * 100, 100)}%"></span></span>
    <span class="stat-value">${item.breakStat === null ? '--' : item.breakStat}</span>
  </button>`).join('')}</div>`;
}

function renderDetail(item) {
  if (!item) {
    detail.innerHTML = '<div class="detail-topline">SELECTED ANIIMO</div><div class="empty-state"><strong>No Aniimo selected</strong>Change your filters to find a match.</div>';
    return;
  }
  const stat = (label, value) => `<div class="detail-stat"><div class="detail-stat-label"><span>${label}</span><strong>${value === null ? 'Not listed' : value}</strong></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${value === null ? 0 : Math.min(value / 120 * 100, 100)}%"></div></div></div>`;
  detail.innerHTML = `<div class="detail-topline">YOUR SELECTED ANIIMO</div>
    <div class="detail-art" style="${colors(item.tier)}"><span class="detail-tier">${item.tier} TIER</span>${item.upcoming ? '<span class="detail-badge">UPCOMING</span>' : ''}<img src="assets/${item.id}.webp" alt="${item.name}"></div>
    <div class="detail-name-line"><h3 class="detail-name">${item.name}</h3><span class="detail-role">BREAK</span></div>
    <div class="detail-elements">${item.elements.map(element => `<span class="element-chip">${element}</span>`).join('')}</div>
    <p class="detail-description">${item.description}</p><div class="detail-divider"></div>
    <div class="detail-stat-heading"><strong>Base stats</strong><span>Basic form / scale: 0 to 120</span></div>
    ${stat('BREAK', item.breakStat)}${stat('HP', item.hp)}
    <div class="detail-note"><strong>${item.upcoming ? 'Coming soon' : 'Good to know'}</strong>${item.note}</div>`;
}

function render() {
  const items = matchingAniimo();
  if (!items.some(item => item.id === state.selected)) state.selected = items[0]?.id ?? null;
  document.querySelector('#result-count').textContent = `${items.length} Aniimo`;
  document.querySelector('#board-title').textContent = state.view === 'tier' ? 'The tier list' : 'Base BREAK comparison';
  document.querySelector('#board-description').textContent = state.view === 'tier' ? 'Grouped by overall BREAK utility. Select an Aniimo to learn more.' : 'Basic-form stats, highest first. Bars use a 0 to 120 scale.';
  document.querySelectorAll('.view-button').forEach(button => {
    const active = button.dataset.view === state.view;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderFilters();
  if (items.length === 0) {
    board.innerHTML = '<div class="empty-state"><strong>No matches found.</strong>Try another name or element.<br><button type="button" data-clear>Clear filters</button></div>';
  } else {
    board.innerHTML = state.view === 'tier' ? renderTierBoard(items) : renderStatBoard(items);
  }
  renderDetail(items.find(item => item.id === state.selected));
}

document.querySelector('.view-control').addEventListener('click', event => {
  const button = event.target.closest('[data-view]');
  if (!button) return;
  state.view = button.dataset.view;
  render();
});
filterContainer.addEventListener('click', event => {
  const button = event.target.closest('[data-element]');
  if (!button) return;
  state.element = button.dataset.element;
  render();
  filterContainer.querySelector(`[data-element="${state.element}"]`)?.focus();
});
search.addEventListener('input', () => {
  state.query = search.value;
  render();
});
board.addEventListener('click', event => {
  const button = event.target.closest('[data-select]');
  if (button) {
    state.selected = button.dataset.select;
    render();
    if (window.matchMedia('(max-width: 760px)').matches) {
      detail.setAttribute('tabindex', '-1');
      detail.focus({ preventScroll: true });
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      detail.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    } else {
      board.querySelector(`[data-select="${state.selected}"]`)?.focus();
    }
  }
  if (event.target.closest('[data-clear]')) {
    state.element = 'All';
    state.query = '';
    search.value = '';
    render();
    search.focus();
  }
});

render();
