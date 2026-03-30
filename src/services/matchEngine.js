import { normalizeKey, safeString, toDate, toNumber } from "../utils/normalize.js";

function getItems(doc) {
  return doc?.parsedData?.items || [];
}

function addReason(reasons, reason) {
  if (!reasons.includes(reason)) reasons.push(reason);
}

function buildItemState(poItem = {}) {
  return {
    poQuantity: toNumber(poItem.quantity),
    grnQuantity: 0,
    invoiceQuantity: 0,
    poItem
  };
}

export function computeMatchState({ poDocs = [], grnDocs = [], invoiceDocs = [] }) {
  const reasons = [];

  if (!poDocs.length) {
    return {
      status: "insufficient_documents",
      reasons: ["po_missing"],
      summary: {
        poCount: 0,
        grnCount: grnDocs.length,
        invoiceCount: invoiceDocs.length
      }
    };
  }

  if (poDocs.length > 1) {
    addReason(reasons, "duplicate_po");
  }

  const poDoc = poDocs[0];
  const poDate = toDate(poDoc?.parsedData?.poDate);

  const itemMap = new Map();

  for (const item of getItems(poDoc)) {
    const key = normalizeKey(item);
    if (!key) continue;
    itemMap.set(key, buildItemState(item));
  }

  for (const grnDoc of grnDocs) {
    for (const item of getItems(grnDoc)) {
      const key = normalizeKey(item);
      const qty = toNumber(item.receivedQuantity ?? item.quantity);

      if (!key || !itemMap.has(key)) {
        addReason(reasons, "item_missing_in_po");
        continue;
      }

      const state = itemMap.get(key);
      state.grnQuantity += qty;
    }
  }

  for (const invoiceDoc of invoiceDocs) {
    const invoiceDate = toDate(invoiceDoc?.parsedData?.invoiceDate);
    if (poDate && invoiceDate && invoiceDate > poDate) {
      addReason(reasons, "invoice_date_after_po_date");
    }

    for (const item of getItems(invoiceDoc)) {
      const key = normalizeKey(item);
      const qty = toNumber(item.quantity);

      if (!key || !itemMap.has(key)) {
        addReason(reasons, "item_missing_in_po");
        continue;
      }

      const state = itemMap.get(key);
      state.invoiceQuantity += qty;
    }
  }

  for (const [, state] of itemMap) {
    if (state.grnQuantity > state.poQuantity) {
      addReason(reasons, "grn_qty_exceeds_po_qty");
    }
    if (state.invoiceQuantity > state.poQuantity) {
      addReason(reasons, "invoice_qty_exceeds_po_qty");
    }
    if (state.invoiceQuantity > state.grnQuantity) {
      addReason(reasons, "invoice_qty_exceeds_grn_qty");
    }
  }

  let status = "matched";

  if (reasons.length > 0) {
    status = "mismatch";
  } else if (grnDocs.length === 0 || invoiceDocs.length === 0) {
    status = "partially_matched";
  }

  if (!grnDocs.length && !invoiceDocs.length) {
    status = "insufficient_documents";
  }

  const items = [...itemMap.entries()].map(([key, state]) => ({
    key,
    poQuantity: state.poQuantity,
    grnQuantity: state.grnQuantity,
    invoiceQuantity: state.invoiceQuantity,
    description: safeString(state.poItem.description),
    itemCode: safeString(state.poItem.itemCode),
    sku: safeString(state.poItem.sku)
  }));

  return {
    status,
    reasons,
    summary: {
      poCount: poDocs.length,
      grnCount: grnDocs.length,
      invoiceCount: invoiceDocs.length,
      items
    }
  };
}