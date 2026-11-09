const aniimo = [
  {name:'Tuckin',element:'Grass',score:154.6,noUlt:104.1,stage:'Gamma',skills:'Haunting Choir + Off-Key Shock Wave',ultimate:'Breaking Roar',note:'Prank Master adds a ×1.2 multiplier to the score.'},
  {name:'Rookey',element:'Dark',score:145.3,noUlt:83.7,stage:'Gamma',skills:'Guardbreak Smash + Ballistic Guard',ultimate:'Heavy Slam',note:'Guardbreak Resonance adds BREAK +100 in the calculation.'},
  {name:'Pomawk',element:'Grass',score:144.8,noUlt:96.8,stage:'Gamma',skills:'Frost Strike + Rhythm Combo',ultimate:'Sonic Boom'},
  {name:'Inferlupa',element:'Fire',score:141.3,noUlt:87.9,stage:'Nova',skills:'Crossfire + Blazing Wolf Assault',ultimate:'Wolfpack Onslaught'},
  {name:'Shrubclaw',element:'Earth',score:135.2,noUlt:89.3,stage:'Gamma',skills:'Leaf Slash + Verdant Beam',ultimate:'Quake Impact',note:'With Stealth active, the conditional score is 175.7.'},
  {name:'Squashel',element:'Fire',score:130.8,noUlt:73.3,stage:'Gamma',skills:'Pinecone Bomb + Blazing Fist Barrage',ultimate:'Blazing Rush'},
  {name:'Helgon',element:'Wind',score:127.2,noUlt:81.7,stage:'Nova',skills:'Overcharged Claw Strike + Wind Tackle',ultimate:'Skyfall'},
  {name:'Geoclaw',element:'Ice',score:126.0,noUlt:80.6,stage:'Gamma',skills:'Icy Gravel Dance + Ice Spikes',ultimate:'Freezing Claws',note:'With Frostbite Sunder active, the conditional score is 170.1.'},
  {name:'Minespine',element:'Earth',score:121.6,noUlt:74.7,stage:'Nova',skills:'Earth Spikes + Stone Shell',ultimate:'Meteor Shower',note:'With Earth Affinity active, the conditional score is 145.9.'},
  {name:'Panpanta',element:'Water',score:120.0,noUlt:75.2,stage:'Nova',skills:'Hydro Roll + Water Cannon',ultimate:'Home Run',note:'With Hydro Roll’s condition met, the conditional score is 156.1.'},
  {name:'Magmarex',element:'Fire',score:112.4,noUlt:75.3,stage:'Nova',skills:'Magma Surge + Lava Punch',ultimate:'Burning Sun'},
  {name:'Blazen',element:'Lightning',score:91.4,noUlt:55.6,stage:'Gamma',skills:'Electrified Impact + Lightning Cross',ultimate:'Lightning Flash'},
  {name:'Tubster',element:'Wind',score:79.3,noUlt:79.3,stage:'Nova',skills:'Water Tornado + Resting Whirlwind',ultimate:'Truce',note:'With Victory Concerto active, the conditional score is 111.0.'}
].map((item,index)=>({...item,rank:index+1,tier:index<5?'S+':'S'}));
const list=document.querySelector('#ranking-list');
const detail=document.querySelector('#detail');
const empty=document.querySelector('#empty');
const search=document.querySelector('#search');
const filters=[...document.querySelectorAll('.filter')];
let selected=aniimo[0], filter='All';
function showDetail(item){
 selected=item;
 detail.innerHTML=`<div class="detail-head"><span>COMPANION SPOTLIGHT / ${String(item.rank).padStart(2,'0')}</span><span class="tier">${item.tier}</span></div><div class="detail-art"><img src="assets/${item.name}.webp" alt="${item.name}"></div><div class="detail-title"><div><h3>${item.name}</h3><p>${item.element} · ${item.stage} stage</p></div><div class="detail-score"><strong>${item.score.toFixed(1)}</strong><span>BREAK SCORE</span></div></div><div class="detail-copy"><h4>THE LOADOUT</h4><p>${item.skills}<br>Ultimate: ${item.ultimate}</p><p class="condition">Without ultimate: ${item.noUlt.toFixed(1)}${item.note ? ` · ${item.note}` : ''}</p></div>`;
 renderList();
}
function renderList(){
 const term=search.value.trim().toLowerCase();
 const shown=aniimo.filter(item=>(filter==='All'||(filter==='Other'?!['Grass','Fire','Earth','Wind'].includes(item.element):item.element===filter)) && item.name.toLowerCase().includes(term));
 list.innerHTML=shown.map(item=>`<button class="rank-row ${item.name===selected.name?'selected':''}" data-name="${item.name}" aria-pressed="${item.name===selected.name}"><span class="rank-num">${String(item.rank).padStart(2,'0')}</span><img class="portrait" src="assets/${item.name}.webp" alt=""><span><span class="name">${item.name}</span><span class="sub">${item.element} · ${item.tier} TIER</span></span><span class="bar" aria-hidden="true"><i style="width:${item.score/154.6*100}%"></i></span><span class="score">${item.score.toFixed(1)}</span></button>`).join('');
 empty.hidden=shown.length>0;
}
list.addEventListener('click',event=>{const row=event.target.closest('[data-name]');if(row) showDetail(aniimo.find(item=>item.name===row.dataset.name));});
filters.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;filters.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',active);});renderList();}));
search.addEventListener('input',renderList);
showDetail(selected);
