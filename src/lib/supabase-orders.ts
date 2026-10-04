import type {
  AdminOrder,
  AdminOrderItem,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/lib/admin-orders";
import { getSupabaseServerEnvironment } from "@/lib/server-env";

type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number;
};

type DbOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  delivery_charge: number;
  shipping_cost: number;
  discount: number;
  payment_status: AdminPaymentStatus;
  status: AdminOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: DbOrderItem[];
};

export type AdminOrderWriteInput = {
  customerName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<Omit<AdminOrderItem, "id"> & { id?: string }>;
  deliveryCharge: number;
  shippingCost: number;
  discount: number;
  paymentStatus: AdminPaymentStatus;
  status: AdminOrderStatus;
  notes?: string;
};

function envHeaders(extra?: HeadersInit) {
  const env = getSupabaseServerEnvironment();
  if (!env) throw new Error("Supabase is not configured.");

  return {
    apikey: env.serviceRoleKey,
    Authorization: `Bearer ${env.serviceRoleKey}`,
    ...extra,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const env = getSupabaseServerEnvironment();
  if (!env) throw new Error("Supabase is not configured.");

  const response = await fetch(`${env.url}${path}`, {
    ...init,
    headers: envHeaders(init?.headers),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function fromDbItem(item: DbOrderItem): AdminOrderItem {
  return {
    id: item.id,
    productId: item.product_id ?? "",
    name: item.product_name,
    sku: item.sku,
    size: item.size ?? undefined,
    color: item.color ?? undefined,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    unitCost: Number(item.unit_cost),
  };
}

function fromDb(row: DbOrder): AdminOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerName: row.customer_name,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2 ?? undefined,
    landmark: row.landmark ?? undefined,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    items: (row.order_items ?? []).map(fromDbItem),
    deliveryCharge: Number(row.delivery_charge),
    shippingCost: Number(row.shipping_cost),
    discount: Number(row.discount),
    paymentStatus: row.payment_status,
    status: row.status,
    notes: row.notes ?? undefined,
  };
}

function makeOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `KLD-${date}-${suffix}`;
}

function orderRow(input: AdminOrderWriteInput) {
  return {
    customer_name: input.customerName,
    phone: input.phone,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2 || null,
    landmark: input.landmark || null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    delivery_charge: input.deliveryCharge,
    shipping_cost: input.shippingCost,
    discount: input.discount,
    payment_status: input.paymentStatus,
    status: input.status,
    notes: input.notes || null,
    updated_at: new Date().toISOString(),
  };
}

function itemRows(orderId: string, items: AdminOrderWriteInput["items"]) {
  return items.map((item) => ({
    order_id: orderId,
    product_id: item.productId || null,
    product_name: item.name,
    sku: item.sku,
    size: item.size || null,
    color: item.color || null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    unit_cost: item.unitCost,
  }));
}

export async function listOrders() {
  const rows = await request<DbOrder[]>(
    "/rest/v1/orders?select=*,order_items(*)&order=created_at.desc",
  );
  return rows.map(fromDb);
}

export async function getOrder(id: string) {
  const rows = await request<DbOrder[]>(
    `/rest/v1/orders?id=eq.${encodeURIComponent(id)}&select=*,order_items(*)&limit=1`,
  );
  return rows[0] ? fromDb(rows[0]) : null;
}

export async function createOrder(input: AdminOrderWriteInput) {
  const rows = await request<DbOrder[]>("/rest/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...orderRow(input),
      order_number: makeOrderNumber(),
    }),
  });

  const created = rows[0];
  if (!created) throw new Error("Could not create order.");

  if (input.items.length) {
    await request<DbOrderItem[]>("/rest/v1/order_items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(itemRows(created.id, input.items)),
    });
  }

  return (await getOrder(created.id))!;
}

export async function updateOrder(id: string, input: AdminOrderWriteInput) {
  const rows = await request<DbOrder[]>(
    `/rest/v1/orders?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(orderRow(input)),
    },
  );

  if (!rows[0]) return null;

  await request<void>(
    `/rest/v1/order_items?order_id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    },
  );

  if (input.items.length) {
    await request<DbOrderItem[]>("/rest/v1/order_items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(itemRows(id, input.items)),
    });
  }

  return getOrder(id);
}

export async function updateOrderStatus(id: string, status: AdminOrderStatus) {
  const rows = await request<DbOrder[]>(
    `/rest/v1/orders?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  return rows[0] ? getOrder(id) : null;
}

export async function deleteOrder(id: string) {
  await request<void>(`/rest/v1/orders?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}
