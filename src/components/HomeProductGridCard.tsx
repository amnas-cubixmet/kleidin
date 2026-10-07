import Image from "next/image";

export type HomeDemoProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function HomeProductGridCard({
  product,
}: {
  product: HomeDemoProduct;
}) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f1ef]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
      </div>

      <div className="pt-3">
        <h3 className="m-0 truncate text-[11px] font-semibold tracking-[-.01em] text-[#111] sm:text-[12px]">
          {product.name}
        </h3>

        <p className="mt-1 text-[10px] font-medium text-black/52 sm:text-[11px]">
          {money(product.price)}
        </p>
      </div>
    </article>
  );
}
