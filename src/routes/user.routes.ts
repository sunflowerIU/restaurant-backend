import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createNewAddress,
  getUser,
  removeAddress,
  updateUser,
} from "../controller/user/user.controller";

const router = Router();

router.get("/me", requireAuth, getUser);
router.post("/update", requireAuth, updateUser);
router.post("/create-address", requireAuth, createNewAddress);
router.post("/remove-address", requireAuth, removeAddress);

export default router;
