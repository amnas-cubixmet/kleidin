"use client";

import { useMemo, useState, useEffect } from "react";
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

export function AdminOrdersManager({ products }: { products: ProductOption[] }) {
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

    const normalizedItems: AdminOrderItem[] = items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          id: item.id,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          size: item.size || undefined,
          color: item.color || undefined,
          quantity: Math.max(1, Number(item.quantity) || 1),
          unitPrice: Math.max(0, Number(item.unitPrice) || 0),
          unitCost: Math.max(0, Number(item.unitCost) || 0),
        };
      })
      .filter((item): item is AdminOrderItem => Boolean(item));

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

    persist([order, ...orders]);
    resetForm();
  }

  function updateOrderStatus(orderId: string, nextStatus: AdminOrderStatus) {
    persist(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: nextStatus, updatedAt: new Date().toISOString() }
          : order,
      ),
    );
  }

  function deleteOrder(orderId: string) {
    if (!window.confirm("Delete this order?")) return;
    persist(orders.filter((order) => order.id !== orderId));
  }

  const inputClass =\n    "h-10 w-full min-w-0 rounded-[10px] border border-[#d9dee7] bg-white px-3 text-[11px] font-medium text-[#20242a] outline-none transition placeholder:text-[#9aa1ac] focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10 sm:h-11";
  const labelClass =\n    "text-[8px] font-bold uppercase tracking-[.1em] text-[#6f7783]";

  return (
    <div className="grid min-w-0 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)]">
      <form
        onSubmit={saveOrder}
        className="min-w-0 rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-4 md:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[.13em] text-[#001cac]">
              Manual entry
            </p>
            <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-.04em]">
              Add order
            </h2>
            <p className="mt-1 text-[8px] leading-4 text-[#6a7280]">
              Enter the customer, delivery address and product details yourself.
            </p>
          </div>
          <span className="rounded-full bg-[#eef2ff] px-2.5 py-1.5 text-[8px] font-bold text-[#001cac]">
            Admin order
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

        <div className="mt-4 rounded-[14px] bg-[#f7f8fb] p-3 sm:mt-5 sm:rounded-[16px] sm:p-3.5">
          <div className="mb-3">
            <p className="text-[8px] font-bold uppercase tracking-[.12em] text-[#59616d]">
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
            <p className="text-[8px] font-bold uppercase tracking-[.12em] text-[#59616d]">
              Products
            </p>
            <button type="button" onClick={addItem} className="min-h-8 rounded-full bg-[#eef2ff] px-3 text-[8px] font-bold text-[#001cac]">
              + Add item
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            {items.map((item, index) => {
              const product = productMap.get(item.productId);
              return (
                <div key={item.id} className="rounded-[14px] border border-[#dfe3ea] p-3 sm:rounded-[16px] sm:p-3.5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <strong className="text-[9px] font-bold">Item {index + 1}</strong>
                    {items.length > 1 ? (
                      <button type="button" onClick={() => removeItem(item.id)} className="text-[8px] font-bold text-[#b42318]">
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

        <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-[14px] bg-[#f7f8fb] p-2.5 sm:mt-5 sm:gap-2 sm:rounded-[16px] sm:p-3">
          <div>
            <span className="text-[7px] font-bold uppercase tracking-[.1em] text-[#7b8490]">Subtotal</span>
            <strong className="mt-1 block text-[13px] sm:text-[14px]">{money(subtotal)}</strong>
          </div>
          <div>
            <span className="text-[7px] font-bold uppercase tracking-[.1em] text-[#7b8490]">Order total</span>
            <strong className="mt-1 block text-[13px] sm:text-[14px]">{money(total)}</strong>
          </div>
          <div>
            <span className="text-[7px] font-bold uppercase tracking-[.1em] text-[#7b8490]">Est. profit</span>
            <strong className={"mt-1 block text-[13px] sm:text-[14px] " + (estimatedProfit < 0 ? "text-[#b42318]" : "text-[#18794e]")}>
              {money(estimatedProfit)}
            </strong>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-[12px] border border-[#efc0c0] bg-[#fff5f5] px-3 py-2.5 text-[8px] font-semibold text-[#a43a3a]">
            {error}
          </div>
        ) : null}

        <button type="submit" className="mt-4 min-h-9 rounded-full bg-[#001cac] px-5 text-[9px] font-bold text-white transition hover:bg-[#00158a] sm:mt-5 sm:min-h-10">
          Save order
        </button>
      </form>

      <section className="min-w-0 rounded-[18px] border border-[#dfe3ea] bg-white p-3.5 sm:rounded-[20px] sm:p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[.13em] text-[#001cac]">
              Orders
            </p>
            <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-.04em]">
              Manual orders
            </h2>
            <p className="mt-1 text-[8px] leading-4 text-[#6a7280]">
              {orders.length} saved order{orders.length === 1 ? "" : "s"} on this device.
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-[11px] border border-[#d9dee7] bg-[#f8f9fb] px-3 text-[10px] font-medium outline-none placeholder:text-[#969da8] focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10 sm:w-[280px]"
            placeholder="Search orders"
          />
        </div>

        {filteredOrders.length ? (
          <div className="mt-4 grid gap-3">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-[15px] border border-[#dfe3ea] p-3 sm:rounded-[17px] sm:p-3.5 md:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-[10px] font-bold">{order.orderNumber}</strong>
                      <span className="rounded-full bg-[#eef2ff] px-2 py-1 text-[7px] font-bold text-[#001cac]">
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-[8px] text-[#6b7380]">
                      {order.customerName} · {order.phone}
                    </p>
                    <p className="mt-1 text-[7px] text-[#8a919b]">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <strong className="block text-[18px] font-semibold tracking-[-.04em]">
                      {money(getOrderTotal(order))}
                    </strong>
                    <span className={"mt-1 block text-[8px] font-bold " + (getOrderProfit(order) < 0 ? "text-[#b42318]" : "text-[#18794e]")}>
                      Profit {money(getOrderProfit(order))}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 rounded-[13px] bg-[#f7f8fb] p-3 sm:grid-cols-2">
                  <div>
                    <span className="text-[7px] font-bold uppercase tracking-[.1em] text-[#7d8490]">Delivery</span>
                    <p className="mt-1 text-[8px] leading-4 text-[#4e5662]">
                      {order.addressLine1}
                      {order.addressLine2 ? ", " + order.addressLine2 : ""}
                      {order.landmark ? ", " + order.landmark : ""}
                      <br />
                      {order.city}, {order.state} — {order.pincode}
                    </p>
                  </div>
                  <div>
                    <span className="text-[7px] font-bold uppercase tracking-[.1em] text-[#7d8490]">Items</span>
                    <div className="mt-1 grid gap-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-[8px] leading-4 text-[#4e5662]">
                          {item.quantity} × {item.name}
                          {item.size ? " · " + item.size : ""}
                          {item.color ? " · " + item.color : ""}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {order.notes ? (
                  <p className="mt-2 rounded-[12px] border border-[#e4e7ed] px-3 py-2 text-[8px] leading-4 text-[#626a76]">
                    {order.notes}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#edf0f4] pt-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as AdminOrderStatus)}
                    className="min-h-8 rounded-full border border-[#d9dee7] bg-white px-3 text-[8px] font-bold text-[#414852] outline-none"
                  >
                    {statusOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteOrder(order.id)}
                    className="ml-auto min-h-8 rounded-full border border-[#efd0d0] bg-white px-3 text-[8px] font-bold text-[#a33d3d]"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid min-h-[220px] place-items-center rounded-[14px] bg-[#f7f8fb] px-5 text-center sm:min-h-[300px] sm:rounded-[16px]">
            <div>
              <strong className="text-[11px] font-semibold">No orders yet</strong>
              <p className="mt-1.5 text-[8px] leading-4 text-[#737b87]">
                Add the first manual order using the form.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
