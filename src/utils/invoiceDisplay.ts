import type { InvoiceItem } from "../types";

export type InvoiceDisplayItem = InvoiceItem & { sourceIds: string[] };

export function groupInvoiceItems(
  items: InvoiceItem[],
  resolve: (item: InvoiceItem) => { stepId: string | null; stepName: string; description: string },
) {
  const groups = new Map<string | null, { id: string | null; name: string; items: InvoiceDisplayItem[] }>();
  const merged = new Map<string, InvoiceDisplayItem>();
  for (const item of items) {
    const { stepId, stepName, description } = resolve(item);
    let group = groups.get(stepId);
    if (!group) {
      group = { id: stepId, name: stepName, items: [] };
      groups.set(stepId, group);
    }
    // Described items are always separate. Rates and tax treatment must match.
    const key = JSON.stringify([stepId, item.service_id || null, item.unit_price, !!item.exempt_tax]);
    const existing = description ? undefined : merged.get(key);
    if (existing) {
      existing.sourceIds.push(item.id);
      existing.quantity += item.quantity;
      existing.subtotal += item.subtotal;
      existing.tax_1_amount += item.tax_1_amount;
      existing.tax_2_amount += item.tax_2_amount;
      existing.discount_amount += item.discount_amount;
      existing.line_total += item.line_total;
    } else {
      const row = { ...item, description, sourceIds: [item.id] };
      group.items.push(row);
      if (!description) merged.set(key, row);
    }
  }
  return [...groups.values()];
}
