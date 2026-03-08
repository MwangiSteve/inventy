import { NextApiRequest, NextApiResponse } from "next";
import ExcelJS from "exceljs";
import { z } from "zod";
import { getSessionServer } from "@/utils/auth";

const ProductRowSchema = z.object({
  name: z.string(),
  family: z.string().optional(),
  weightClass: z.string().optional(),
  size: z.string().optional(),
  buyingPrice: z.number().optional().nullable(),
  sellingPrice: z.number().optional().nullable(),
  quantity: z.number(),
  status: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  createdAt: z.string(),
});

const ExportRequestSchema = z.object({
  products: z.array(ProductRowSchema).max(10000),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getSessionServer(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = ExportRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
  }

  const { products } = parsed.data;

  if (products.length === 0) {
    return res.status(400).json({ error: "No products to export" });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Stockly";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Products", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // Define columns
    worksheet.columns = [
      { header: "Product Name", key: "name", width: 25 },
      { header: "Family", key: "family", width: 15 },
      { header: "Weight Class", key: "weightClass", width: 15 },
      { header: "Size", key: "size", width: 10 },
      { header: "Buying Price", key: "buyingPrice", width: 15 },
      { header: "Selling Price", key: "sellingPrice", width: 15 },
      { header: "Quantity", key: "quantity", width: 12 },
      { header: "Status", key: "status", width: 15 },
      { header: "Category", key: "category", width: 18 },
      { header: "Supplier", key: "supplier", width: 18 },
      { header: "Created Date", key: "createdAt", width: 15 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E79" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 22;

    // Add data rows
    products.forEach((product) => {
      const row = worksheet.addRow({
        name: product.name,
        family: product.family || "N/A",
        weightClass: product.weightClass || "N/A",
        size: product.size || "N/A",
        buyingPrice: product.buyingPrice ?? 0,
        sellingPrice: product.sellingPrice ?? 0,
        quantity: product.quantity,
        status: product.status || "N/A",
        category: product.category || "Unknown",
        supplier: product.supplier || "Unknown",
        createdAt: new Date(product.createdAt).toLocaleDateString(),
      });

      // Style alternating rows
      if (row.number % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0F4F8" },
        };
      }

      // Format price columns
      ["buyingPrice", "sellingPrice"].forEach((col) => {
        const cell = row.getCell(col);
        cell.numFmt = '"$"#,##0.00';
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFD0D0D0" } },
          left: { style: "thin", color: { argb: "FFD0D0D0" } },
          bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
          right: { style: "thin", color: { argb: "FFD0D0D0" } },
        };
      });
    });

    // Freeze the header row
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `stockly-products-${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.byteLength);
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to generate Excel file" });
  }
}
