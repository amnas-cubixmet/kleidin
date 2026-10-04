import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteOrder,
  getOrder,
  updateOrder,
  updateOrderStatus,
  type AdminOrderWriteInput,
} from "@/lib/mongodb-orders";
import type {
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/lib/admin-orders";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const order = await getOrder(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load order." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    if (Object.keys(body).length === 1 && body.status) {
      const status = text(body.status) as AdminOrderStatus;
      if (!["New", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].includes(status)) {
        return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
      }
      const order = await updateOrderStatus(id, status);
      if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
      return NextResponse.json({ order });
    }

    const input = parse(body);
    if (
      !input.customerName ||
      !input.phone ||
      !input.addressLine1 ||
      !input.city ||
      !input.state ||
      !/^d{6}$/.test(input.pincode) ||
      !input.items.length
    ) {
      return NextResponse.json({ error: "Complete order details are required." }, { status: 400 });
    }

    const order = await updateOrder(id, input);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update order." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteOrder(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete order." },
      { status: 500 },
    );
  }
}
