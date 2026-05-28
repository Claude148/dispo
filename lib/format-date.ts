const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_LONG = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
const MONTHS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function formatDayShort(date: Date) {
  return DAYS[date.getDay()];
}

export function formatDayLong(date: Date) {
  return DAYS_LONG[date.getDay()];
}

export function formatMonthShort(date: Date) {
  return MONTHS[date.getMonth()];
}

export function formatMonthLong(date: Date) {
  return MONTHS_LONG[date.getMonth()];
}

export function formatTime(date: Date) {
  return `${date.getHours()}h${date.getMinutes().toString().padStart(2, "0")}`;
}

export function formatDateLabel(date: Date) {
  return `${formatDayShort(date)} ${date.getDate()} ${formatMonthShort(date)}`;
}

export function formatFullDate(date: Date) {
  return `${formatDayLong(date)} ${date.getDate()} ${formatMonthLong(date)} · ${formatTime(date)}`;
}
