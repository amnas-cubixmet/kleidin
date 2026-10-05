import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { ProductSearchBar } from "@/components/ProductSearchBar";
import { getCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    new?: string;
    q?: string;
    sort?: string;
  }>;
};

function buildProductsHref(
  current: {
    category?: string;
    new?: string;
    q?: string;
    sort?: string;
  },
  changes: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  const merged = { ...current, ...changes };
  Object.entries(merged).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const allProducts = getCatalogProducts();

  const category = params.category;
  const showNew = params.new === "1";
  const rawQuery = params.q?.trim() || undefined;
  const query = rawQuery?.toLowerCase();
  const sort = params.sort ?? "featured";

  const categories = Array.from(
    new Set(allProducts.map((product) => product.category).filter(Boolean)),
  );

  const filteredProducts = allProducts.filter((product) => {
    if (category && product.category !== category) return false;
    if (showNew && !product.featured) return false;

    if (
      query &&
      ![
        product.name,
        product.category,
        ...product.colors,
        ...product.sizes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "name") return a.name.localeCompare(b.name);

    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
  });

  const currentParams = {
    category,
    new: showNew ? "1" : undefined,
    q: rawQuery,
    sort: sort === "featured" ? undefined : sort,
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: category || showNew || query ? "/products" : undefined },
    ...(category
      ? [{ label: category }]
      : showNew
        ? [{ label: "New Arrivals" }]
        : query
          ? [{ label: `Search: ${rawQuery}` }]
          : []),
  ];

  const sortLabel =
    sort === "price-low"
      ? "Price: Low"
      : sort === "price-high"
        ? "Price: High"
        : sort === "name"
          ? "Name"
          : "Featured";

  return (
    <main className="catalog-store-page">
      <div className="catalog-store-shell">
        <Breadcrumbs items={breadcrumbItems} />

        <ProductSearchBar initialValue={rawQuery ?? ""} />

        <div className="catalog-store-toolbar">
          <div className="catalog-store-title">
            <h1>{query ? "Search results" : "All Products"}</h1>
            {(category || showNew || query) ? (
              <Link href="/products">Clear filters</Link>
            ) : null}
          </div>

          <div className="catalog-store-right">
            <span className="catalog-store-count">
              {String(sortedProducts.length).padStart(2, "0")} items
            </span>
            <span className="catalog-store-divider" aria-hidden="true" />

            <div className="catalog-store-actions">
            <details className="catalog-dropdown catalog-sort-dropdown">
              <summary>
                <span>Sort by</span>
                <strong>{sortLabel}</strong>
                <span aria-hidden="true">⌄</span>
              </summary>
              <div className="catalog-dropdown-panel">
                <Link href={buildProductsHref(currentParams, { sort: undefined })}>
                  Featured
                </Link>
                <Link href={buildProductsHref(currentParams, { sort: "price-low" })}>
                  Price: Low to High
                </Link>
                <Link href={buildProductsHref(currentParams, { sort: "price-high" })}>
                  Price: High to Low
                </Link>
                <Link href={buildProductsHref(currentParams, { sort: "name" })}>
                  Name
                </Link>
              </div>
            </details>

            <details className="catalog-dropdown catalog-filter-dropdown">
              <summary>
                <span className="catalog-filter-icon" aria-hidden="true">
                  ≡
                </span>
                <strong>Filter</strong>
              </summary>
              <div className="catalog-dropdown-panel catalog-filter-panel">
                <Link
                  href={buildProductsHref(currentParams, {
                    category: undefined,
                    new: undefined,
                  })}
                  className={!category && !showNew ? "active" : ""}
                >
                  All
                </Link>
                <Link
                  href={buildProductsHref(currentParams, {
                    category: undefined,
                    new: "1",
                  })}
                  className={showNew ? "active" : ""}
                >
                  New
                </Link>
                {categories.map((item) => (
                  <Link
                    key={item}
                    href={buildProductsHref(currentParams, {
                      category: item,
                      new: undefined,
                    })}
                    className={category === item ? "active" : ""}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </details>
            </div>
          </div>
        </div>

        {sortedProducts.length ? (
          <section className="catalog-store-grid" aria-label="Products">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <section className="catalog-store-empty">
            <h2>No products found.</h2>
            <p>Try another search or clear the current filters.</p>
            <Link href="/products">View all products</Link>
          </section>
        )}
      </div>
    </main>
  );
}
