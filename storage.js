import {houses} from './data.js';

export const STORAGE_KEY = 'tihiy-bereg-bookings-v1';
const known = new Map(houses.map(house => [house.id, house]));

export function validateBookings(value) {
  if (!Array.isArray(value)) throw new Error('Данные броней имеют неверную структуру.');
  const seen = new Set();
  return value.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Найдена повреждённая запись брони.');
    const house = known.get(item.houseId);
    if (!house || house.initiallyOccupied || seen.has(item.houseId)) throw new Error('Найдена неизвестная или повторная бронь.');
    if (typeof item.id !== 'string' || !item.id || !Number.isInteger(item.guests) || item.guests < 1 || item.guests > house.capacity || !Number.isInteger(item.nights) || item.nights < 1 || item.nights > 30 || item.total !== house.price * item.nights) throw new Error('У одной из броней неверные данные.');
    seen.add(item.houseId);
    return {id:item.id,houseId:item.houseId,guests:item.guests,nights:item.nights,total:item.total};
  });
}

export function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return {bookings:raw === null ? [] : validateBookings(JSON.parse(raw)),error:null};
  } catch {
    return {bookings:[],error:'Сохранённые брони не удалось прочитать. Проверьте данные браузера; новые брони пока можно создавать в этой вкладке.'};
  }
}

export function saveBookings(bookings) {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(validateBookings(bookings))); return true; }
  catch { return false; }
}

export function clearSavedBookings() {
  try { localStorage.removeItem(STORAGE_KEY); return true; }
  catch { return false; }
}
