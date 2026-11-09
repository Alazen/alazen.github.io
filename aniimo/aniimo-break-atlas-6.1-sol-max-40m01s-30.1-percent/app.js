const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
const plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const elementPaths = {
  fire: '<path d="M12 3c2 4 6 5 6 10a6 6 0 0 1-12 0c0-3 1-5 3-7 0 3 1 4 2 4 2-2 2-5 1-7Z"/>',
  water: '<path d="M12 3s-7 8-7 12a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  wind: '<path d="M3 7h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 0-3-3M4 17h9a3 3 0 1 1-3 3"/>',
  grass: '<path d="M20 3C8 3 3 7 5 14c2 7 14 7 15-11Z"/><path d="M3 21 15 9"/>',
  rock: '<path d="m7 4 9-1 6 11-5 7-13-2-2-9 5-6ZM7 4l4 8-7 7m7-7 11 2m-11-2 6 9"/>',
  ice: '<path d="M12 2v20M3 7l18 10M3 17 21 7M9 4l3 3 3-3M9 20l3-3 3 3M3 11l4-1-1-4M21 13l-4 1 1 4M3 13l4 1-1 4M21 11l-4-1 1-4"/>',
  electric: '<path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z"/>',
  dark: '<path d="M20 15A8 8 0 0 1 9 4a9 9 0 1 0 11 11Z"/>'
};
const elementTokens = {
  fire:['#a55b36','#f9e4d5'], water:['#367c9c','#ddedf6'], wind:['#488b84','#dbefeb'], grass:['#528a5b','#e2efdc'],
  rock:['#8f795b','#eee6d9'], ice:['#3d8597','#e0f3f6'], electric:['#947622','#f5edce'], dark:['#736198','#eae4f1']
};
const elements = ['fire','water','wind','grass','rock','ice','electric','dark'];
const labels = {break:'BREAK',hp:'HP',atk:'ATK',mdef:'M.DEF',pdef:'P.DEF',regen:'REGEN',total:'TOTAL'};
const readableLabels = {break:'Base BREAK',hp:'HP',atk:'ATK',mdef:'Magic defense',pdef:'Physical defense',regen:'REGEN',total:'Total attributes'};
const statKeys = ['hp','break','atk','mdef','pdef','regen'];
const radarKeys = ['break','atk','pdef','regen','mdef','hp'];
const stages = {1:'Lumin',2:'Gamma',3:'Nova'};
const seriesColors = ['#197c83','#6c659f','#b36d42'];
const state = {search:'',element:'all',stage:'all',sort:'break',view:'cards',chart:'radar',expanded:false,slots:['048','004','']};
let creatures = [], byId = new Map(), spotlightId = '048', toastTimeout, searchTimeout;
const cap = text => text.charAt(0).toUpperCase() + text.slice(1);
const icon = element => `<svg viewBox="0 0 24 24" aria-hidden="true">${elementPaths[element] || elementPaths.wind}</svg>`;
const elementText = aniimo => aniimo.elements.map(cap).join(' / ');
const elementLabels = aniimo => `<span class="elements">${aniimo.elements.map(e => `<span class="element-label">${icon(e)}${cap(e)}</span>`).join('')}</span>`;
const valueOf = (aniimo, metric) => metric === 'total' ? aniimo.total : aniimo.stats[metric];
const ordered = metric => [...creatures].sort((a,b) => valueOf(b,metric)-valueOf(a,metric) || b.total-a.total || Number(a.id)-Number(b.id));
const selected = () => state.slots.filter(Boolean);
const selectionIndex = id => state.slots.indexOf(id);
const skin = aniimo => `--element-color:${elementTokens[aniimo.elements[0]][0]};--element-wash:${elementTokens[aniimo.elements[0]][1]}`;

function notify(message) {
  clearTimeout(toastTimeout);
  $('#toast').textContent = message;
  $('#toast').classList.add('is-visible');
  toastTimeout = setTimeout(() => $('#toast').classList.remove('is-visible'), 3300);
}

