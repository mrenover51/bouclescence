import { HomeContent } from "@/components/shop/home-content";
import { getFeaturedProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
export const revalidate = 60;
export const metadata=pageMetadata({title:"Bouclescence | Boucles artisanales en argile polymère",description:"Découvrez Bouclescence, boutique en ligne de boucles d’oreilles en argile polymère avec éléments en acier inoxydable, livrées partout en France.",path:"/",image:"/images/photo7.png"});
export default async function Home() { return <HomeContent products={await getFeaturedProducts()} />; }
