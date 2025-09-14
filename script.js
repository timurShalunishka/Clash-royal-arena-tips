const rawNames = [
"Адская гончая","Армия скелетов","Банда гоблинов","Бандитка","Берсеркша","Боевой таран","Бочка со скелетами","Валькирия",
"Варвары","Ведьма","Ведьмина бабушка","Всадник на кабане","Всадница на баране","Вышибала","Гигант","Гигантский скелет",
"Главная бандитка","Гоблин с дротиками","Гоблин-гигант","Гоблин-подрывник","Гоблинштейн","Гоблины","Гоблины-копейщики","Голем",
"Громовержец","Дракончик","Дровосек","Дух исцеления","Золотой рыцарь","Императрица духов","Колдун","Королева лучниц",
"Королевские кабаны","Королевские рекруты","Королевский гигант","Королевский призрак","Король скелетов","Костяные драконы",
"Ледяной голем","Ледяной дух","Ледяной колдун","Ледяной суперголем","Летучие мыши","Летучка","Лучницы","Магический лучник",
"Маленький Принц","Мегаминьон","Мегарыцарь","Мини-генераторы","Мини-П.Е.К.К.А.","Миньоны","Монах","Мушкетёр","Ночная ведьма",
"Огненная лучница","Огненный дух","Орда миньонов","Охотник","П.Е.К.К.А.","Палач","Печь","Пламенный дракон","Повозка с пушкой",
"Подрывник","Принц","Принцесса","Разбойники","Руническая гигантша","Рыбак","Рыцарь","Санта на кабане","Скелеты","Спарки",
"Стенобои","Стражи","Супер-адская гончая","Суперведьма","Супермагический лучник","Супермини-П.Е.К.К.А.","Тёмный принц",
"Терри","Тесла","Три мушкетёра","Трио колдунов","Феникс","Целительница-воин","Шар","Шахтёр","Шустрый шахтёр","Электрический дух",
"Электрогигант","Электродракон","Эликсирный голем","Элитные варвары"
];

const names = Array.from(new Set(rawNames));
const poolEl = document.getElementById('pool');
const slotsEl = document.getElementById('slots');
const deckCountEl = document.getElementById('deckCount');
const searchInput = document.getElementById('searchInput');

const MAX_DECK = 8;
let poolItems = [];
let slots = Array.from({length: MAX_DECK}, ()=>({card:null}));

function createSlot(idx){
  const s = document.createElement('div');
  s.className='slot';
  s.dataset.slot=idx;
  s.addEventListener('dragover',ev=>{ev.preventDefault();s.classList.add('dragover');});
  s.addEventListener('dragleave',ev=>s.classList.remove('dragover'));
  s.addEventListener('drop',ev=>{
    ev.preventDefault();
    s.classList.remove('dragover');
    const pid = ev.dataTransfer.getData('text/plain');
    if(!pid) return;
    const item = poolItems.find(x=>x.id===pid);
    if(!item) return;
    if(slots[idx].card) return;
    addCardToSlot(item, idx);
  });
  return s;
}

function buildSlots(){for(let i=0;i<MAX_DECK;i++){slotsEl.appendChild(createSlot(i));}}

function makePoolItem(name,id){
  const card=document.createElement('div');
  card.className='card';
  card.draggable=true;

  const imgHtml=`<div style="width:36px;height:36px;border-radius:6px;background:rgba(255,255,255,0.02);display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.03);font-weight:700;">${name[0]||'?'}</div>`;

  card.innerHTML=`<div style="display:flex;align-items:center;gap:8px;">${imgHtml}<div style="display:flex;flex-direction:column;"><div class="name">${name}</div><div class="sub">Эл: —</div></div></div>`;

  card.addEventListener('dragstart',ev=>{if(card.classList.contains('disabled')){ev.preventDefault();return;} ev.dataTransfer.setData('text/plain',id);card.classList.add('dragging');});
  card.addEventListener('dragend',()=>card.classList.remove('dragging'));
  return card;
}

function buildPool(){
  poolEl.innerHTML='';
  poolItems=[];
  names.forEach((nm,idx)=>{
    const id='p'+idx;
    const el=makePoolItem(nm,id);
    poolEl.appendChild(el);
    poolItems.push({id,name:nm,el,disabled:false});
  });
}

function addCardToSlot(item,slotIdx){
  if(getDeckCount()>=MAX_DECK) return;
  const card=document.createElement('div');
  card.className='card deck-card';
  const imgHtml=`<div style="width:60px;height:60px;border-radius:10px;background:rgba(255,255,255,0.02);display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.03);font-weight:700;margin-bottom:4px;">${item.name[0]||'?'}</div>`;
  card.innerHTML=`${imgHtml}<div class="name">${item.name}</div><div class="sub">Нажми ЛКМ чтобы удалить</div>`;
  card.addEventListener('click',ev=>{if(ev.button!==0) return; removeCardFromSlot(slotIdx);});
  const slotEl=slotsEl.children[slotIdx];
  slotEl.innerHTML=''; slotEl.appendChild(card);
  slots[slotIdx].card={id:item.id,name:item.name,el:card};
  item.el.classList.add('disabled'); item.el.draggable=false; item.disabled=true;
  updateDeckCount();
}

function removeCardFromSlot(slotIdx){
  const info=slots[slotIdx].card;
  if(!info) return;
  const poolItem=poolItems.find(x=>x.id===info.id);
  if(poolItem){poolItem.el.classList.remove('disabled'); poolItem.el.draggable=true; poolItem.disabled=false;}
  slotsEl.children[slotIdx].innerHTML=''; slots[slotIdx].card=null;
  updateDeckCount();
}

function getDeckCount(){return slots.filter(s=>s.card).length;}
function updateDeckCount(){deckCountEl.textContent=getDeckCount();}

document.getElementById('clearDeck').addEventListener('click',()=>{for(let i=0;i<MAX_DECK;i++){if(slots[i].card) removeCardFromSlot(i);}});
document.getElementById('shufflePool').addEventListener('click',()=>{for(let i=0;i<MAX_DECK;i++){if(slots[i].card) removeCardFromSlot(i);}});

searchInput.addEventListener('input',ev=>{
  const q=ev.target.value.trim().toLowerCase();
  poolItems.forEach(item=>{item.el.style.display=item.name.toLowerCase().includes(q)?'':'none';});
});

buildSlots();
buildPool();
updateDeckCount();