function readUrl() {
  const params = new URL(location.href).searchParams;
  state.search = (params.get('q') || '').slice(0,80);
  state.element = elements.includes(params.get('element')) ? params.get('element') : 'all';
  state.stage = ['1','2','3'].includes(params.get('stage')) ? params.get('stage') : 'all';
  state.sort = Object.hasOwn(labels,params.get('sort')) ? params.get('sort') : 'break';
  state.view = params.get('view') === 'chart' ? 'chart' : 'cards';
  state.chart = params.get('chart') === 'bars' ? 'bars' : 'radar';
  const ids = params.has('compare') ? [...new Set((params.get('compare') || '').split(',').filter(id => byId.has(id)))].slice(0,3) : ['048','004'];
  state.slots = [...ids,...Array(3-ids.length).fill('')];
  state.expanded = false;
  $('#search').value = state.search;
  $('#stage').value = state.stage;
  $('#sort').value = state.sort;
}

function writeUrl() {
  const url = new URL(location.href);
  const entries = {q:state.search,element:state.element === 'all' ? '' : state.element,stage:state.stage === 'all' ? '' : state.stage,sort:state.sort === 'break' ? '' : state.sort,view:state.view === 'cards' ? '' : state.view,chart:state.chart === 'radar' ? '' : state.chart};
  for (const [key,value] of Object.entries(entries)) value ? url.searchParams.set(key,value) : url.searchParams.delete(key);
  const ids = selected();
  if (ids.join(',') === '048,004') url.searchParams.delete('compare');
  else url.searchParams.set('compare',ids.join(','));
  history.replaceState(null,'',url);
}

function renderElementFilters() {
  if (!$('#element-filters').children.length) {
    $('#element-filters').innerHTML = '<button class="element-chip" data-element="all">All elements</button>' + elements.map(e => `<button class="element-chip" data-element="${e}">${icon(e)}${cap(e)}</button>`).join('');
  }
  for (const button of $('#element-filters').querySelectorAll('[data-element]')) button.setAttribute('aria-pressed',String(button.dataset.element === state.element));
}

function card(aniimo, rank) {
  const active = selected().includes(aniimo.id);
  const value = valueOf(aniimo,state.sort);
  const maximum = state.sort === 'total' ? 600 : 150;
  return `<article class="creature-card ${active ? 'is-selected' : ''}" style="${skin(aniimo)}">
    <button class="creature-main" data-detail="${aniimo.id}" aria-label="View ${escapeHtml(aniimo.name)} stats">
      <div class="creature-art"><span class="card-rank">${String(rank).padStart(2,'0')}</span><span class="card-stage">${stages[aniimo.stage]}</span><img src="${aniimo.image}" width="512" height="840" alt="${escapeHtml(aniimo.name)}" loading="lazy" decoding="async"></div>
      <div class="card-info"><h3>${escapeHtml(aniimo.name)}</h3>${elementLabels(aniimo)}</div>
    </button>
    <div class="card-stat"><span>${state.sort === 'break' ? 'BASE BREAK' : labels[state.sort]}</span><strong>${value}</strong></div>
    <div class="stat-track" aria-hidden="true"><span style="width:${value/maximum*100}%"></span></div>
    <div class="card-footer"><span>${aniimo.total} total</span><button class="compare-toggle" data-compare="${aniimo.id}" aria-label="${active ? 'Remove' : 'Add'} ${escapeHtml(aniimo.name)} ${active ? 'from' : 'to'} comparison" aria-pressed="${active}">${active ? check : plus}${active ? 'Selected' : 'Compare'}</button></div>
  </article>`;
}

