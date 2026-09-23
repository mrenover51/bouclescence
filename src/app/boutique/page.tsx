import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-grid";
import { getPublicProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
export const revalidate = 60;
export const metadata: Metadata = pageMetadata({title:"Boutique de boucles d’oreilles en argile polymère",description:"Parcourez les boucles d’oreilles Bouclescence en argile polymère avec éléments en acier inoxydable : modèles floraux, graphiques et colorés à 15 €.",path:"/boutique"});
export default async function ShopPage() { const products=await getPublicProducts(); return <div className="shell py-16 sm:py-24"><div className="text-center"><p className="eyebrow text-wine">Toutes nos créations</p><h1 className="display mt-3 text-6xl sm:text-7xl">La boutique</h1><p className="mx-auto mt-5 max-w-lg leading-7 text-muted">Des pièces lumineuses, pensées pour accompagner votre histoire.</p></div><div className="mt-14 flex items-center justify-between border-y border-line py-4 text-xs uppercase tracking-[.14em]"><span>{products.length} créations</span><button className="flex items-center gap-2 font-bold">Trier par <ChevronDown size={15}/></button></div><ProductGrid products={products} className="mt-10" /></div>; }
