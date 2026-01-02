import { Router } from "express";
import * as paymentCtrl from "../controllers/paymentController"
import { protect } from "../middlewares/authenticate"; 

const router = Router();

router.post("/hash", protect, paymentCtrl.generatePaymentHash);
router.post("/notify", paymentCtrl.handlePayHereNotify); 

export default router;