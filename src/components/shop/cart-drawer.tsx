"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";
import { calculateShipping, shippingProgressMessage } from "@/lib/shipping";
import { useShippingSettings } from "@/components/shop/shipping-provider";
export function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity } = useCart();
  const settings = useShippingSettings();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totals = calculateShipping(subtotal, quantity, settings);
  const progress = shippingProgressMessage(totals, settings);
  return <div className={`fixed inset-0 z-[60] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isOpen}><button onClick={close} aria-label="Fermer le panier" className={`absolute inset-0 bg-ink/35 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`} /><aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper p-6 shadow-2xl transition-transform duration-500 ${isOpen ? "translate-x-0" : "translate-x-full"}`}><div className="flex items-center justify-between border-b border-line pb-5"><h2 className="display text-3xl">Votre panier</h2><button onClick={close} aria-label="Fermer"><X strokeWidth={1.4} /></button></div>{items.length === 0 ? <div className="grid flex-1 place-content-center text-center"><ShoppingBag className="mx-auto"/><p className="display mt-6 text-3xl">Votre écrin est vide</p></div> : <><div className="flex-1 space-y-6 overflow-auto py-6">{items.map((item) => <div key={item.slug} className="grid grid-cols-[5rem_1fr] gap-4"><div className="relative aspect-[4/5] overflow-hidden bg-ivory"><Image src={item.image} alt="" fill sizes="80px" className="object-cover" /></div><div><div className="flex justify-between gap-3"><p className="display text-xl">{item.name}</p><button onClick={() => remove(item.slug)} className="text-xs underline">Retirer</button></div><p className="mt-1 text-sm text-muted">{formatPrice(item.price)}</p><div className="mt-3 flex w-fit items-center border border-line"><button className="p-2" onClick={() => setQuantity(item.slug, item.quantity - 1)}><Minus size={13} /></button><span className="min-w-8 text-center text-sm">{item.quantity}</span><button className="p-2" onClick={() => setQuantity(item.slug, item.quantity + 1)}><Plus size={13} /></button></div></div></div>)}</div><div className="border-t border-line pt-5"><div className="flex justify-between"><span>Total</span><strong>{formatPrice(totals.total)}</strong></div>{progress&&<p className="mt-2 text-xs text-wine">{progress}</p>}<Link onClick={close} href="/panier" className="mt-5 flex min-h-14 items-center justify-center bg-wine text-xs font-bold uppercase tracking-[.17em] text-white">Voir le panier</Link></div></>}</aside></div>;
}
