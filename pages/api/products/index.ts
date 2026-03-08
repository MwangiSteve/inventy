import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSessionServer } from "@/utils/auth";
import { productLimiter, runMiddleware } from "@/middleware/rateLimiter";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, productLimiter);
  if (res.headersSent) return;

  const session = await getSessionServer(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { method } = req;
  const userId = session.id;

  switch (method) {
    case "POST":
      try {
        const {
          name,
          family,
          weightClass,
          size,
          buyingPrice,
          sellingPrice,
          quantity,
          lowStockAlert,
          categoryId,
          supplierId,
        } = req.body;

        // Validate required fields
        if (!name || !sellingPrice || quantity === undefined || !categoryId) {
          return res.status(400).json({ 
            error: "Missing required fields: name, sellingPrice, quantity, categoryId" 
          });
        }

        // Auto-group Sufurias
        const productFamily =
          family || (name.toLowerCase().includes("sufuria")
            ? "Sufuria Family"
            : "General Items");

        // Build data object, omitting empty strings and undefined values for optional fields
        const data: Record<string, unknown> = {
          name,
          family: productFamily,
          sellingPrice: Number(sellingPrice),
          quantity: BigInt(quantity),
          status: quantity <= (lowStockAlert || 5) ? "LOW_STOCK" : "IN_STOCK",
          userId,
          categoryId,
          createdAt: new Date(),
        };

        // Add optional fields only if they have valid values (not empty strings)
        if (weightClass && weightClass.trim()) {
          data.weightClass = weightClass;
        }
        if (size && size.trim()) {
          data.size = size;
        }
        if (buyingPrice || buyingPrice === 0) {
          data.buyingPrice = Number(buyingPrice);
        }
        if (lowStockAlert !== undefined && lowStockAlert !== null && lowStockAlert !== "") {
          data.lowStockAlert = Number(lowStockAlert);
        }
        if (supplierId && supplierId.trim()) {
          data.supplierId = supplierId;
        }

        const product = await prisma.product.create({
          data: data as Parameters<typeof prisma.product.create>[0]["data"],
        });

        res.status(201).json({
          ...product,
          quantity: Number(product.quantity),
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create product. " + String(error) });
      }
      break;

    case "GET":
      try {
        const products = await prisma.product.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });

        const formatted = products.map((p) => ({
          ...p,
          quantity: Number(p.quantity),
          createdAt: p.createdAt.toISOString(),
          stockStatus:
            Number(p.quantity) <= p.lowStockAlert ? "LOW STOCK" : "OK",
        }));

        res.status(200).json(formatted);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch inventory" });
      }
      break;

    case "PUT":
      try {
        const {
          id,
          name,
          family,
          weightClass,
          size,
          buyingPrice,
          sellingPrice,
          quantity,
          lowStockAlert,
          status,
          categoryId,
          supplierId,
        } = req.body;

        if (!id) {
          return res.status(400).json({ error: "Product ID is required" });
        }

        // Build update data, omitting empty strings and undefined values for optional fields
        const data: Record<string, unknown> = {};

        if (name !== undefined && name !== "") data.name = name;
        if (sellingPrice !== undefined && sellingPrice !== "") data.sellingPrice = Number(sellingPrice);
        if (quantity !== undefined && quantity !== "") data.quantity = BigInt(quantity);
        if (status !== undefined && status !== "") data.status = status;
        if (categoryId !== undefined && categoryId !== "") data.categoryId = categoryId;
        if (family !== undefined && family !== "") data.family = family;
        if (weightClass !== undefined && weightClass?.trim()) data.weightClass = weightClass;
        if (size !== undefined && size?.trim()) data.size = size;
        if (buyingPrice !== undefined && buyingPrice !== "") data.buyingPrice = Number(buyingPrice);
        if (lowStockAlert !== undefined && lowStockAlert !== "") data.lowStockAlert = Number(lowStockAlert);
        if (supplierId !== undefined && supplierId?.trim()) {
          data.supplierId = supplierId;
        } else if (supplierId === "") {
          // Allow clearing supplier by sending null
          data.supplierId = null;
        }

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: data as Parameters<typeof prisma.product.update>[0]["data"],
        });

        // Fetch category and supplier data for the response
        const category = await prisma.category.findUnique({
          where: { id: categoryId || updatedProduct.categoryId },
        });
        const supplier = updatedProduct.supplierId ? await prisma.supplier.findUnique({
          where: { id: updatedProduct.supplierId },
        }) : null;

        // Return the updated product data with category and supplier names
        res.status(200).json({
          id: updatedProduct.id,
          name: updatedProduct.name,
          family: updatedProduct.family,
          weightClass: updatedProduct.weightClass,
          size: updatedProduct.size,
          buyingPrice: updatedProduct.buyingPrice,
          sellingPrice: updatedProduct.sellingPrice,
          quantity: Number(updatedProduct.quantity),
          lowStockAlert: updatedProduct.lowStockAlert,
          status: updatedProduct.status,
          userId: updatedProduct.userId,
          categoryId: updatedProduct.categoryId,
          supplierId: updatedProduct.supplierId,
          createdAt: updatedProduct.createdAt.toISOString(),
          category: category?.name || "Unknown",
          supplier: supplier?.name || "Unknown",
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update product. " + String(error) });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.body;

        await prisma.product.delete({
          where: { id },
        });

        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
      }
      break;

    default:
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
