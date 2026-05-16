"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controller/product/product.controller");
const seed_1 = require("../seed");
const router = (0, express_1.Router)();
router.post("/create-product", product_controller_1.createProduct);
router.post("/create-category", product_controller_1.createCategory);
router.get("/menu", product_controller_1.getMenu);
router.delete("/delete", product_controller_1.deleteProduct);
//to store dummy data
router.post("/seed", async (req, res) => {
    (0, seed_1.seed)();
});
exports.default = router;
