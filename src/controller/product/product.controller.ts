import type { Request, Response } from "express";
import { Category } from "../../model/category.model";
import { Product } from "../../model/product.model";
import { CreateCategorySchema, CreateProductSchema } from "./product.schema";
import { CleanProduct, ICategory, MenuCategory, RawProduct } from "./types";
import { MongooseError } from "mongoose";

export async function createCategory(req: Request, res: Response) {
  const result = CreateCategorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues[0].message });
  }
  try {
    const category = await Category.create({
      ...result.data,
    });

    return res
      .status(201)
      .json({ message: "category created", data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error });
  }
}

export async function createProduct(req: Request, res: Response) {
  const result = CreateProductSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.issues[0].message });
  }
  try {
    //find category first
    const categoryExists = await Category.findById(result.data.categoryId);

    if (!categoryExists) {
      return res.status(404).json({ message: "Category doesnot exists" });
    }

    const product = await Product.create({
      ...result.data,
    });

    return res.status(201).json({ message: "product created", data: product });
  } catch (error: any) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category id" });
    }
    return res.status(500).json({ message: error });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  const { productId } = req.body as { productId: string };

  if (!productId)
    return res.status(400).json({ message: "No product to be deleted" });

  try {
    const product = await Product.findByIdAndDelete(productId);
    // console.log(product);

    if (!product) return res.status(404).json({ message: "product not found" });

    return res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    if (error instanceof MongooseError && error.name === "CastError") {
      return res.status(500).json({
        message: "Product not found",
      });
    }
    return res.status(500).json({
      message: error,
    });
  }
}

export async function getMenu(req: Request, res: Response) {
  try {
    // 1. Fetch data with .lean() for better performance in TS
    const [categories, products] = await Promise.all([
      Category.find().sort({ displayOrder: 1 }).lean<ICategory[]>(),
      Product.find().lean<RawProduct[]>(),
    ]);

    // 2. Create the Hash Map (Lookup Table)
    // Key is string (ID), Value is array of CleanProducts
    const productsByCategory: Record<string, CleanProduct[]> = {};

    products.forEach((product) => {
      const catId = product.categoryId.toString();

      if (!productsByCategory[catId]) {
        productsByCategory[catId] = [];
      }

      // Convert the raw product to a clean one
      const cleanProduct: CleanProduct = {
        ...product,
        id: product._id.toString(),
        // Force the Decimal128 to a string safely
        price: +product.price || 0.0,
      };

      productsByCategory[catId].push(cleanProduct);
    });

    // 3. Assemble the Menu
    const menu: MenuCategory[] = categories.map((cat) => ({
      ...cat,
      id: cat._id.toString(), // Convert _id to id
      items: productsByCategory[cat._id.toString()] || [],
    }));

    res.status(200).json({ data: menu });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
