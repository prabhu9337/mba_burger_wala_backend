import express from 'express';
import { getAdminOrders, getMyOrders, getOrderDetails, paymentVerification, placeOrder, placeOrderOnline, processOrder } from '../controllers/orderController.js';
import { authorizedAdmin, isAuthenticated } from '../middlewares/auth.js';

const router = express.Router()

router.post("/createorder", isAuthenticated, placeOrder)

router.post("/createorderonline", placeOrderOnline)
router.post("/paymentverification", isAuthenticated, paymentVerification)

router.get("/myorders", isAuthenticated, getMyOrders)

router.get("/order/:id", isAuthenticated, getOrderDetails)

// admin routes
router.get("/admin/orders", isAuthenticated, authorizedAdmin, getAdminOrders)
router.get("/admin/order/:id", isAuthenticated, authorizedAdmin, processOrder)

export default router;