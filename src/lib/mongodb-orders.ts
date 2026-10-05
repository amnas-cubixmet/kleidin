import type {
  AdminOrder,
  AdminOrderItem,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/lib/admin-orders";
import { getMongoDatabase } from "@/lib/mongodb";

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
  createdAt?: string;
};

type OrderDocument = AdminOrder & {
  isDemo?: boolean;
};

function makeOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 6)
    .toUpperCase();
  return `KLD-${date}-${suffix}`;
}

function normalizeItems(
  items: AdminOrderWriteInput["items"],
): AdminOrderItem[] {
  return items.map((item) => ({
    id: item.id || crypto.randomUUID(),
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    size: item.size,
    color: item.color,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    unitCost: Number(item.unitCost),
  }));
}

function toDocument(
  input: AdminOrderWriteInput,
  existing?: OrderDocument | null,
): OrderDocument {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? crypto.randomUUID(),
    orderNumber: existing?.orderNumber ?? makeOrderNumber(),
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    updatedAt: now,
    customerName: input.customerName,
    phone: input.phone,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2,
    landmark: input.landmark,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    items: normalizeItems(input.items),
    deliveryCharge: Number(input.deliveryCharge),
    shippingCost: Number(input.shippingCost),
    discount: Number(input.discount),
    paymentStatus: input.paymentStatus,
    status: input.status,
    notes: input.notes,
  };
}

function toOrder(doc: OrderDocument): AdminOrder {
  return {
    id: doc.id,
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    customerName: doc.customerName,
    phone: doc.phone,
    addressLine1: doc.addressLine1,
    addressLine2: doc.addressLine2,
    landmark: doc.landmark,
    city: doc.city,
    state: doc.state,
    pincode: doc.pincode,
    items: doc.items ?? [],
    deliveryCharge: Number(doc.deliveryCharge),
    shippingCost: Number(doc.shippingCost),
    discount: Number(doc.discount),
    paymentStatus: doc.paymentStatus,
    status: doc.status,
    notes: doc.notes,
  };
}

export async function listOrders() {
  const db = await getMongoDatabase();
  const rows = await db
    .collection<OrderDocument>("orders")
    .find({ isDemo: { $ne: true } })
    .sort({ createdAt: -1 })
    .toArray();

  return rows.map(toOrder);
}

export async function getOrder(id: string) {
  const db = await getMongoDatabase();
  const row = await db
    .collection<OrderDocument>("orders")
    .findOne({ id, isDemo: { $ne: true } });
  return row ? toOrder(row) : null;
}

export async function createOrder(input: AdminOrderWriteInput) {
  const db = await getMongoDatabase();
  const document = toDocument(input);
  await db.collection<OrderDocument>("orders").insertOne(document);
  return toOrder(document);
}

export async function updateOrder(id: string, input: AdminOrderWriteInput) {
  const db = await getMongoDatabase();
  const collection = db.collection<OrderDocument>("orders");
  const existing = await collection.findOne({ id, isDemo: { $ne: true } });
  if (!existing) return null;

  const document = toDocument(input, existing);
  await collection.replaceOne({ id, isDemo: { $ne: true } }, document);
  return toOrder(document);
}

export async function updateOrderStatus(
  id: string,
  status: AdminOrderStatus,
) {
  const db = await getMongoDatabase();
  const result = await db.collection<OrderDocument>("orders").findOneAndUpdate(
    { id, isDemo: { $ne: true } },
    {
      $set: {
        status,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: "after" },
  );

  return result ? toOrder(result) : null;
}

export async function deleteOrder(id: string) {
  const db = await getMongoDatabase();
  await db.collection<OrderDocument>("orders").deleteOne({ id, isDemo: { $ne: true } });
}

