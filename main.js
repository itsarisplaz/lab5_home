import {houses,mapPlaces,money} from './data.js';
import {loadBookings,saveBookings,clearSavedBookings} from './storage.js';

const $ = selector => document.querySelector(selector);
const saved = loadBookings();
const state = {selectedId:null,guestsFilter:0,priceFilter:0,bookings:saved.bookings,busy:false};
const list = $('#house-list');
const markers = $('#map-markers');
const mapDialog = $('#map-dialog');
const guestsInput = $('#guests');
const nightsInput = $('#nights');
let activeMapItem = null;
let galleryIndex = 0;
let restoreMapFocus = null;
let skipMapFocusRestore = false;

function selectedHouse(){return houses.find(house=>house.id===state.selectedId) || null}
function isOccupied(house){return house.initiallyOccupied || state.bookings.some(booking=>booking.houseId===house.id)}
function visibleHouses(){return houses.filter(house=>(!state.guestsFilter || house.capacity>=state.guestsFilter)&&(!state.priceFilter || house.price<=state.priceFilter))}
function message(text){const el=$('#app-message');el.textContent=text;el.hidden=!text}
function status(house){return isOccupied(house)?'Занят':state.selectedId===house.id?'Выбран':'Свободен'}
function plural(number,one,few,many){const rest=number%100;if(rest>=11&&rest<=14)return many;const last=number%10;return last===1?one:last>=2&&last<=4?few:many}
function clearErrors(){for(const id of ['guests','nights']){const field=$('#'+id);field.removeAttribute('aria-invalid');$('#'+id+'-error').textContent=''}$('#form-error').textContent=''}
function focusChoice(id,origin){const selector=origin==='map'?'#map-markers':'#house-list';const button=document.querySelector(`${selector} [data-house-id="${id}"]`);button?.focus({preventScroll:true})}

function renderHouses(origin=null,focusId=null){
  const visible=visibleHouses();
  $('#result-count').textContent=`Показано ${visible.length} из ${houses.length}`;
  $('#no-results').hidden=visible.length!==0;
  list.innerHTML=visible.map(house=>{
    const booked=isOccupied(house),chosen=state.selectedId===house.id;
    return `<article class="house-card ${booked?'is-occupied':''} ${chosen?'is-selected':''}" id="card-${house.id}"><figure><img src="${house.image}" alt="${house.type} «${house.name}»" style="object-position:${house.position}" loading="lazy"><figcaption class="card-state">${status(house)}</figcaption></figure><div class="card-body"><span class="card-type">${house.type} · до ${house.capacity} гостей</span><h3>${house.name}</h3><p>${house.description}</p><div class="card-bottom"><span class="card-price"><small>от / ночь</small>${money(house.price)}</span><button type="button" class="card-choice" data-house-id="${house.id}" aria-pressed="${chosen}" ${booked?'disabled':''}>${booked?'Недоступен':chosen?'Выбран ✓':'Выбрать дом ↗'}</button></div></div></article>`;
  }).join('');
  markers.innerHTML=visible.map(house=>`<button type="button" class="map-marker" data-house-id="${house.id}" data-state="${isOccupied(house)?'occupied':state.selectedId===house.id?'selected':'free'}" style="left:${house.x}%;top:${house.y}%" aria-label="Открыть дом ${house.name}: ${status(house)}, ${money(house.price)} за ночь" aria-pressed="${state.selectedId===house.id}" aria-haspopup="dialog"><span class="map-cabin-graphic" aria-hidden="true"></span><span class="map-marker-title">${house.name}</span><span class="map-marker-status">${status(house)}</span></button>`).join('')+mapPlaces.map(place=>`<button type="button" class="map-place" data-place="${place.id}" style="left:${place.x}%;top:${place.y}%" aria-label="Открыть место: ${place.name}" aria-haspopup="dialog"><span class="map-place-icon" aria-hidden="true">${place.symbol}</span><span class="map-place-title">${place.name}</span></button>`).join('');
  if(focusId)focusChoice(focusId,origin);
}

function renderSelected(){
  const house=selectedHouse();
  $('#selected-house').innerHTML=house?`<span class="panel-overline">ВАШ ВЫБОР</span><img src="${house.image}" alt="" style="object-position:${house.position}"><h3>${house.name}</h3><p>${house.type} · до ${house.capacity} гостей · ${money(house.price)} / ночь</p>`:`<span class="panel-overline">ВАШ ВЫБОР</span><h3>Выберите домик</h3><p>Нажмите на свободный дом в каталоге или на карте.</p>`;
  guestsInput.max=house?String(house.capacity):'';
  updateTotal();
}

