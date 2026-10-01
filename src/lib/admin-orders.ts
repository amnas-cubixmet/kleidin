export const ADMIN_ORDERS_STORAGE_KEY = "kleidin-admin-orders-v1";
export const ADMIN_ORDERS_UPDATED_EVENT = "kleidin:admin-orders-updated";

export type AdminOrderStatus =
  | "New"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type AdminPaymentStatus = "Pending" | "Paid" | "Cash on Delivery";

export type AdminOrderItem = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  phone: string;
  alternatePhone?: string;
  source: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  items: AdminOrderItem[];
  deliveryCharge: number;
  shippingCost: number;
  discount: number;
  paymentStatus: AdminPaymentStatus;
  status: AdminOrderStatus;
  notes?: string;
};

export function readAdminOrders(): AdminOrder[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ADMIN_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeAdminOrders(orders: AdminOrder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(ADMIN_ORDERS_UPDATED_EVENT));
}

export function getOrderSubtotal(order: AdminOrder) {
  return order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
}

export function getOrderTotal(order: AdminOrder) {
  return Math.max(0, getOrderSubtotal(order) + order.deliveryCharge - order.discount);
}

export function getOrderCost(order: AdminOrder) {
  return (
    order.items.reduce(
      (sum, item) => sum + item.unitCost * item.quantity,
      0,
    ) + order.shippingCost
  );
}

export function getOrderProfit(order: AdminOrder) {
  if (order.status === "Cancelled") return 0;
  return getOrderTotal(order) - getOrderCost(order);
}
