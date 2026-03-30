const MONTHS = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function toISODateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseFlexibleDate(input) {
  if (!input) return null;
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;

  const value = String(input).trim();
  if (!value) return null;

  const native = new Date(value);
  if (!Number.isNaN(native.getTime())) {
    return native;
  }

  let m = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const y = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
    const date = new Date(Date.UTC(y, mo, d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  m = value.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) {
    const mo = MONTHS[m[1].toLowerCase()];
    if (mo === undefined) return null;
    const d = Number(m[2]);
    const y = Number(m[3]);
    const date = new Date(Date.UTC(y, mo, d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  m = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const date = new Date(Date.UTC(y, mo, d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function compareDates(a, b) {
  const da = parseFlexibleDate(a);
  const db = parseFlexibleDate(b);
  if (!da || !db) return null;
  const ta = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const tb = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  if (ta === tb) return 0;
  return ta > tb ? 1 : -1;
}

module.exports = {
  parseFlexibleDate,
  toISODateString,
  compareDates
};
