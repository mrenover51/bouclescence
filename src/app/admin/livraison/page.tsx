import { ShippingForm } from "@/components/admin/shipping-form";
import { getShippingSettings } from "@/lib/shipping-settings";
export default async function Page(){const settings=await getShippingSettings();return <><p className="text-xs uppercase tracking-[.15em] text-wine">Paramètres</p><h1 className="display mt-2 text-5xl">Livraison</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Les deux règles de gratuité peuvent être actives en même temps. La livraison est offerte dès que l’une des conditions est remplie.</p><ShippingForm settings={settings}/></>}