function chartRow(aniimo, rank) {
  const active = selected().includes(aniimo.id);
  const value = valueOf(aniimo,state.sort);
  const maximum = state.sort === 'total' ? 600 : 150;
  return `<div class="chart-row"><span class="row-number">${String(rank).padStart(2,'0')}</span><img class="row-picture" src="${aniimo.image}" width="36" height="43" alt="" loading="lazy"><button class="row-name" data-detail="${aniimo.id}" aria-label="View ${escapeHtml(aniimo.name)} stats">${escapeHtml(aniimo.name)}<span>${elementText(aniimo)} · ${stages[aniimo.stage]}</span></button><div class="row-bar" role="img" aria-label="${escapeHtml(aniimo.name)} ${readableLabels[state.sort]} ${value} on a scale from 0 to ${maximum}"><span style="width:${value/maximum*100}%"></span></div><span class="row-value">${value}</span><button class="row-compare" data-compare="${aniimo.id}" aria-label="${active ? 'Remove' : 'Add'} ${escapeHtml(aniimo.name)} ${active ? 'from' : 'to'} comparison" aria-pressed="${active}">${active ? check : plus}</button></div>`;
}

function renderRankings() {
  const all = ordered(state.sort);
  const ranks = new Map(all.map((a,i) => [a.id,i+1]));
  const query = state.search.trim().toLowerCase();
  const filtered = all.filter(a => (!query || a.name.toLowerCase().includes(query) || a.id.includes(query)) && (state.element === 'all' || a.elements.includes(state.element)) && (state.stage === 'all' || String(a.stage) === state.stage));
  const limit = state.view === 'chart' ? 10 : 8;
  const visible = state.expanded ? filtered : filtered.slice(0,limit);
  const result = $('#rank-results');
  result.className = state.view === 'cards' ? 'creature-grid' : 'rank-chart';
  result.setAttribute('aria-label',`Aniimo ranked by ${readableLabels[state.sort]}`);
  result.innerHTML = visible.map(a => state.view === 'cards' ? card(a,ranks.get(a.id)) : chartRow(a,ranks.get(a.id))).join('');
  result.hidden = filtered.length === 0;
  $('#empty-state').hidden = filtered.length > 0;
  $('#result-count').textContent = filtered.length === 0 ? '0 Aniimo found' : `Showing ${visible.length} of ${filtered.length} Aniimo`;
  $('#ranking-context').textContent = state.sort === 'total' ? 'Highest total attributes first. Ties use Aniilog number.' : `Highest ${readableLabels[state.sort]} first. Ties use total attributes, then Aniilog number.`;
  const more = $('#show-more');
  more.hidden = filtered.length <= limit;
  more.setAttribute('aria-expanded',String(state.expanded));
  more.innerHTML = `${state.expanded ? 'Show fewer Aniimo' : `Show all ${filtered.length} Aniimo`}<svg viewBox="0 0 24 24" aria-hidden="true" style="transform:${state.expanded ? 'rotate(180deg)' : 'none'}"><path d="m6 9 6 6 6-6"/></svg>`;
  for (const type of ['cards','chart']) {
    $(`#view-${type}`).classList.toggle('is-active',state.view === type);
    $(`#view-${type}`).setAttribute('aria-pressed',String(state.view === type));
  }
  renderElementFilters();
}

function renderSpotlight() {
  const top = ordered('break').slice(0,3);
  const aniimo = byId.get(spotlightId);
  $('#hero-image').src = aniimo.image;
  $('#hero-image').alt = `${aniimo.name}, a ${aniimo.elements.join(' and ')} Aniimo`;
  $('#hero-name').textContent = aniimo.name;
  $('#hero-break').textContent = aniimo.stats.break;
  $('#hero-rank').textContent = String(top.findIndex(a => a.id === aniimo.id)+1).padStart(2,'0');
  $('#hero-element').innerHTML = icon(aniimo.elements[0]) + elementText(aniimo);
  $('#hero-creature').setAttribute('aria-label',`View ${aniimo.name} stats`);
  $('#spotlight-switcher').innerHTML = top.map(a => `<button data-spotlight="${a.id}" aria-label="Spotlight ${escapeHtml(a.name)}" aria-pressed="${a.id === spotlightId}"><img src="${a.image}" width="512" height="840" alt=""></button>`).join('');
}

