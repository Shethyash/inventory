"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: "asc" },
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
}

export async function createClient(data: {
  name: string;
  mobile: string;
  address?: string;
  reference?: string;
}) {
  try {
    const client = await prisma.client.create({
      data,
    });
    revalidatePath("/clients");
    revalidatePath("/rentals");
    revalidatePath("/");
    return client;
  } catch (error: any) {
    console.error("Error creating client:", error);
    throw new Error(error.message || "Failed to create client");
  }
}

export async function updateClient(
  id: string,
  data: {
    name: string;
    mobile: string;
    address?: string;
    reference?: string;
  },
) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    revalidatePath("/clients");
    revalidatePath("/rentals");
    revalidatePath("/");
    return client;
  } catch (error: any) {
    console.error("Error updating client:", error);
    throw new Error(error.message || "Failed to update client");
  }
}

export async function deleteClient(id: string) {
  try {
    // You generally shouldn't delete a client if they have active rentals
    // We ensure onDelete behavior or check here if needed.
    const activeRentals = await prisma.rental.count({
      where: { clientId: id },
    });

    if (activeRentals > 0) {
      throw new Error(
        "Cannot delete client as they have existing rental records tying to them.",
      );
    }

    await prisma.client.delete({
      where: { id },
    });
    revalidatePath("/clients");
    revalidatePath("/rentals");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting client:", error);
    throw new Error(error.message || "Failed to delete client");
  }
}
