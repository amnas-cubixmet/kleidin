"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  status: "active" | "draft" | "sold-out";
  image_url: string | null;
  try_on_image_url: string | null;
  sort_order: number;
};

type AdminOffer = {
  id: string;
  title: string;
  badge: string;
  discount_text: string;
  description: string;
  cta_label: string;
  cta_href: string;
  image_url: string;
  starts_at: string | null;
  ends_at: string | null;
  enabled: boolean;
  priority: number;
};

type SettingsRow = {
  whatsapp_number: string;
  announcement_text: string;
  announcement_link_label: string;
  instagram_url: string;
  support_email: string;
};

const emptyProduct: Omit<AdminProduct, "id"> = {
  sku: "",
  name: "",
  slug: "",
  category: "T-Shirts",
  price: 1299,
  compare_at_price: null,
  description: "",
  sizes: ["S", "M", "L", "XL"],
  colors: ["Black"],
  stock: 10,
  featured: true,
  status: "active",
  image_url: null,
  try_on_image_url: null,
  sort_order: 100,
};

const emptyOffer: Omit<AdminOffer, "id"> = {
  title: "Limited Time Offer",
  badge: "LIMITED TIME OFFER",
  discount_text: "30%",
  description: "Upgrade your everyday wardrobe.",
  cta_label: "Shop the Offer",
  cta_href: "/products",
  image_url: "",
  starts_at: null,
  ends_at: null,
  enabled: true,
  priority: 0,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminPanel() {
  const supabase = getBrowserSupabase();
  const [status, setStatus] = useState<"loading" | "signed-out" | "ready" | "not-admin">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"overview" | "products" | "offers" | "settings">("overview");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [settings, setSettings] = useState<SettingsRow>({
    whatsapp_number: "",
    announcement_text: "New Drop Available",
    announcement_link_label: "Order on WhatsApp",
    instagram_url: "",
    support_email: "",
  });
  const [productDraft, setProductDraft] = useState<Omit<AdminProduct, "id">>(emptyProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [offerDraft, setOfferDraft] = useState<Omit<AdminOffer, "id">>(emptyOffer);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAdminData() {
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setStatus("signed-out");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      setStatus("not-admin");
      return;
    }

    const [productResult, offerResult, settingsResult] = await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("offers").select("*").order("priority", { ascending: false }),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    setProducts((productResult.data ?? []) as AdminProduct[]);
    setOffers((offerResult.data ?? []) as AdminOffer[]);

    if (settingsResult.data) {
      setSettings({
        whatsapp_number: settingsResult.data.whatsapp_number ?? "",
        announcement_text: settingsResult.data.announcement_text ?? "",
        announcement_link_label:
          settingsResult.data.announcement_link_label ?? "",
        instagram_url: settingsResult.data.instagram_url ?? "",
        support_email: settingsResult.data.support_email ?? "",
      });
    }

    setStatus("ready");
  }

  useEffect(() => {
    if (!supabase) {
      setStatus("signed-out");
      return;
    }

    loadAdminData();

    const { data } = supabase.auth.onAuthStateChange(() => {
      loadAdminData();
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.status === "active").length,
      lowStock: products.filter((product) => product.stock <= 5).length,
      offers: offers.filter((offer) => offer.enabled).length,
    }),
    [products, offers],
  );

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);
    if (error) setMessage(error.message);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setStatus("signed-out");
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    const payload = {
      ...productDraft,
      slug: productDraft.slug || slugify(productDraft.name),
      compare_at_price:
        productDraft.compare_at_price && productDraft.compare_at_price > 0
          ? productDraft.compare_at_price
          : null,
    };

    const result = editingProductId
      ? await supabase.from("products").update(payload).eq("id", editingProductId)
      : await supabase.from("products").insert(payload);

    setBusy(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setProductDraft(emptyProduct);
    setEditingProductId(null);
    setMessage("Product saved.");
    await loadAdminData();
  }

  async function deleteProduct(id: string) {
    if (!supabase || !window.confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    await loadAdminData();
  }

  function editProduct(product: AdminProduct) {
    const { id, ...draft } = product;
    setEditingProductId(id);
    setProductDraft(draft);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadProductImage(file: File, kind: "image_url" | "try_on_image_url") {
    if (!supabase) return;

    setBusy(true);
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(path, file, { upsert: false });

    if (error) {
      setBusy(false);
      setMessage(error.message);
      return;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    setProductDraft((current) => ({ ...current, [kind]: data.publicUrl }));
    setBusy(false);
  }

  async function uploadOfferImage(file: File) {
    if (!supabase) return;

    setBusy(true);
    const extension = file.name.split(".").pop() || "jpg";
    const path = `offers/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(path, file, { upsert: false });

    if (error) {
      setBusy(false);
      setMessage(error.message);
      return;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    setOfferDraft((current) => ({ ...current, image_url: data.publicUrl }));
    setBusy(false);
  }

  async function saveOffer(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    const result = editingOfferId
      ? await supabase.from("offers").update(offerDraft).eq("id", editingOfferId)
      : await supabase.from("offers").insert(offerDraft);

    setBusy(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setOfferDraft(emptyOffer);
    setEditingOfferId(null);
    setMessage("Offer saved.");
    await loadAdminData();
  }

  async function deleteOffer(id: string) {
    if (!supabase || !window.confirm("Delete this offer?")) return;
    await supabase.from("offers").delete().eq("id", id);
    await loadAdminData();
  }

  function editOffer(offer: AdminOffer) {
    const { id, ...draft } = offer;
    setEditingOfferId(id);
    setOfferDraft(draft);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, ...settings });

    setBusy(false);
    setMessage(error ? error.message : "Settings saved.");
  }

  if (!supabase) {
    return (
      <main className="admin-shell">
        <section className="admin-setup-card">
          <p className="admin-kicker">KLEID.IN ADMIN</p>
          <h1>Connect Supabase</h1>
          <p>
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY,
            then run supabase/schema.sql.
          </p>
        </section>
      </main>
    );
  }

  if (status === "loading") {
    return <main className="admin-shell"><p>Loading admin…</p></main>;
  }

  if (status === "signed-out") {
    return (
      <main className="admin-auth-page">
        <form className="admin-login-card" onSubmit={signIn}>
          <p className="admin-kicker">KLEID.IN ADMIN</p>
          <h1>Sign in</h1>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {message ? <p className="admin-message">{message}</p> : null}
          <button className="admin-primary-button" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  if (status === "not-admin") {
    return (
      <main className="admin-auth-page">
        <section className="admin-login-card">
          <p className="admin-kicker">ACCESS</p>
          <h1>Admin permission required</h1>
          <p>This account is signed in but is not marked as an admin.</p>
          <button className="admin-primary-button" onClick={signOut}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-logo">KLEID.IN</p>
          <span>Commerce Admin</span>
        </div>

        <nav>
          {(["overview", "products", "offers", "settings"] as const).map((item) => (
            <button
              type="button"
              key={item}
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <button type="button" className="admin-signout" onClick={signOut}>
          Sign out
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">ADMIN PANEL</p>
            <h1>{tab}</h1>
          </div>
          <a href="/" target="_blank" rel="noreferrer">View store ↗</a>
        </header>

        {message ? <div className="admin-toast">{message}</div> : null}

        {tab === "overview" ? (
          <div className="admin-overview">
            <div className="admin-stat-grid">
              <article><span>Total products</span><strong>{stats.total}</strong></article>
              <article><span>Active products</span><strong>{stats.active}</strong></article>
              <article><span>Low stock</span><strong>{stats.lowStock}</strong></article>
              <article><span>Active offers</span><strong>{stats.offers}</strong></article>
            </div>

            <section className="admin-panel-card">
              <div className="admin-card-head">
                <h2>Inventory snapshot</h2>
                <button onClick={() => setTab("products")}>Manage products →</button>
              </div>
              <div className="admin-mini-list">
                {products.slice(0, 6).map((product) => (
                  <div key={product.id}>
                    <span>{product.name}</span>
                    <small>{product.stock} in stock</small>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "products" ? (
          <div className="admin-two-column">
            <form className="admin-form-card" onSubmit={saveProduct}>
              <div className="admin-card-head">
                <h2>{editingProductId ? "Edit product" : "Add product"}</h2>
                {editingProductId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setProductDraft(emptyProduct);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <div className="admin-form-grid">
                <label>
                  Product name
                  <input
                    value={productDraft.name}
                    onChange={(e) =>
                      setProductDraft((p) => ({
                        ...p,
                        name: e.target.value,
                        slug: p.slug || slugify(e.target.value),
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  SKU
                  <input
                    value={productDraft.sku}
                    onChange={(e) => setProductDraft((p) => ({ ...p, sku: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Slug
                  <input
                    value={productDraft.slug}
                    onChange={(e) => setProductDraft((p) => ({ ...p, slug: slugify(e.target.value) }))}
                    required
                  />
                </label>
                <label>
                  Category
                  <select
                    value={productDraft.category}
                    onChange={(e) => setProductDraft((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option>T-Shirts</option>
                    <option>Shirts</option>
                    <option>Overshirts</option>
                    <option>Accessories</option>
                  </select>
                </label>
                <label>
                  Price
                  <input
                    type="number"
                    min="0"
                    value={productDraft.price}
                    onChange={(e) => setProductDraft((p) => ({ ...p, price: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Compare price
                  <input
                    type="number"
                    min="0"
                    value={productDraft.compare_at_price ?? ""}
                    onChange={(e) =>
                      setProductDraft((p) => ({
                        ...p,
                        compare_at_price: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={productDraft.stock}
                    onChange={(e) => setProductDraft((p) => ({ ...p, stock: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Sort order
                  <input
                    type="number"
                    value={productDraft.sort_order}
                    onChange={(e) => setProductDraft((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Sizes
                  <input
                    value={productDraft.sizes.join(", ")}
                    onChange={(e) => setProductDraft((p) => ({
                      ...p,
                      sizes: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                    }))}
                  />
                </label>
                <label>
                  Colors
                  <input
                    value={productDraft.colors.join(", ")}
                    onChange={(e) => setProductDraft((p) => ({
                      ...p,
                      colors: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                    }))}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={productDraft.status}
                    onChange={(e) =>
                      setProductDraft((p) => ({
                        ...p,
                        status: e.target.value as AdminProduct["status"],
                      }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="sold-out">Sold out</option>
                  </select>
                </label>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={productDraft.featured}
                    onChange={(e) => setProductDraft((p) => ({ ...p, featured: e.target.checked }))}
                  />
                  Featured
                </label>
              </div>

              <label>
                Description
                <textarea
                  rows={4}
                  value={productDraft.description}
                  onChange={(e) => setProductDraft((p) => ({ ...p, description: e.target.value }))}
                />
              </label>

              <div className="admin-upload-grid">
                <label className="admin-upload">
                  Main image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadProductImage(file, "image_url");
                    }}
                  />
                  {productDraft.image_url ? (
                    <Image src={productDraft.image_url} alt="" width={120} height={150} />
                  ) : <span>Choose image</span>}
                </label>

                <label className="admin-upload">
                  Try-on PNG
                  <input
                    type="file"
                    accept="image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadProductImage(file, "try_on_image_url");
                    }}
                  />
                  {productDraft.try_on_image_url ? (
                    <Image src={productDraft.try_on_image_url} alt="" width={120} height={150} />
                  ) : <span>Choose transparent garment</span>}
                </label>
              </div>

              <button className="admin-primary-button" disabled={busy} type="submit">
                {busy ? "Saving…" : editingProductId ? "Update product" : "Create product"}
              </button>
            </form>

            <section className="admin-panel-card">
              <div className="admin-card-head">
                <h2>Products</h2>
                <span>{products.length}</span>
              </div>
              <div className="admin-product-list">
                {products.map((product) => (
                  <article key={product.id}>
                    <div className="admin-product-thumb">
                      {product.image_url ? (
                        <Image src={product.image_url} alt="" fill sizes="64px" />
                      ) : null}
                    </div>
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.sku} · ₹{product.price}</span>
                    </div>
                    <small>{product.stock}</small>
                    <button onClick={() => editProduct(product)}>Edit</button>
                    <button onClick={() => deleteProduct(product.id)}>Delete</button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "offers" ? (
          <div className="admin-two-column">
            <form className="admin-form-card" onSubmit={saveOffer}>
              <div className="admin-card-head">
                <h2>{editingOfferId ? "Edit offer" : "Create offer"}</h2>
                {editingOfferId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOfferId(null);
                      setOfferDraft(emptyOffer);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <div className="admin-form-grid">
                <label>
                  Internal title
                  <input value={offerDraft.title} onChange={(e) => setOfferDraft((o) => ({ ...o, title: e.target.value }))} />
                </label>
                <label>
                  Badge
                  <input value={offerDraft.badge} onChange={(e) => setOfferDraft((o) => ({ ...o, badge: e.target.value }))} />
                </label>
                <label>
                  Discount text
                  <input value={offerDraft.discount_text} onChange={(e) => setOfferDraft((o) => ({ ...o, discount_text: e.target.value }))} />
                </label>
                <label>
                  CTA label
                  <input value={offerDraft.cta_label} onChange={(e) => setOfferDraft((o) => ({ ...o, cta_label: e.target.value }))} />
                </label>
                <label>
                  CTA href
                  <input value={offerDraft.cta_href} onChange={(e) => setOfferDraft((o) => ({ ...o, cta_href: e.target.value }))} />
                </label>
                <label>
                  Priority
                  <input type="number" value={offerDraft.priority} onChange={(e) => setOfferDraft((o) => ({ ...o, priority: Number(e.target.value) }))} />
                </label>
                <label>
                  Starts at
                  <input type="datetime-local" value={offerDraft.starts_at?.slice(0, 16) ?? ""} onChange={(e) => setOfferDraft((o) => ({ ...o, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
                </label>
                <label>
                  Ends at
                  <input type="datetime-local" value={offerDraft.ends_at?.slice(0, 16) ?? ""} onChange={(e) => setOfferDraft((o) => ({ ...o, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
                </label>
                <label className="admin-checkbox">
                  <input type="checkbox" checked={offerDraft.enabled} onChange={(e) => setOfferDraft((o) => ({ ...o, enabled: e.target.checked }))} />
                  Enabled
                </label>
              </div>

              <label>
                Description
                <textarea rows={3} value={offerDraft.description} onChange={(e) => setOfferDraft((o) => ({ ...o, description: e.target.value }))} />
              </label>

              <label>
                Image URL
                <input value={offerDraft.image_url} onChange={(e) => setOfferDraft((o) => ({ ...o, image_url: e.target.value }))} />
              </label>

              <label className="admin-upload admin-offer-upload">
                Offer image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadOfferImage(file);
                  }}
                />
                {offerDraft.image_url ? (
                  <Image src={offerDraft.image_url} alt="" width={260} height={150} />
                ) : (
                  <span>Choose offer image</span>
                )}
              </label>

              <button className="admin-primary-button" disabled={busy} type="submit">
                {busy ? "Saving…" : editingOfferId ? "Update offer" : "Create offer"}
              </button>
            </form>

            <section className="admin-panel-card">
              <div className="admin-card-head">
                <h2>Offers</h2>
                <span>{offers.length}</span>
              </div>
              <div className="admin-offer-list">
                {offers.map((offer) => (
                  <article key={offer.id}>
                    <div>
                      <strong>{offer.badge} · {offer.discount_text}</strong>
                      <span>{offer.enabled ? "Enabled" : "Disabled"} · priority {offer.priority}</span>
                    </div>
                    <button onClick={() => editOffer(offer)}>Edit</button>
                    <button onClick={() => deleteOffer(offer.id)}>Delete</button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "settings" ? (
          <form className="admin-form-card admin-settings-form" onSubmit={saveSettings}>
            <h2>Store settings</h2>
            <label>
              WhatsApp number
              <input
                value={settings.whatsapp_number}
                placeholder="91XXXXXXXXXX"
                onChange={(e) => setSettings((s) => ({ ...s, whatsapp_number: e.target.value.replace(/\D/g, "") }))}
              />
            </label>
            <label>
              Announcement text
              <input value={settings.announcement_text} onChange={(e) => setSettings((s) => ({ ...s, announcement_text: e.target.value }))} />
            </label>
            <label>
              Announcement link label
              <input value={settings.announcement_link_label} onChange={(e) => setSettings((s) => ({ ...s, announcement_link_label: e.target.value }))} />
            </label>
            <label>
              Instagram URL
              <input value={settings.instagram_url} onChange={(e) => setSettings((s) => ({ ...s, instagram_url: e.target.value }))} />
            </label>
            <label>
              Support email
              <input type="email" value={settings.support_email} onChange={(e) => setSettings((s) => ({ ...s, support_email: e.target.value }))} />
            </label>
            <button className="admin-primary-button" disabled={busy} type="submit">
              {busy ? "Saving…" : "Save settings"}
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
