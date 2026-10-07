import { HomeProductGridCard } from "@/components/HomeProductGridCard";
import { homeDemoProducts } from "@/lib/home-demo-products";

export function HomeAllProductsSection({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  return (
    <section
      id="all-products"
      className="scroll-mt-20 bg-white px-3 py-14 text-[#111] sm:px-5 sm:py-18 lg:px-6 lg:py-20"
      aria-label="All products"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <h2 className="m-0 text-[clamp(30px,4.6vw,56px)] font-semibold leading-none tracking-[-.05em]">
          ALL PRODUCTS
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-x-2.5 gap-y-7 sm:gap-x-3.5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-11">
          {homeDemoProducts.map((product) => (
            <HomeProductGridCard
              key={product.id}
              product={product}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
