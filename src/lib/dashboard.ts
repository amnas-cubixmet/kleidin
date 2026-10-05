import "server-only";

import { getDb } from "@/lib/mongodb";
import { getInventorySummary } from "@/lib/mongodb-inventory";

export async function getDashboardMetrics() {
  const db = await getDb();
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    customerCount,
    productCount,
    activeProductCount,
    draftProductCount,
    featuredCount,
    revenueRows,
    inventory,
    recentOrders,
  ] = await Promise.all([
    db.collection("orders").countDocuments(),
    db.collection("orders").countDocuments({ createdAt: { $gte: startToday } }),
    db.collection("orders").countDocuments({
      status: { $in: ["new", "confirmed", "processing", "packed"] },
    }),
    db.collection("orders").countDocuments({ status: "delivered" }),
    db.collection("orders").countDocuments({ status: "cancelled" }),
    db.collection("customers").countDocuments(),
    db.collection("products").countDocuments(),
    db.collection("products").countDocuments({ status: "active" }),
    db.collection("products").countDocuments({ status: "draft" }),
    db.collection("products").countDocuments({ featured: true }),
    db
      .collection("orders")
      .aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ])
      .toArray(),
    getInventorySummary(),
    db.collection("orders").find({}).sort({ createdAt: -1 }).limit(8).toArray(),
  ]);

  return {
    totalOrders,
    todayOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalCustomers: customerCount,
    totalProducts: productCount,
    activeProducts: activeProductCount,
    draftProducts: draftProductCount,
    featuredProducts: featuredCount,
    revenue: Number(revenueRows[0]?.revenue ?? 0),
    totalStockUnits: inventory.totalUnits,
    lowStockProducts: inventory.lowStock,
    soldOutProducts: inventory.soldOut,
    recentOrders: recentOrders.map((row) => ({
      id: String(row._id),
      orderNumber: String(row.orderNumber ?? ""),
      customerName: String(row.customer?.name ?? ""),
      total: Number(row.total ?? 0),
      status: String(row.status ?? "new"),
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : new Date(row.createdAt ?? Date.now()).toISOString(),
    })),
  };
}
