"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type AdminOrder,
  type AdminOrderItem,
  type AdminOrderStatus,
  type AdminPaymentStatus,
  readAdminOrders,
  writeAdminOrders,
  getOrderTotal,
  getOrderProfit,
  ADMIN_ORDERS_UPDATED_EVENT,
} from "@/lib/admin-orders";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  price: number;
  sizes: string[];
  colors: string[];
};

type OrderItemDraft = {
  id: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
};

const statusOptions: AdminOrderStatus[] = [
  "New",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const paymentOptions: AdminPaymentStatus[] = [
  "Pending",
  "Paid",
  "Cash on Delivery",
];

function emptyItem(products: ProductOption[]): OrderItemDraft {
  const first = products[0];
  return {
    id: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    productId: first?.id ?? "",
    size: first?.sizes?.[0] ?? "",
    color: first?.colors?.[0] ?? "",
    quantity: 1,
    unitPrice: first?.price ?? 0,
    unitCost: 0,
  };
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function makeOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = String(now.getTime()).slice(-5);
  return "KLD-" + y + m + d + "-" + suffix;
}

export function AdminOrdersManager({
  products,
  view = "list",
  orderId,
}: {
  products: ProductOption[];
  view?: "list" | "create" | "edit";
  orderId?: string;
}) {
  const router = useRouter();
  const editInitialized = useRef(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Kerala");
  const [pincode, setPincode] = useState("");
  const [items, setItems] = useState<OrderItemDraft[]>(() => [emptyItem(products)]);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<AdminPaymentStatus>("Pending");
  const [status, setStatus] = useState<AdminOrderStatus>("New");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const sync = () => setOrders(readAdminOrders());
    sync();
    window.addEventListener(ADMIN_ORDERS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ADMIN_ORDERS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (view !== "edit" || !orderId || editInitialized.current) return;
    const existing = orders.find((order) => order.id === orderId);
    if (!existing) return;

    setCustomerName(existing.customerName);
    setPhone(existing.phone);
    setAddressLine1(existing.addressLine1);
    setAddressLine2(existing.addressLine2 ?? "");
    setLandmark(existing.landmark ?? "");
    setCity(existing.city);
    setStateName(existing.state);
    setPincode(existing.pincode);
    setItems(
      existing.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        size: item.size ?? "",
        color: item.color ?? "",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost,
      })),
    );
    setDeliveryCharge(existing.deliveryCharge);
    setShippingCost(existing.shippingCost);
    setDiscount(existing.discount);
    setPaymentStatus(existing.paymentStatus);
    setStatus(existing.status);
    setNotes(existing.notes ?? "");
    editInitialized.current = true;
  }, [orders, orderId, view]);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const subtotal = items.reduce(
    (sum, item) => sum + Math.max(0, item.unitPrice) * Math.max(1, item.quantity),
    0,
  );
  const total = Math.max(0, subtotal + deliveryCharge - discount);
  const productCost = items.reduce(
    (sum, item) => sum + Math.max(0, item.unitCost) * Math.max(1, item.quantity),
    0,
  );
  const estimatedProfit = total - productCost - shippingCost;

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) =>
      [
        order.orderNumber,
        order.customerName,
        order.phone,
        order.city,
        order.pincode,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [orders, search]);

  function persist(next: AdminOrder[]) {
    setOrders(next);
    writeAdminOrders(next);
  }

  function updateItem(id: string, patch: Partial<OrderItemDraft>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function selectProduct(itemId: string, productId: string) {
    const product = productMap.get(productId);
    updateItem(itemId, {
      productId,
      size: product?.sizes?.[0] ?? "",
      color: product?.colors?.[0] ?? "",
      unitPrice: product?.price ?? 0,
    });
  }

  function addItem() {
    setItems((current) => [...current, emptyItem(products)]);
  }

  function removeItem(id: string) {
    setItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id),
    );
  }

  function resetForm() {
    setCustomerName("");
    setPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setLandmark("");
    setCity("");
    setStateName("Kerala");
    setPincode("");
    setItems([emptyItem(products)]);
    setDeliveryCharge(0);
    setShippingCost(0);
    setDiscount(0);
    setPaymentStatus("Pending");
    setStatus("New");
    setNotes("");
    setError("");
  }

  function saveOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customerName.trim() || !phone.trim()) {
      setError("Customer name and phone number are required.");
      return;
    }

    if (!addressLine1.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
      setError("Delivery address, city, state and pincode are required.");
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    const normalizedItems = items.reduce<AdminOrderItem[]>((result, item) => {
      const product = productMap.get(item.productId);
      if (!product) return result;

      result.push({
        id: item.id,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        size: item.size || undefined,
        color: item.color || undefined,
        quantity: Math.max(1, Number(item.quantity) || 1),
        unitPrice: Math.max(0, Number(item.unitPrice) || 0),
        unitCost: Math.max(0, Number(item.unitCost) || 0),
      });

      return result;
    }, []);

    if (!normalizedItems.length) {
      setError("Add at least one valid product.");
      return;
    }

    const now = new Date().toISOString();
    const order: AdminOrder = {
      id: "order-" + Date.now(),
      orderNumber: makeOrderNumber(),
      createdAt: now,
      updatedAt: now,
      customerName: customerName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      items: normalizedItems,
      deliveryCharge: Math.max(0, Number(deliveryCharge) || 0),
      shippingCost: Math.max(0, Number(shippingCost) || 0),
      discount: Math.max(0, Number(discount) || 0),
      paymentStatus,
      status,
      notes: notes.trim() || undefined,
    };

    if (view === "edit" && orderId) {
      const existing = orders.find((item) => item.id === orderId);
      if (!existing) {
        setError("Order not found.");
        return;
      }

      const updated: AdminOrder = {
        ...existing,
        ...order,
        id: existing.id,
        orderNumber: existing.orderNumber,
        createdAt: existing.createdAt,
        updatedAt: now,
      };

      persist(orders.map((item) => (item.id === orderId ? updated : item)));
      router.push("/admin/orders/" + orderId);
      return;
    }

    persist([order, ...orders]);
    resetForm();
    router.push("/admin/orders/" + order.id);
  }

  const inputClass =
    "h-11 w-full min-w-0 rounded-[11px] border border-[#d5d9df] bg-white px-3.5 text-[11px] font-medium text-[#20242a] outline-none transition placeholder:text-[#9aa1ac] focus:border-[#111111] focus:ring-2 focus:ring-black/10 sm:h-12";
  const labelClass =
    "text-[9px] font-bold uppercase tracking-[.09em] text-[#626a75]";

  return (
    <div className="min-w-0">
      {view !== "list" ? (
      <form
        onSubmit={saveOrder}
        className="min-w-0 rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Manual entry
            </p>
            <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em] sm:text-[30px]">
              {view === "edit" ? "Edit order" : "Add order"}
            </h2>
            <p className="mt-1.5 text-[10px] leading-5 text-[#626a75] sm:text-[11px]">
              Enter the customer, delivery address and product details yourself.
            </p>
          </div>
          <span className="inline-flex min-h-[34px] items-center rounded-full bg-[#111111] px-3.5 text-[9px] font-bold text-white">
            {view === "edit" ? "Editing" : "Admin order"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelClass}>Customer name</span>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} placeholder="Full name" />
          </label>
          <label className="grid gap-1.5">
            <span className={labelClass}>Phone number</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} inputMode="tel" placeholder="+91 / mobile number" />
          </label>
        </div>

        <div className="mt-5 rounded-[16px] bg-[#f5f5f5] p-4 sm:rounded-[18px] sm:p-5">
          <div className="mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#555d68]">
              Delivery address
            </p>
          </div>
          <div className="grid gap-3">
            <label className="grid gap-1.5">
              <span className={labelClass}>Address line 1</span>
              <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className={inputClass} placeholder="House / building / street" />
            </label>
            <label className="grid gap-1.5">
              <span className={labelClass}>Address line 2</span>
              <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={inputClass} placeholder="Area / locality / optional" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className={labelClass}>Landmark</span>
                <input value={landmark} onChange={(e) => setLandmark(e.target.value)} className={inputClass} placeholder="Optional" />
              </label>
              <label className="grid gap-1.5">
                <span className={labelClass}>City</span>
                <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="City / town" />
              </label>
              <label className="grid gap-1.5">
                <span className={labelClass}>State</span>
                <input value={stateName} onChange={(e) => setStateName(e.target.value)} className={inputClass} placeholder="State" />
              </label>
              <label className="grid gap-1.5">
                <span className={labelClass}>Pincode</span>
                <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} className={inputClass} inputMode="numeric" placeholder="6-digit pincode" />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#555d68]">
              Products
            </p>
            <button type="button" onClick={addItem} className="min-h-[44px] rounded-full bg-[#111111] px-4 text-[10px] font-bold text-white transition hover:bg-black">
              + Add item
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            {items.map((item, index) => {
              const product = productMap.get(item.productId);
              return (
                <div key={item.id} className="rounded-[16px] border border-[#d9dde3] bg-white p-4 sm:rounded-[18px] sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <strong className="text-[11px] font-bold">Item {index + 1}</strong>
                    {items.length > 1 ? (
                      <button type="button" onClick={() => removeItem(item.id)} className="inline-flex min-h-[40px] items-center px-2 text-[9px] font-bold text-[#b42318]">
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 sm:col-span-2">
                      <span className={labelClass}>Product</span>
                      <select value={item.productId} onChange={(e) => selectProduct(item.id, e.target.value)} className={inputClass}>
                        {products.map((productOption) => (
                          <option key={productOption.id} value={productOption.id}>
                            {productOption.name} — {productOption.sku}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5">
                      <span className={labelClass}>Size</span>
                      <select value={item.size} onChange={(e) => updateItem(item.id, { size: e.target.value })} className={inputClass}>
                        {(product?.sizes ?? []).map((size) => <option key={size}>{size}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-1.5">
                      <span className={labelClass}>Color</span>
                      <select value={item.color} onChange={(e) => updateItem(item.id, { color: e.target.value })} className={inputClass}>
                        {(product?.colors ?? []).map((color) => <option key={color}>{color}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-1.5">
                      <span className={labelClass}>Qty</span>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })} className={inputClass} />
                    </label>
                    <label className="grid gap-1.5">
                      <span className={labelClass}>Selling price / item</span>
                      <input type="number" min="0" value={item.unitPrice} onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })} className={inputClass} />
                    </label>
                    <label className="grid gap-1.5 sm:col-span-2">
                      <span className={labelClass}>Your cost / item</span>
                      <input type="number" min="0" value={item.unitCost} onChange={(e) => updateItem(item.id, { unitCost: Number(e.target.value) })} className={inputClass} placeholder="Used to calculate profit" />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <span className={labelClass}>Delivery charge</span>
            <input type="number" min="0" value={deliveryCharge} onChange={(e) => setDeliveryCharge(Number(e.target.value))} className={inputClass} />
          </label>
          <label className="grid gap-1.5">
            <span className={labelClass}>Shipping cost</span>
            <input type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(Number(e.target.value))} className={inputClass} />
          </label>
          <label className="grid gap-1.5">
            <span className={labelClass}>Discount</span>
            <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className={inputClass} />
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelClass}>Payment</span>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as AdminPaymentStatus)} className={inputClass}>
              {paymentOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className={labelClass}>Order status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminOrderStatus)} className={inputClass}>
              {statusOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>

        <label className="mt-5 grid gap-1.5">
          <span className={labelClass}>Extra details / notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass + " min-h-[84px] resize-y py-3 sm:min-h-[92px]"} placeholder="Delivery instruction, customer request, reference, etc." />
        </label>

        <div className="mt-5 grid grid-cols-1 gap-2 rounded-[16px] bg-[#f3f3f3] p-4 xs:grid-cols-3 sm:rounded-[18px] sm:p-5">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#6e7681]">Subtotal</span>
            <strong className="mt-1 block text-[15px] sm:text-[17px]">{money(subtotal)}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#6e7681]">Order total</span>
            <strong className="mt-1 block text-[15px] sm:text-[17px]">{money(total)}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#6e7681]">Est. profit</span>
            <strong className={"mt-1 block text-[15px] sm:text-[17px] " + (estimatedProfit < 0 ? "text-[#b42318]" : "text-[#18794e]")}>
              {money(estimatedProfit)}
            </strong>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-[12px] border border-[#efc0c0] bg-[#fff5f5] px-3.5 py-3 text-[10px] font-semibold text-[#a43a3a]">
            {error}
          </div>
        ) : null}

        <button type="submit" className="mt-5 min-h-[46px] rounded-full bg-[#111111] px-6 text-[10px] font-bold text-white transition hover:bg-black">
          {view === "edit" ? "Save changes" : "Save order"}
        </button>
      </form>
      ) : null}

      {view === "list" ? (
      <section className="min-w-0 rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:rounded-[22px] sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Orders
            </p>
            <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em] sm:text-[30px]">
              Manual orders
            </h2>
            <p className="mt-1.5 text-[10px] leading-5 text-[#626a75] sm:text-[11px]">
              {orders.length} order{orders.length === 1 ? "" : "s"} saved on this device.
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[46px] w-full rounded-[12px] border border-[#d6dae0] bg-[#f6f6f6] px-4 text-[11px] font-medium text-[#20242a] outline-none placeholder:text-[#8e959f] focus:border-[#111111] focus:bg-white focus:ring-2 focus:ring-black/10 sm:w-[320px]"
            placeholder="Search orders"
          />
        </div>

        {filteredOrders.length ? (
          <div className="mt-4 grid gap-3">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-[18px] border border-[#d9dde3] bg-white p-4 transition hover:border-[#111111] hover:shadow-[0_10px_28px_rgba(16,24,40,.06)] sm:rounded-[20px] sm:p-5"
              >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(150px,.7fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-[12px] font-bold text-[#17191d]">
                        {order.orderNumber}
                      </strong>
                      <span className="rounded-full bg-[#111111] px-2.5 py-1.5 text-[8px] font-bold text-white">
                        {order.status}
                      </span>
                      <span className="rounded-full bg-[#f0f1f3] px-2.5 py-1.5 text-[8px] font-bold text-[#4f5762]">
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-[11px] font-semibold text-[#3f4650]">
                      {order.customerName} · {order.phone}
                    </p>
                    <p className="mt-1.5 text-[9px] text-[#858c96]">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-[14px] bg-[#f5f5f5] px-3.5 py-3 sm:bg-transparent sm:px-0 sm:py-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[.08em] text-[#747c86]">
                      Delivery
                    </span>
                    <p className="mt-1.5 truncate text-[10px] font-medium text-[#4c545f]">
                      {order.city}, {order.state} · {order.pincode}
                    </p>
                    <p className="mt-1.5 text-[9px] text-[#858c96]">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} item
                      {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-3 sm:block sm:text-right">
                    <div>
                      <strong className="block text-[20px] font-semibold tracking-[-.04em] text-[#17191d] sm:text-[22px]">
                        {money(getOrderTotal(order))}
                      </strong>
                      <span
                        className={
                          "mt-1.5 block text-[9px] font-bold " +
                          (getOrderProfit(order) < 0 ? "text-[#b42318]" : "text-[#2f343b]")
                        }
                      >
                        Profit {money(getOrderProfit(order))}
                      </span>
                    </div>
                    <Link
                      href={"/admin/orders/" + order.id}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#111111] px-5 text-[10px] font-bold text-white transition hover:bg-black sm:mt-2"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid min-h-[240px] place-items-center rounded-[16px] bg-[#f5f5f5] px-5 text-center sm:min-h-[300px] sm:rounded-[18px]">
            <div>
              <strong className="text-[13px] font-semibold">No orders yet</strong>
              <p className="mt-2 text-[10px] leading-5 text-[#68717b]">
                Use Add order to create your first manual order.
              </p>
            </div>
          </div>
        )}
      </section>
      ) : null}
    </div>
  );
}
