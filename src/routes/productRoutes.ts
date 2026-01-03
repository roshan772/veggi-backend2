import { Router } from "express";
import * as ctrl from "../controllers/productController";
import { protect, authorizeRoles } from "../middlewares/authenticate";
import { upload } from "../middlewares/upload";
import { uploadCloudinary } from "../middlewares/uploadCloudinary";

const router = Router();
//app.use("/api/v1/products" , productRoutes)

// Public or protected?
router.get("/", ctrl.getProducts);


// Admin only
router.post(
  "/new",
  protect,
  authorizeRoles("admin"),
  uploadCloudinary.array("images", 5),
  ctrl.createProduct
);
router.get("/:id", ctrl.getSingleProduct);
router.put("/:id", protect, authorizeRoles("admin"), ctrl.updateProduct);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.array("images", 5),
  ctrl.deleteProduct
);

export default router;
