import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

export function HomeAllProductsSection({
  products,
}: {
  products: Product[];
}) {
  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  if (!activeProducts.length) return null;

  return (
    <section
      id="all-products"
      className="scroll-mt-20 bg-[#fafafa] px-4 py-16 text-[#111] sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      aria-label="All products"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <h2 className="m-0 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-.055em]">
          ALL PRODUCTS
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-x-2 gap-y-8 sm:gap-x-3 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-12">
          {activeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
