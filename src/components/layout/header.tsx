"use client";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useShippingSettings } from "@/components/shop/shipping-provider";
import { Logo } from "@/components/ui/logo";
import { formatPrice } from "@/lib/products";

const links = [{ href: "/boutique", label: "Boutique" }, { href: "/collections", label: "Collections" }, { href: "/a-propos", label: "Notre histoire" }, { href: "/contact", label: "Contact" }];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCart((state) => state.items);
  const openCart = useCart((state) => state.open);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = useShippingSettings();
  const banner = shipping.freeShippingAmountEnabled ? `Livraison offerte dès ${formatPrice(shipping.freeShippingAmount)}` : shipping.freeShippingQuantityEnabled ? `Livraison offerte dès ${shipping.freeShippingQuantity} paires` : null;
  if (pathname.startsWith("/admin")) return null;
  return <>{banner && <div className="bg-wine px-3 py-2 text-center text-[.52rem] font-semibold uppercase tracking-[.1em] text-white sm:text-[.62rem] sm:tracking-[.16em]">{banner}</div>}<header className="sticky top-0 z-40 border-b border-line/70 bg-paper/95 backdrop-blur"><div className="shell grid h-20 grid-cols-[2.5rem_1fr_2.5rem] items-center sm:h-24 sm:grid-cols-[1fr_auto_1fr]"><button aria-label="Ouvrir le menu" className="justify-self-start lg:hidden" onClick={() => setMenuOpen(true)}><Menu strokeWidth={1.4} /></button><nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">{links.slice(0, 2).map((link) => <Link className="link-line text-[.7rem] font-bold uppercase tracking-[.16em]" key={link.href} href={link.href}>{link.label}</Link>)}</nav><Logo preload /><div className="flex items-center justify-self-end gap-4"><nav className="hidden items-center gap-7 lg:flex">{links.slice(2).map((link) => <Link className="link-line text-[.7rem] font-bold uppercase tracking-[.16em]" key={link.href} href={link.href}>{link.label}</Link>)}</nav><Search className="hidden sm:block" size={20} strokeWidth={1.4} aria-label="Rechercher" /><Link className="hidden sm:block" href="/compte" aria-label="Mon compte"><UserRound size={20} strokeWidth={1.4} /></Link><button onClick={openCart} className="relative" aria-label={`Panier, ${count} article${count === 1 ? "" : "s"}`}><ShoppingBag size={20} strokeWidth={1.4} />{count > 0 && <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-wine text-[.55rem] text-white">{count}</span>}</button></div></div></header>{menuOpen && <div className="fixed inset-0 z-50 bg-paper p-6 lg:hidden"><div className="flex justify-between"><Logo compact /><button onClick={() => setMenuOpen(false)} aria-label="Fermer"><X /></button></div><nav className="mt-16 flex flex-col gap-7">{links.map((link) => <Link onClick={() => setMenuOpen(false)} className="display border-b border-line pb-5 text-4xl" key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>}<CartDrawer /></>;
}
