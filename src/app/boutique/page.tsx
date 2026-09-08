import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { products } from "@/lib/products";
export const metadata: Metadata = { title: "Boutique" };
export default function ShopPage() { return <div className="shell py-16 sm:py-24"><div className="text-center"><p className="eyebrow text-wine">Toutes nos créations</p><h1 className="display mt-3 text-6xl sm:text-7xl">La boutique</h1><p className="mx-auto mt-5 max-w-lg leading-7 text-muted">Des pièces lumineuses, pensées pour accompagner votre histoire.</p></div><div className="mt-14 flex items-center justify-between border-y border-line py-4 text-xs uppercase tracking-[.14em]"><span>{products.length} créations</span><button className="flex items-center gap-2 font-bold">Trier par <ChevronDown size={15}/></button></div><div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.slug} product={product}/>)}</div></div>; }
