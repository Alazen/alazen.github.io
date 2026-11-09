const aniimo = [
  { name: 'Inferlupa', tier: 'S', note: 'Stacks a debuff that makes the enemy easier for the whole team to break, alongside a high base BREAK stat.' },
  { name: 'Geoclaw', tier: 'S', note: 'Builds ice stacks through its own attacks and gains stronger BREAK once those stacks are in place.' },
  { name: 'Wavwal', tier: 'S', note: 'Trades health for a powerful BREAK bonus, with enhanced attacks that help it recover and shield the team.' },
  { name: 'Tubster', tier: 'S', note: 'Creates its own shield to boost BREAK, while grouping enemies and offering useful team protection.' },
  { name: 'Minespine', tier: 'A', note: 'Pairs a high BREAK stat with an underground bonus and a dependable multi-hit skill.' },
  { name: 'Helgon', tier: 'A', note: 'Rewards close-range play with BREAK bonuses when hit and after a well-timed counter.' },
  { name: 'Panpanta', tier: 'A', note: 'Can stack two BREAK bonuses for a high ceiling, but needs a particular teammate and setup.' },
  { name: 'Rookey', tier: 'A', note: 'Makes enemies take more BREAK damage and finishes its three-hit combo with a stun.' },
  { name: 'Pomawk', tier: 'B', note: 'Has a strong base BREAK stat and a timing-based skill that rewards precise execution.' },
  { name: 'Blazen', tier: 'B', note: 'Uses critical hits to enter an overcharged state that reduces skill costs and boosts critical chance.' },
  { name: 'Tuckin', tier: 'B', note: 'Improves the BREAK potential of its summoned minions, so its payoff depends on them staying active.' },
  { name: 'Shrubclaw', tier: 'C', note: 'Builds stacks before unlocking its BREAK bonus, making its setup slower than higher-tier picks.' },
  { name: 'Magmarex', tier: 'D', note: 'Has a respectable base BREAK stat but lacks a dedicated bonus to speed up breaking.' }
];
const list = document.querySelector('#tier-list');
const detail = document.querySelector('#detail');
const count = document.querySelector('#count');
const search = document.querySelector('#search');
let selected = 'Inferlupa';
let tier = 'All';
function imagePath(name) { return `assets/${name.toLowerCase()}.webp`; }
function showDetail(item) {
  selected = item.name;
  detail.innerHTML = `<div class="detail-label">COMPANION SPOTLIGHT <span>✦</span></div><div class="detail-image"><img src="${imagePath(item.name)}" alt="${item.name}"></div><div class="detail-heading"><h3>${item.name}</h3><span class="pill">${item.tier} TIER</span></div><div class="detail-type">BREAK SPECIALIST</div><hr><h4>WHY THEY STAND OUT</h4><p>${item.note}</p><a href="https://mobalytics.gg/gamebase/guides/aniimo-break-tier-list" target="_blank" rel="noreferrer">View source notes ↗</a>`;
  document.querySelectorAll('.card').forEach(card => { const isSelected = card.dataset.name === selected; card.classList.toggle('selected', isSelected); card.setAttribute('aria-pressed', String(isSelected)); });
}
function render() {
  const query = search.value.trim().toLowerCase();
  const visible = aniimo.filter(item => (tier === 'All' || item.tier === tier) && item.name.toLowerCase().includes(query));
  count.textContent = `${visible.length} COMPANION${visible.length === 1 ? '' : 'S'}`;
  list.innerHTML = '';
  document.querySelector('#empty').hidden = visible.length !== 0;
  for (const group of ['S','A','B','C','D']) {
    const items = visible.filter(item => item.tier === group);
    if (!items.length) continue;
    const row = document.createElement('div');
    row.className = 'tier-row';
    row.innerHTML = `<div class="tier-badge tier-${group}">${group}<small>TIER</small></div><div class="cards">${items.map(item => `<button class="card${item.name === selected ? ' selected' : ''}" data-name="${item.name}" aria-pressed="${item.name === selected}"><img src="${imagePath(item.name)}" alt="" loading="lazy"><span>${item.name}</span></button>`).join('')}</div>`;
    list.appendChild(row);
  }
  if (visible.length) showDetail(visible.find(item => item.name === selected) || visible[0]);
  else detail.innerHTML = '<div class="detail-label">COMPANION SPOTLIGHT</div><p>Try a different search or tier to find a companion.</p>';
}
document.querySelectorAll('.tabs button').forEach(button => button.addEventListener('click', () => {
  tier = button.dataset.tier;
  document.querySelectorAll('.tabs button').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
  render();
}));
list.addEventListener('click', event => { const card = event.target.closest('.card'); if (card) showDetail(aniimo.find(item => item.name === card.dataset.name)); });
search.addEventListener('input', render);
showDetail(aniimo[0]);
render();