function renderBookings(){
  const target=$('#bookings-list');
  target.innerHTML=state.bookings.length?state.bookings.map(booking=>{
    const house=houses.find(item=>item.id===booking.houseId);
    return `<article class="booking-item"><div class="booking-item-top"><div><span class="booking-number">БРОНЬ № ${booking.id.slice(-6).toUpperCase()}</span><h3>${house.name}</h3></div><button type="button" class="cancel-button" data-cancel-id="${booking.id}" aria-label="Отменить бронь дома ${house.name}">Отменить ↗</button></div><div class="booking-item-bottom"><p>${booking.guests} ${plural(booking.guests,'гость','гостя','гостей')} · ${booking.nights} ${plural(booking.nights,'ночь','ночи','ночей')}<br>${house.type}</p><strong>${money(booking.total)}</strong></div></article>`;
  }).join(''):`<p class="booking-empty">Пока нет броней. Выберите свободный домик и начните планировать отдых.</p>`;
  $('#clear-bookings').hidden=state.bookings.length===0;
}

function updateTotal(){
  const house=selectedHouse(),nights=Number(nightsInput.value);
  $('#total-price').textContent=house&&Number.isInteger(nights)&&nights>=1&&nights<=30?money(house.price*nights):'—';
}

function chooseHouse(id,origin,scrollToForm=true){
  const house=houses.find(item=>item.id===id);
  if(!house||isOccupied(house)||!visibleHouses().includes(house))return;
  state.selectedId=id;clearErrors();message('');
  if(!guestsInput.value||Number(guestsInput.value)>house.capacity)guestsInput.value=String(Math.min(2,house.capacity));
  if(!nightsInput.value)nightsInput.value='2';
  renderHouses(origin,id);renderSelected();
  if(scrollToForm){$('#reserve').scrollIntoView({behavior:'smooth',block:'start'});guestsInput.focus({preventScroll:true})}
}

function mapPhotos(item){return item.kind==='house'?(item.data.gallery?.length?item.data.gallery:[item.data.image]):item.data.images}
function renderMapDialog(){
  if(!activeMapItem)return;
  const {kind,data}=activeMapItem;
  const photos=mapPhotos(activeMapItem);
  $('#map-dialog-kicker').textContent=kind==='house'?`${data.type} · ${status(data).toUpperCase()}`:'МЕСТО НА ТЕРРИТОРИИ';
  $('#map-dialog-title').textContent=kind==='house'?`Дом «${data.name}»`:data.name;
  $('#map-dialog-description').textContent=data.description;
  $('#map-dialog-photo').innerHTML=photos.length?`<img src="${photos[galleryIndex]}" alt="${data.name}, фото ${galleryIndex+1}" style="object-position:${data.position||'center'}"><span class="map-gallery-count">${galleryIndex+1} / ${photos.length}</span>${photos.length>1?'<div class="map-gallery-controls"><button type="button" data-slide="-1" aria-label="Предыдущее фото">‹</button><button type="button" data-slide="1" aria-label="Следующее фото">›</button></div>':''}`:`<div class="map-photo-placeholder"><span class="placeholder-glyph" aria-hidden="true">${data.symbol}</span><strong>Фото скоро появится</strong><span>Здесь будет отдельный снимок места «${data.name}».</span></div>`;
  $('#map-dialog-action').innerHTML=kind==='house'?`<button type="button" data-book-house="${data.id}" ${isOccupied(data)?'disabled':''}>${isOccupied(data)?'Дом занят — посмотреть другие':'Забронировать дом · '+money(data.price)+' / ночь'} <span aria-hidden="true">↗</span></button>`:'<p class="map-place-note">Загляните в домики на карте или в каталоге, чтобы выбрать место для отдыха.</p>';
}
function openMapItem(kind,id){
  const data=kind==='house'?houses.find(house=>house.id===id):mapPlaces.find(place=>place.id===id);
  if(!data)return;
  if(kind==='house'&&!isOccupied(data))chooseHouse(id,'map',false);
  activeMapItem={kind,data};galleryIndex=0;restoreMapFocus=kind==='house'?`[data-house-id="${id}"]`:`[data-place="${id}"]`;
  renderMapDialog();mapDialog.showModal();$('#map-dialog-close').focus();
}

function applyFilters(){
  state.guestsFilter=Number($('#guest-filter').value);
  state.priceFilter=Number($('#price-filter').value);
  if(state.selectedId&&!visibleHouses().some(house=>house.id===state.selectedId)){
    state.selectedId=null;clearErrors();message('Выбранный дом больше не подходит фильтрам. Выберите другой.');renderSelected();
  }else message('');
  renderHouses();
}

function validateForm(house){
  clearErrors();let valid=true;
  const guests=Number(guestsInput.value),nights=Number(nightsInput.value);
  if(!guestsInput.value||!Number.isInteger(guests)||guests<1||guests>house.capacity){$('#guests-error').textContent=`Укажите целое число от 1 до ${house.capacity}.`;guestsInput.setAttribute('aria-invalid','true');valid=false}
  if(!nightsInput.value||!Number.isInteger(nights)||nights<1||nights>30){$('#nights-error').textContent='Укажите целое число от 1 до 30.';nightsInput.setAttribute('aria-invalid','true');valid=false}
  if(!valid){$('#form-error').textContent='Проверьте отмеченные поля.';(guestsInput.getAttribute('aria-invalid')==='true'?guestsInput:nightsInput).focus();return null}
  return {guests,nights};
}

