import {
  HomeProductGridCard,
  type HomeDemoProduct,
} from "@/components/HomeProductGridCard";

const demoProducts: HomeDemoProduct[] = [
  {
    id: "demo-1",
    name: "Essential White Tee",
    price: 799,
    image: "/images/product-1.png",
  },
  {
    id: "demo-2",
    name: "Daily White Tee",
    price: 899,
    image: "/images/product-2.png",
  },
  {
    id: "demo-3",
    name: "Relaxed Essential Tee",
    price: 849,
    image: "/images/product-1.png",
  },
  {
    id: "demo-4",
    name: "Everyday Tee",
    price: 899,
    image: "/images/product-2.png",
  },
];

export function HomeAllProductsSection() {
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
          {demoProducts.map((product) => (
            <HomeProductGridCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
