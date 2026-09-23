"use client";
import { createContext, useContext } from "react";
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from "@/lib/shipping";
const ShippingContext = createContext<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
export function ShippingProvider({ settings, children }: { settings: ShippingSettings; children: React.ReactNode }) { return <ShippingContext.Provider value={settings}>{children}</ShippingContext.Provider>; }
export function useShippingSettings() { return useContext(ShippingContext); }