function makeId(){return globalThis.crypto?.randomUUID?.() || `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`}

$('#booking-form').addEventListener('submit',event=>{
  event.preventDefault();if(state.busy)return;
  const house=selectedHouse();
  if(!house){$('#form-error').textContent='Сначала выберите свободный дом в каталоге или на карте.';$('#booking-title').scrollIntoView({behavior:'smooth'});return}
  if(isOccupied(house)){state.selectedId=null;renderHouses();renderSelected();$('#form-error').textContent='Этот дом уже занят. Выберите другой.';return}
  const values=validateForm(house);if(!values)return;
  state.busy=true;$('#confirm-button').disabled=true;
  try{
    const booking={id:makeId(),houseId:house.id,guests:values.guests,nights:values.nights,total:house.price*values.nights};
    const next=[...state.bookings,booking];
    const stored=saveBookings(next);
    state.bookings=next;state.selectedId=null;guestsInput.value='';nightsInput.value='';
    renderHouses();renderSelected();renderBookings();
    message(stored?`Готово! Дом «${house.name}» добавлен в «Мои брони».`:'Бронь создана в этой вкладке, но браузер запретил сохранение. После обновления она может исчезнуть.');
    $('#bookings').scrollIntoView({behavior:'smooth'});
  }finally{state.busy=false;$('#confirm-button').disabled=false}
});

list.addEventListener('click',event=>{const button=event.target.closest('[data-house-id]');if(button)chooseHouse(button.dataset.houseId,'list')});
markers.addEventListener('click',event=>{
  const house=event.target.closest('[data-house-id]');if(house){openMapItem('house',house.dataset.houseId);return}
  const place=event.target.closest('[data-place]');if(place)openMapItem('place',place.dataset.place);
});
$('#map-dialog-close').addEventListener('click',()=>mapDialog.close());
mapDialog.addEventListener('click',event=>{if(event.target===mapDialog)mapDialog.close()});
mapDialog.addEventListener('close',()=>{if(!skipMapFocusRestore)markers.querySelector(restoreMapFocus)?.focus({preventScroll:true});skipMapFocusRestore=false;activeMapItem=null});
mapDialog.addEventListener('click',event=>{
  const slide=event.target.closest('[data-slide]');if(slide&&activeMapItem){const direction=slide.dataset.slide;const photos=mapPhotos(activeMapItem);galleryIndex=(galleryIndex+Number(direction)+photos.length)%photos.length;renderMapDialog();mapDialog.querySelector(`[data-slide="${direction}"]`)?.focus();return}
  const book=event.target.closest('[data-book-house]');if(book&&!book.disabled){const id=book.dataset.bookHouse;skipMapFocusRestore=true;mapDialog.close();chooseHouse(id,'map')}
});
mapDialog.addEventListener('keydown',event=>{if(!activeMapItem)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){const photos=mapPhotos(activeMapItem);if(photos.length>1){event.preventDefault();galleryIndex=(galleryIndex+(event.key==='ArrowRight'?1:-1)+photos.length)%photos.length;renderMapDialog()}}});
$('#guest-filter').addEventListener('change',applyFilters);
$('#price-filter').addEventListener('change',applyFilters);
$('#reset-filters').addEventListener('click',()=>{$('#guest-filter').value='0';$('#price-filter').value='0';applyFilters()});
for(const field of [guestsInput,nightsInput])field.addEventListener('input',()=>{field.removeAttribute('aria-invalid');$('#'+field.id+'-error').textContent='';$('#form-error').textContent='';updateTotal()});
$('#bookings-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-cancel-id]');if(!button)return;
  const booking=state.bookings.find(item=>item.id===button.dataset.cancelId);if(!booking)return;
  const next=state.bookings.filter(item=>item.id!==booking.id);
  if(!saveBookings(next)){message('Не удалось сохранить отмену. Проверьте доступ к хранилищу браузера.');return}
  state.bookings=next;renderBookings();renderHouses();message('Бронь отменена. Дом снова свободен.');
});
$('#clear-bookings').addEventListener('click',()=>{
  if(!state.bookings.length||!confirm('Удалить все ваши учебные брони?'))return;
  if(!clearSavedBookings()){message('Не удалось удалить сохранённые брони. Проверьте настройки браузера.');return}
  state.bookings=[];state.selectedId=null;renderBookings();renderHouses();renderSelected();message('Ваши брони удалены. Два исходно занятых дома остались недоступны.');
});

renderHouses();renderSelected();renderBookings();
if(saved.error)message(saved.error);
