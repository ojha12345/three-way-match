export const safeString = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

export const normalizeKey = (item = {}) => {
  const code = safeString(item.itemCode || item.sku);
  const desc = safeString(item.description);

  const base = code || desc;
  return base.toLowerCase().replace(/\s+/g, " ");
};

export const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const toDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};