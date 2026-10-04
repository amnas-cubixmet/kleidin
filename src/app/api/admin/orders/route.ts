import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createOrder,
  listOrders,
  type AdminOrderWriteInput,
} from "@/lib/supabase-orders";
import type {
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/lib/admin-orders";
import { isProductDatabaseConfigured } from "@/lib/supabase-products";

export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function parse(body: Record<string, unknown>): AdminOrderWriteInput {
  const status = text(body.status) as AdminOrderStatus;
  const paymentStatus = text(body.paymentStatus) as AdminPaymentStatus;
  const rawItems = Array.isArray(body.items) ? body.items : [];

  return {
    customerName: text(body.customerName),
    phone: text(body.phone),
    addressLine1: text(body.addressLine1),
    addressLine2: text(body.addressLine2) || undefined,
    landmark: text(body.landmark) || undefined,
    city: text(body.city),
    state: text(body.state),
    pincode: text(body.pincode),
    items: rawItems.reduce<AdminOrderWriteInput["items"]>((result, item) => {
      if (!item || typeof item !== "object") return result;
      const row = item as Record<string, unknown>;
      const productId = text(row.productId);
      const name = text(row.name);
      const sku = text(row.sku);
      if (!productId || !name || !sku) return result;

      result.push({
        productId,
        name,
        sku,
        size: text(row.size) || undefined,
        color: text(row.color) || undefined,
        quantity: Math.max(1, Math.floor(number(row.quantity) || 1)),
        unitPrice: number(row.unitPrice),
        unitCost: number(row.unitCost),
      });
      return result;
    }, []),
    deliveryCharge: number(body.deliveryCharge),
    shippingCost: number(body.shippingCost),
    discount: number(body.discount),
    paymentStatus: ["Pending", "Paid", "Cash on Delivery"].includes(paymentStatus)
      ? paymentStatus
      : "Pending",
    status: ["New", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].includes(status)
      ? status
      : "New",
    notes: text(body.notes) || undefined,
  };
}

function validate(input: AdminOrderWriteInput) {
  if (!input.customerName || !input.phone) {
    return "Customer name and phone number are required.";
  }
  if (!input.addressLine1 || !input.city || !input.state || !/^d{6}$/.test(input.pincode)) {
    return "Complete delivery address and valid 6-digit pincode are required.";
  }
  if (!input.items.length) return "Add at least one product.";
  return null;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isProductDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json({ orders: await listOrders() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load orders." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = parse(body);
    const error = validate(input);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const order = await createOrder(input);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create order." },
      { status: 500 },
    );
  }
}