function toggleComparison(id) {
  const restoreFocus = document.activeElement?.closest('#rank-results [data-compare]');
  const index = selectionIndex(id);
  if (index >= 0) {
    state.slots[index] = '';
    notify(`${byId.get(id).name} removed from your comparison.`);
  } else {
    const empty = state.slots.indexOf('');
    if (empty < 0) { notify('Your line-up is full. Remove one friend to compare another.'); return; }
    state.slots[empty] = id;
    notify(`${byId.get(id).name} added to your comparison.`);
  }
  writeUrl();
  renderRankings();
  renderComparison();
  if (restoreFocus) $(`#rank-results [data-compare="${id}"]`)?.focus({preventScroll:true});
  const detailButton = $('#dialog-content [data-compare]');
  if (detailButton) {
    const active = selected().includes(detailButton.dataset.compare);
    detailButton.setAttribute('aria-pressed',String(active));
    detailButton.innerHTML = (active ? check : plus) + (active ? 'Remove from comparison' : 'Add to comparison');
  }
}

function slotOptions(id) {
  return `<option value="">Choose an Aniimo...</option>` + ordered('break').map(a => `<option value="${a.id}" ${a.id === id ? 'selected' : ''} ${a.id !== id && selected().includes(a.id) ? 'disabled' : ''}>${escapeHtml(a.name)} · ${a.stats.break} BREAK</option>`).join('');
}

