import { HomeContent } from "@/components/shop/home-content";
import { getFeaturedProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
export const revalidate = 60;
export const metadata=pageMetadata({title:"Bouclescence | Boucles d’oreilles et bijoux de créatrice",description:"Découvrez les boucles d’oreilles Bouclescence : des créations féminines, originales et délicates, proposées en petites séries.",path:"/",image:"/images/hero-boucles-perles.png"});
export default async function Home() { return <HomeContent products={await getFeaturedProducts()} />; }
