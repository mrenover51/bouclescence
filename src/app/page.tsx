import { HomeContent } from "@/components/shop/home-content";
import { getFeaturedProducts } from "@/lib/catalog";
export const revalidate = 60;
export default async function Home() { return <HomeContent products={await getFeaturedProducts()} />; }
