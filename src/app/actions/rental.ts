"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRentals() {
  try {
    const rentals = await prisma.rental.findMany({
      include: {
        items: true,
        client: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return rentals;
  } catch (error) {
    console.error("Error fetching rentals:", error);
    throw new Error("Failed to fetch rentals");
  }
}

export async function createRental(data: {
  itemIds: string[];
  clientId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  days: number;
  totalPayment: number;
  discount: number;
  amountPaid: number;
  images?: string;
  description?: string;
  paymentType?: string;
}) {
  try {
    // Basic availability check (Server-side validation for all items)
    const existingConflicts = await prisma.rental.findMany({
      where: {
        items: {
          some: {
            id: { in: data.itemIds },
          },
        },
        OR: [
          {
            startDate: { lte: new Date(data.endDate) },
            endDate: { gte: new Date(data.startDate) },
          },
        ],
      },
    });

    if (existingConflicts.length > 0) {
      throw new Error(
        "One or more selected items are already rented during this period",
      );
    }

    const { itemIds, ...rentalData } = data;

    // Generate a unique receipt number like RNT-20231024-153022
    const nowMs = new Date();
    const timestamp =
      nowMs.getFullYear().toString() +
      (nowMs.getMonth() + 1).toString().padStart(2, "0") +
      nowMs.getDate().toString().padStart(2, "0") +
      "-" +
      nowMs.getHours().toString().padStart(2, "0") +
      nowMs.getMinutes().toString().padStart(2, "0") +
      nowMs.getSeconds().toString().padStart(2, "0");
    const receiptNo = `RNT-${timestamp}`;

    const rental = await prisma.rental.create({
      data: {
        ...rentalData,
        receiptNo,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        items: {
          connect: itemIds.map((id) => ({ id })),
        },
      },
    });

    // Update item statuses to 'on rent' if it's currently active
    const now = new Date();
    if (new Date(data.startDate) <= now && new Date(data.endDate) >= now) {
      await prisma.item.updateMany({
        where: { id: { in: itemIds } },
        data: { status: "on rent" },
      });
    }

    revalidatePath("/rentals");
    revalidatePath("/inventory");
    revalidatePath("/");
    return rental;
  } catch (error: any) {
    console.error("Error creating rental:", error);
    throw new Error(error.message || "Failed to create rental");
  }
}

export async function returnRental(rentalId: string, itemIds: string[]) {
  try {
    // Update items back to working status
    await prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: { status: "working" },
    });
    revalidatePath("/rentals");
    revalidatePath("/inventory");
  } catch (error) {
    console.error("Error returning rental:", error);
    throw new Error("Failed to return rental");
  }
}

export async function updateRental(
  id: string,
  data: {
    itemIds: string[];
    clientId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    days: number;
    totalPayment: number;
    discount: number;
    amountPaid: number;
    images?: string;
    description?: string;
    paymentType?: string;
  },
) {
  try {
    const existingConflicts = await prisma.rental.findMany({
      where: {
        id: { not: id }, // exclude the current rental
        items: {
          some: {
            id: { in: data.itemIds },
          },
        },
        OR: [
          {
            startDate: { lte: new Date(data.endDate) },
            endDate: { gte: new Date(data.startDate) },
          },
        ],
      },
    });

    if (existingConflicts.length > 0) {
      throw new Error(
        "One or more selected items are already rented during this period",
      );
    }

    const { itemIds, ...rentalData } = data;

    const rental = await prisma.rental.update({
      where: { id },
      data: {
        ...rentalData,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        items: {
          set: itemIds.map((id) => ({ id })), // replace items
        },
      },
    });

    // Check if rental is currently active
    const now = new Date();
    const isActive =
      new Date(data.startDate) <= now && new Date(data.endDate) >= now;

    // Get past items of this rental to reset them if removed
    const previousRental = await prisma.rental.findUnique({
      where: { id },
      include: { items: true, client: true },
    });

    if (previousRental) {
      const previousItemIds = previousRental.items.map((i: any) => i.id);
      const removedItemIds = previousItemIds.filter(
        (id: string) => !itemIds.includes(id),
      );
      if (removedItemIds.length > 0) {
        await prisma.item.updateMany({
          where: { id: { in: removedItemIds } },
          data: { status: "working" },
        });
      }
    }

    if (isActive) {
      await prisma.item.updateMany({
        where: { id: { in: itemIds } },
        data: { status: "on rent" },
      });
    } else {
      // If updated to future or past, reset current items to working unless they are in other active rentals
      await prisma.item.updateMany({
        where: { id: { in: itemIds } },
        data: { status: "working" },
      });
    }

    revalidatePath("/rentals");
    revalidatePath("/inventory");
    revalidatePath("/");
    return rental;
  } catch (error: any) {
    console.error("Error updating rental:", error);
    throw new Error(error.message || "Failed to update rental");
  }
}

export async function deleteRental(id: string) {
  try {
    // Find the rental to get its items
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { items: true, client: true },
    });

    if (!rental) {
      throw new Error("Rental not found");
    }

    // Check if we need to update item statuses (if the rental is currently active)
    const now = new Date();
    const isCurrentlyActive =
      new Date(rental.startDate) <= now && new Date(rental.endDate) >= now;

    // Delete the rental
    await prisma.rental.delete({
      where: { id },
    });

    // If it was active, revert item statuses to working
    if (isCurrentlyActive && rental.items.length > 0) {
      await prisma.item.updateMany({
        where: { id: { in: rental.items.map((i) => i.id) } },
        data: { status: "working" },
      });
    }

    revalidatePath("/rentals");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting rental:", error);
    throw new Error(error.message || "Failed to delete rental");
  }
}

export async function completeRental(id: string, notes?: string) {
  try {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { items: true, client: true },
    });

    if (!rental) {
      throw new Error("Rental not found");
    }

    // Mark rental as completed and update notes
    await prisma.rental.update({
      where: { id },
      data: {
        status: "completed",
        notes: notes || null,
      },
    });

    // Free up the items back into inventory
    if (rental.items.length > 0) {
      await prisma.item.updateMany({
        where: { id: { in: rental.items.map((i) => i.id) } },
        data: { status: "working" },
      });
    }

    revalidatePath("/rentals");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error completing rental:", error);
    throw new Error(error.message || "Failed to complete rental");
  }
}
