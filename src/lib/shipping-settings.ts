import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from "@/lib/shipping";

type StoredShipping = { standard_shipping_cost?: number; free_shipping_amount_enabled?: boolean; free_shipping_amount?: number; free_shipping_quantity_enabled?: boolean; free_shipping_quantity?: number };

export async function getShippingSettings(): Promise<ShippingSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "shipping").maybeSingle();
  const value = (data?.value ?? {}) as StoredShipping;
  return {
    standardShippingCost: typeof value.standard_shipping_cost === "number" ? value.standard_shipping_cost / 100 : DEFAULT_SHIPPING_SETTINGS.standardShippingCost,
    freeShippingAmountEnabled: typeof value.free_shipping_amount_enabled === "boolean" ? value.free_shipping_amount_enabled : DEFAULT_SHIPPING_SETTINGS.freeShippingAmountEnabled,
    freeShippingAmount: typeof value.free_shipping_amount === "number" ? value.free_shipping_amount / 100 : DEFAULT_SHIPPING_SETTINGS.freeShippingAmount,
    freeShippingQuantityEnabled: typeof value.free_shipping_quantity_enabled === "boolean" ? value.free_shipping_quantity_enabled : DEFAULT_SHIPPING_SETTINGS.freeShippingQuantityEnabled,
    freeShippingQuantity: typeof value.free_shipping_quantity === "number" ? value.free_shipping_quantity : DEFAULT_SHIPPING_SETTINGS.freeShippingQuantity,
  };
}
