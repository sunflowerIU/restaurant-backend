import { Router } from "express";
import {
  createCategory,
  createProduct,
  deleteProduct,
  getMenu,
} from "../controller/product/product.controller";
import { seed } from "../seed";

const router = Router();

router.post("/create-product", createProduct);
router.post("/create-category", createCategory);
router.get("/menu", getMenu);
router.delete("/delete", deleteProduct);

//to store dummy data
router.post("/seed", async (req, res) => {
  seed();
});

export default router;
