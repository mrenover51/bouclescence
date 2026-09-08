import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { getPublicCollection } from "@/lib/catalog";
export const revalidate = 60;
export default async function CollectionPage({params}:PageProps<"/collections/[slug]">) { const {slug}=await params; const collection=await getPublicCollection(slug); if(!collection) notFound(); return <div className="shell py-16 sm:py-24"><header className="max-w-2xl"><p className="eyebrow text-wine">Collection</p><h1 className="display mt-3 text-6xl">{collection.name}</h1><p className="mt-5 leading-8 text-muted">{collection.description}</p></header><div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{collection.products.map(product=><ProductCard key={product.slug} product={product}/>)}</div></div>; }
