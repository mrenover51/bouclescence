import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/lib/products";

export function ProductGrid({
  products,
  preloadFirst = false,
  className = "",
}: {
  products: Product[];
  preloadFirst?: boolean;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6 ${className}`}>
      {products.map((product, index) => (
        <ProductCard key={product.slug} product={product} preload={preloadFirst && index === 0} />
      ))}
    </div>
  );
}
