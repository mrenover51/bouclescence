"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";
type CartItem = Pick<Product, "slug" | "name" | "price" | "image" | "stock"> & { quantity: number };
type CartState = { items: CartItem[]; isOpen: boolean; add: (product: Product) => void; remove: (slug: string) => void; setQuantity: (slug: string, quantity: number) => void; open: () => void; close: () => void };
export const useCart = create<CartState>()(persist((set) => ({ items: [], isOpen: false,
  add: (product) => set((state) => { if(product.stock<=0)return state; const found = state.items.find((item) => item.slug === product.slug); const items = found ? state.items.map((item) => item.slug === product.slug ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) } : item) : [...state.items, { slug: product.slug, name: product.name, price: product.price, image: product.image, stock: product.stock, quantity: 1 }]; return { items, isOpen: true }; }),
  remove: (slug) => set((state) => ({ items: state.items.filter((item) => item.slug !== slug) })),
  setQuantity: (slug, quantity) => set((state) => ({ items: state.items.map((item) => item.slug === slug ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item) })),
  open: () => set({ isOpen: true }), close: () => set({ isOpen: false }),
}), { name: "bouclescence-panier", partialize: ({ items }) => ({ items }) }));
