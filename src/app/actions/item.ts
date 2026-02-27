"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

function renameImages(itemId: string, imageUrls: string[] | undefined) {
  if (!imageUrls || imageUrls.length === 0) return undefined;

  const uploadDir = path.join(process.cwd(), "public");

  // Step 1: Rename all existing active files to a temporary name to avoid cross-over collisions
  const tempUrls = imageUrls.map((url, index) => {
    const oldPath = path.join(uploadDir, url);
    if (!fs.existsSync(oldPath)) return url;

    const ext = path.extname(url) || ".webp";
    const tempFilename = `${itemId}_temp_${Date.now()}_${index}${ext}`;
    const tempUrl = `/uploads/${tempFilename}`;
    const tempPath = path.join(uploadDir, tempUrl);

    fs.renameSync(oldPath, tempPath);
    return tempUrl;
  });

  // Step 2: Rename them to their final index names
  const renamedUrls = tempUrls.map((tempUrl, index) => {
    const tempPath = path.join(uploadDir, tempUrl);
    if (!fs.existsSync(tempPath)) return tempUrl;

    const ext = path.extname(tempUrl) || ".webp";
    const finalFilename = `${itemId}_${index + 1}${ext}`;
    const finalUrl = `/uploads/${finalFilename}`;
    const finalPath = path.join(uploadDir, finalUrl);

    // Safely remove the target if it already exists, though it shouldn't if we properly unlinked
    if (fs.existsSync(finalPath) && finalPath !== tempPath) {
      fs.unlinkSync(finalPath);
    }

    fs.renameSync(tempPath, finalPath);
    return finalUrl;
  });

  return renamedUrls;
}

export async function getItems() {
  try {
    const items = await prisma.item.findMany({
      include: { images: true, category: true, brand: true },
      orderBy: { createdAt: "desc" },
    });
    return items;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items");
  }
}

export async function getPublicCatalogItems() {
  try {
    const items = await prisma.item.findMany({
      where: {
        status: {
          notIn: ["damage", "sold out"],
        },
      },
      include: {
        images: {
          take: 1,
          orderBy: { url: "asc" }, // Ensure we get itemid_1.webp
        },
        category: true,
        brand: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return items;
  } catch (error) {
    console.error("Error fetching public catalog items:", error);
    throw new Error("Failed to fetch public catalog items");
  }
}

export async function getItemImages(itemId: string) {
  try {
    const itemImages = await prisma.itemImage.findMany({
      where: { itemId },
      orderBy: { url: "asc" },
    });
    return itemImages;
  } catch (error) {
    console.error("Error fetching item images:", error);
    throw new Error("Failed to fetch item images");
  }
}

export async function createItem(data: {
  name: string;
  brandId?: string;
  categoryId?: string;
  status: string;
  purchaseDate: string;
  soldDate?: string;
  realPrice: number;
  paidPrice: number;
  soldPrice?: number;
  rentAmount: number;
  serialNo?: string;
  description?: string;
  images?: string[];
}) {
  try {
    const { images, ...itemData } = data;
    let item = await prisma.item.create({
      data: {
        ...itemData,
        purchaseDate: new Date(data.purchaseDate),
        soldDate: data.soldDate ? new Date(data.soldDate) : null,
      },
    });

    if (images && images.length > 0) {
      const renamedImages = renameImages(item.id, images);
      if (renamedImages) {
        // Update the item with the images after renaming
        item = await prisma.item.update({
          where: { id: item.id },
          data: {
            images: {
              create: renamedImages.map((url) => ({ url })),
            },
          },
        });
      }
    }

    revalidatePath("/inventory");
    return item;
  } catch (error) {
    console.error("Error creating item:", error);
    throw new Error("Failed to create item");
  }
}

export async function updateItem(id: string, data: any) {
  try {
    const { images, ...itemData } = data;

    const updateData: any = {
      ...itemData,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      soldDate: data.soldDate ? new Date(data.soldDate) : null,
    };

    if (images !== undefined) {
      const existingItem = await prisma.item.findUnique({
        where: { id },
        include: { images: true },
      });

      // First: Find deleted images (exist in DB but not in the new incoming images array)
      // and physically delete them. Must be done before renameImages creates new files with the old names.
      if (existingItem && existingItem.images) {
        const newUrls = images as string[]; // The UI sends the currently active URLs before renaming
        existingItem.images.forEach((existingImg) => {
          if (!newUrls.includes(existingImg.url)) {
            const uploadDir = path.join(process.cwd(), "public");
            const filePath = path.join(uploadDir, existingImg.url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        });
      }

      // Second: safely rename remaining ones using 2-step process mapping
      const renamedImages = renameImages(id, images);

      // Replace all existing images in DB
      await prisma.itemImage.deleteMany({ where: { itemId: id } });

      if (renamedImages && renamedImages.length > 0) {
        updateData.images = {
          create: renamedImages.map((url: string) => ({ url })),
        };
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
      include: { images: true, category: true, brand: true },
    });
    revalidatePath("/inventory");
    return item;
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Failed to update item");
  }
}

export async function updateItemStatus(id: string, status: string) {
  try {
    const item = await prisma.item.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/inventory");
    return item;
  } catch (error) {
    console.error("Error updating item status:", error);
    throw new Error("Failed to update item status");
  }
}

export async function deleteItem(id: string) {
  try {
    // Also delete images from physical storage
    const item = await prisma.item.findUnique({
      where: { id },
      include: { images: true },
    });

    if (item && item.images) {
      const uploadDir = path.join(process.cwd(), "public");
      item.images.forEach((img) => {
        const filePath = path.join(uploadDir, img.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await prisma.item.delete({
      where: { id },
    });
    revalidatePath("/inventory");
  } catch (error) {
    console.error("Error deleting item:", error);
    throw new Error("Failed to delete item");
  }
}