function radar(entities) {
  const cx=205, cy=157, r=108;
  const point = (i,value=150,radius=r) => {const a=(i*60-90)*Math.PI/180;return [cx+Math.cos(a)*radius*value/150,cy+Math.sin(a)*radius*value/150];};
  const polygon = factor => radarKeys.map((_,i) => point(i,factor).join(',')).join(' ');
  const grid = [30,60,90,120,150].map(value => `<polygon class="radar-grid" points="${polygon(value)}"/><text x="${cx+5}" y="${cy-r*value/150-2}" style="font-size:8px;fill:#596471">${value}</text>`).join('');
  const axes = radarKeys.map((key,i) => {const [x,y]=point(i);const [lx,ly]=point(i,150,r+24);return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/><text class="radar-label" x="${lx}" y="${ly+4}" text-anchor="${Math.abs(lx-cx)<2 ? 'middle' : lx>cx ? 'start' : 'end'}">${labels[key]}</text>`;}).join('');
  const plots = entities.map(({aniimo,index}) => {
    const points = radarKeys.map((key,i) => point(i,aniimo.stats[key]));
    const markers = points.map(([x,y],i) => {
      const label = `${aniimo.name} · ${labels[radarKeys[i]]} ${aniimo.stats[radarKeys[i]]}`;
      const shape = index === 0 ? `<circle cx="${x}" cy="${y}" r="3.5"/>` : index === 1 ? `<rect x="${x-3}" y="${y-3}" width="6" height="6" transform="rotate(45 ${x} ${y})"/>` : `<rect x="${x-3}" y="${y-3}" width="6" height="6"/>`;
      return `<g tabindex="0" role="img" class="radar-point" data-point="${escapeHtml(label)}" aria-label="${escapeHtml(label)}" fill="${seriesColors[index]}" stroke="#fff" stroke-width="1"><title>${escapeHtml(label)}</title>${shape}</g>`;
    }).join('');
    return `<polygon class="radar-series" points="${points.map(p=>p.join(',')).join(' ')}" fill="${seriesColors[index]}" stroke="${seriesColors[index]}" ${index ? `stroke-dasharray="${index === 1 ? '6 4' : '2 4'}"` : ''}/>${markers}`;
  }).join('');
  return `<div><svg class="radar-svg" viewBox="0 0 410 310" role="group" aria-labelledby="radar-title radar-desc"><title id="radar-title">Base attribute comparison</title><desc id="radar-desc">Six axes, each from zero to 150. ${entities.map(({aniimo})=>aniimo.name).join(', ')}. Exact values appear in the table below. Each point can be focused to read its value.</desc>${grid}${axes}${plots}</svg><p class="point-readout" id="point-readout">Hover or focus a point to see its stat.</p></div>`;
}

function groupedBars(entities) {
  return `<div class="compare-bars">${statKeys.map(key => `<div class="bar-attribute"><strong>${labels[key]}</strong>${entities.map(({aniimo,index}) => `<div class="attribute-series" role="img" aria-label="${escapeHtml(aniimo.name)} ${labels[key]} ${aniimo.stats[key]}" title="${escapeHtml(aniimo.name)} · ${labels[key]} ${aniimo.stats[key]}" style="--series-color:${seriesColors[index]}"><div><i style="width:${aniimo.stats[key]/150*100}%"></i></div><span>${aniimo.stats[key]}</span></div>`).join('')}</div>`).join('')}</div>`;
}

function renderComparison() {
  const entities = state.slots.map((id,index) => id ? {aniimo:byId.get(id),index} : null).filter(Boolean);
  $('#nav-count').textContent = entities.length;
  $('#comparison-slots').innerHTML = state.slots.map((id,index) => {
    const aniimo = byId.get(id);
    return `<div class="pick-slot ${aniimo ? '' : 'empty'}" style="--series-color:${seriesColors[index]}"><div class="pick-avatar ${aniimo ? '' : 'empty'}">${aniimo ? `<img src="${aniimo.image}" width="512" height="840" alt=""><span>${index+1}</span>` : plus}</div><div><label for="compare-slot-${index}">FRIEND ${index+1}</label><select id="compare-slot-${index}" data-slot="${index}" aria-label="Comparison friend ${index+1}">${slotOptions(id)}</select></div></div>`;
  }).join('');
  $('#clear-comparison').disabled = entities.length === 0;
  $('#share-comparison').disabled = entities.length === 0;
  $('#comparison-legend').innerHTML = entities.map(({aniimo,index}) => `<span class="legend-item" style="--series-color:${seriesColors[index]}"><span class="legend-line" style="border-top-style:${index === 1 ? 'dashed' : index === 2 ? 'dotted' : 'solid'}" aria-hidden="true"></span>${escapeHtml(aniimo.name)}</span>`).join('');
  $('#comparison-chart').innerHTML = entities.length ? (state.chart === 'radar' ? radar(entities) : groupedBars(entities)) : `<div class="chart-empty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5v8l-9 5-9-5V8l9-5ZM12 3v18M3 8l9 5 9-5"/></svg><strong>Every adventure starts with a friend.</strong><p>Choose an Aniimo to explore its strengths.</p></div>`;
  $('.chart-scale').hidden = !entities.length;
  for (const type of ['radar','bars']) {
    $(`#chart-${type}`).classList.toggle('is-active',state.chart === type);
    $(`#chart-${type}`).setAttribute('aria-pressed',String(state.chart === type));
  }
  if (entities.length) {
    const bestBreak = Math.max(...entities.map(({aniimo})=>aniimo.stats.break));
    const leaders = entities.filter(({aniimo})=>aniimo.stats.break === bestBreak).map(({aniimo})=>aniimo.name);
    $('#comparison-summary').textContent = `${leaders.join(' and ')} ${leaders.length === 1 ? 'has' : 'share'} the highest selected BREAK at ${bestBreak}. ${entities.length === 1 ? 'Add another friend to see the differences.' : 'Compare the other attributes to find your fit.'}`;
    $('#comparison-table').innerHTML = `<table class="stats-table"><caption class="sr-only">Official base stats for the selected Aniimo</caption><thead><tr><th scope="col">Attribute</th>${entities.map(({aniimo})=>`<th scope="col">${escapeHtml(aniimo.name)}</th>`).join('')}</tr></thead><tbody>${[...statKeys,'total'].map(key => {
      const highest = Math.max(...entities.map(({aniimo})=>valueOf(aniimo,key)));
      return `<tr><th scope="row">${key === 'total' ? 'Total' : labels[key]}</th>${entities.map(({aniimo})=>`<td class="${valueOf(aniimo,key) === highest ? 'best' : ''}">${valueOf(aniimo,key)}${valueOf(aniimo,key) === highest ? '<span aria-label="highest selected value">TOP</span>' : ''}</td>`).join('')}</tr>`;
    }).join('')}</tbody></table>`;
  } else {
    $('#comparison-summary').textContent = '';
    $('#comparison-table').innerHTML = '<p class="table-empty">Choose at least one Aniimo to see its base stats.</p>';
  }
}

function openDetails(id) {
  const aniimo = byId.get(id);
  if (!aniimo) return;
  const active = selected().includes(id);
  $('#dialog-content').innerHTML = `<div class="detail-layout" style="${skin(aniimo)}"><div class="detail-art"><img src="${aniimo.image}" width="512" height="840" alt="${escapeHtml(aniimo.name)}"><span class="detail-stage">${stages[aniimo.stage]} stage · Basic Form</span></div><div class="detail-info"><p class="detail-number">ANIILOG NO. ${aniimo.id}</p><h2 id="dialog-name">${escapeHtml(aniimo.name)}</h2>${elementLabels(aniimo)}<div class="detail-stat-list">${statKeys.map(key => `<div class="detail-stat"><span>${labels[key]}</span><div class="stat-track" aria-hidden="true"><span style="width:${aniimo.stats[key]/150*100}%"></span></div><strong>${aniimo.stats[key]}</strong></div>`).join('')}</div><div class="detail-total"><span>Total attributes</span><strong>${aniimo.total}</strong></div><button class="button button-primary" data-compare="${id}" aria-pressed="${active}">${active ? check : plus}${active ? 'Remove from comparison' : 'Add to comparison'}</button><a class="detail-source" href="${aniimo.source}" target="_blank" rel="noopener noreferrer">Read ${escapeHtml(aniimo.name)}'s official entry ${arrow}</a><p class="detail-footnote">Official base stats · Checked 12 Oct 2026</p></div></div>`;
  $('#creature-dialog').showModal();
  document.body.style.overflow = 'hidden';
}

function resetFilters() {
  state.search=''; state.element='all'; state.stage='all'; state.sort='break'; state.expanded=false;
  $('#search').value=''; $('#stage').value='all'; $('#sort').value='break';
  writeUrl(); renderRankings();
  $('#search').focus({preventScroll:true});
}

function scrollToSharedSection() {
  requestAnimationFrame(() => {
    const section=location.hash.slice(1);
    if (['home','rankings','compare','method'].includes(section)) document.getElementById(section)?.scrollIntoView({block:'start',behavior:'instant'});
  });
}

function bindEvents() {
  $('#search').addEventListener('input',event => {
    clearTimeout(searchTimeout);
    searchTimeout=setTimeout(() => {state.search=event.target.value;state.expanded=false;writeUrl();renderRankings();},120);
  });
  for (const key of ['stage','sort']) $(`#${key}`).addEventListener('change',event=>{state[key]=event.target.value;state.expanded=false;writeUrl();renderRankings();});
  $('#element-filters').addEventListener('click',event=>{const button=event.target.closest('[data-element]');if(button){state.element=button.dataset.element;state.expanded=false;writeUrl();renderRankings();}});
  $('#rank-results').addEventListener('click',event=>{const detail=event.target.closest('[data-detail]');const compare=event.target.closest('[data-compare]');if(detail)openDetails(detail.dataset.detail);if(compare)toggleComparison(compare.dataset.compare);});
  $('#dialog-content').addEventListener('click',event=>{const compare=event.target.closest('[data-compare]');if(compare)toggleComparison(compare.dataset.compare);});
  for (const view of ['cards','chart']) $(`#view-${view}`).addEventListener('click',()=>{state.view=view;state.expanded=false;writeUrl();renderRankings();});
  for (const chart of ['radar','bars']) $(`#chart-${chart}`).addEventListener('click',()=>{state.chart=chart;writeUrl();renderComparison();});
  $('#show-more').addEventListener('click',()=>{state.expanded=!state.expanded;renderRankings();});
  $('#reset-filters').addEventListener('click',resetFilters);
  $('#hero-creature').addEventListener('click',()=>openDetails(spotlightId));
  $('#spotlight-switcher').addEventListener('click',event=>{const button=event.target.closest('[data-spotlight]');if(button){spotlightId=button.dataset.spotlight;renderSpotlight();const next=$(`[data-spotlight="${spotlightId}"]`);next.focus({preventScroll:true});}});
  $('#comparison-slots').addEventListener('change',event=>{const control=event.target.closest('[data-slot]');if(control){const value=control.value;if(value && selected().includes(value) && state.slots[Number(control.dataset.slot)] !== value)return;state.slots[Number(control.dataset.slot)]=value;writeUrl();renderRankings();renderComparison();$(`#compare-slot-${control.dataset.slot}`).focus({preventScroll:true});}});
  $('#clear-comparison').addEventListener('click',()=>{state.slots=['','',''];writeUrl();renderRankings();renderComparison();$('#compare-slot-0').focus({preventScroll:true});notify('Your comparison is cleared. Choose your next friends.');});
  $('#comparison-chart').addEventListener('pointerover',event=>{const point=event.target.closest('[data-point]');if(point && $('#point-readout'))$('#point-readout').textContent=point.dataset.point;});
  $('#comparison-chart').addEventListener('focusin',event=>{const point=event.target.closest('[data-point]');if(point && $('#point-readout'))$('#point-readout').textContent=point.dataset.point;});
  $('#close-dialog').addEventListener('click',()=>$('#creature-dialog').close());
  $('#creature-dialog').addEventListener('close',()=>{document.body.style.overflow='';});
  $('#creature-dialog').addEventListener('click',event=>{if(event.target === $('#creature-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)event.target.close();}});
  $('#share-comparison').addEventListener('click',async()=>{
    writeUrl(); const url=new URL(location.href);url.hash='compare';
    try {await navigator.clipboard.writeText(url.href);notify('Comparison link copied. Take your line-up with you.');}
    catch {history.replaceState(null,'',url);notify('Your link is ready in the address bar. Copy it from there.');}
  });
  addEventListener('popstate',()=>{readUrl();renderRankings();renderComparison();scrollToSharedSection();});
}

async function start() {
  try {
    const response=await fetch('data/aniimo.json');
    if(!response.ok)throw new Error('Data unavailable');
    const data=await response.json();
    if(!Array.isArray(data.creatures) || data.creatures.length !== 26)throw new Error('Invalid roster');
    creatures=data.creatures;
    for(const a of creatures){if(statKeys.some(key=>!Number.isFinite(a.stats[key])) || statKeys.reduce((sum,key)=>sum+a.stats[key],0) !== a.total)throw new Error('Invalid stats');}
    byId=new Map(creatures.map(a=>[a.id,a]));
    readUrl();renderSpotlight();renderRankings();renderComparison();bindEvents();scrollToSharedSection();
  } catch {
    $('#result-count').textContent='The index could not load.';
    $('#rank-results').className='error-message';
    $('#rank-results').innerHTML='<h3>Our field guide needs another moment.</h3><p>Reload to try again, or explore the official wiki below.</p><button id="retry-data">Reload guide</button>';
    $('#retry-data').addEventListener('click',()=>location.reload());
  }
}
start();
