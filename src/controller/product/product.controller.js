"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = createCategory;
exports.createProduct = createProduct;
exports.deleteProduct = deleteProduct;
exports.getMenu = getMenu;
const category_model_1 = require("../../model/category.model");
const product_model_1 = require("../../model/product.model");
const product_schema_1 = require("./product.schema");
const mongoose_1 = require("mongoose");
async function createCategory(req, res) {
    const result = product_schema_1.CreateCategorySchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }
    try {
        const category = await category_model_1.Category.create({
            ...result.data,
        });
        return res
            .status(201)
            .json({ message: "category created", data: category });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }
}
async function createProduct(req, res) {
    const result = product_schema_1.CreateProductSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }
    try {
        //find category first
        const categoryExists = await category_model_1.Category.findById(result.data.categoryId);
        if (!categoryExists) {
            return res.status(404).json({ message: "Category doesnot exists" });
        }
        const product = await product_model_1.Product.create({
            ...result.data,
        });
        return res.status(201).json({ message: "product created", data: product });
    }
    catch (error) {
        console.error(error);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid category id" });
        }
        return res.status(500).json({ message: error });
    }
}
async function deleteProduct(req, res) {
    const { productId } = req.body;
    if (!productId)
        return res.status(400).json({ message: "No product to be deleted" });
    try {
        const product = await product_model_1.Product.findByIdAndDelete(productId);
        // console.log(product);
        if (!product)
            return res.status(404).json({ message: "product not found" });
        return res.status(200).json({ message: "Product deleted." });
    }
    catch (error) {
        if (error instanceof mongoose_1.MongooseError && error.name === "CastError") {
            return res.status(500).json({
                message: "Product not found",
            });
        }
        return res.status(500).json({
            message: error,
        });
    }
}
async function getMenu(req, res) {
    try {
        // 1. Fetch data with .lean() for better performance in TS
        const [categories, products] = await Promise.all([
            category_model_1.Category.find().sort({ displayOrder: 1 }).lean(),
            product_model_1.Product.find().lean(),
        ]);
        // 2. Create the Hash Map (Lookup Table)
        // Key is string (ID), Value is array of CleanProducts
        const productsByCategory = {};
        products.forEach((product) => {
            const catId = product.categoryId.toString();
            if (!productsByCategory[catId]) {
                productsByCategory[catId] = [];
            }
            // Convert the raw product to a clean one
            const cleanProduct = {
                ...product,
                id: product._id.toString(),
                // Force the Decimal128 to a string safely
                price: +product.price || 0.0,
            };
            productsByCategory[catId].push(cleanProduct);
        });
        // 3. Assemble the Menu
        const menu = categories.map((cat) => ({
            ...cat,
            id: cat._id.toString(), // Convert _id to id
            items: productsByCategory[cat._id.toString()] || [],
        }));
        res.status(200).json({ data: menu });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
