export type ShippingSettings = {
  standardShippingCost: number;
  freeShippingAmountEnabled: boolean;
  freeShippingAmount: number;
  freeShippingQuantityEnabled: boolean;
  freeShippingQuantity: number;
};

export type ShippingCalculation = {
  subtotal: number;
  quantity: number;
  shippingCost: number;
  freeShipping: boolean;
  total: number;
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  standardShippingCost: 4.9,
  freeShippingAmountEnabled: true,
  freeShippingAmount: 50,
  freeShippingQuantityEnabled: true,
  freeShippingQuantity: 4,
};

export function calculateShipping(subtotal: number, quantity: number, settings: ShippingSettings): ShippingCalculation {
  const safeSubtotal = Math.max(0, subtotal);
  const safeQuantity = Math.max(0, Math.floor(quantity));
  const amountReached = settings.freeShippingAmountEnabled && safeSubtotal >= settings.freeShippingAmount;
  const quantityReached = settings.freeShippingQuantityEnabled && safeQuantity >= settings.freeShippingQuantity;
  const freeShipping = safeQuantity > 0 && (amountReached || quantityReached);
  const shippingCost = safeQuantity === 0 || freeShipping ? 0 : settings.standardShippingCost;
  return { subtotal: safeSubtotal, quantity: safeQuantity, shippingCost, freeShipping, total: safeSubtotal + shippingCost };
}

export function shippingProgressMessage(calculation: ShippingCalculation, settings: ShippingSettings): string | null {
  if (calculation.quantity === 0) return null;
  if (calculation.freeShipping) return "Livraison offerte";
  const remaining: { kind: "amount" | "quantity"; value: number }[] = [];
  if (settings.freeShippingAmountEnabled) remaining.push({ kind: "amount", value: Math.max(0, settings.freeShippingAmount - calculation.subtotal) });
  if (settings.freeShippingQuantityEnabled) remaining.push({ kind: "quantity", value: Math.max(0, settings.freeShippingQuantity - calculation.quantity) });
  if (!remaining.length) return null;
  const amount = remaining.find((item) => item.kind === "amount");
  const quantity = remaining.find((item) => item.kind === "quantity");
  if (amount && quantity && quantity.value / settings.freeShippingQuantity <= amount.value / settings.freeShippingAmount) return `Ajoutez encore ${quantity.value} paire${quantity.value > 1 ? "s" : ""} pour bénéficier de la livraison offerte`;
  if (amount) return `Plus que ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount.value)} pour bénéficier de la livraison offerte`;
  return `Ajoutez encore ${quantity!.value} paire${quantity!.value > 1 ? "s" : ""} pour bénéficier de la livraison offerte`;
}
