"use client";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/products";
export function AddToCart({ product }: { product: Product }) { const add = useCart((state) => state.add); const soldOut=product.stock<=0; return <button disabled={soldOut} onClick={() => add(product)} className="flex min-h-14 w-full items-center justify-center gap-3 bg-wine px-6 text-xs font-bold uppercase tracking-[.17em] text-white transition hover:bg-wine-dark disabled:cursor-not-allowed disabled:bg-muted"><ShoppingBag size={17} strokeWidth={1.6} /> {soldOut?"Rupture de stock":"Ajouter au panier"}</button>; }
