"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyRentals = await prisma.rental.findMany({
      where: {
        startDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    const totalIncome = monthlyRentals.reduce(
      (sum, rental) => sum + rental.totalPayment,
      0,
    );

    const allRentals = await prisma.rental.findMany({
      include: { items: true, client: true },
    });

    const allOrders = await prisma.order.findMany({
      include: { items: true },
    });

    return {
      totalIncome,
      rentals: allRentals,
      orders: allOrders,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}
