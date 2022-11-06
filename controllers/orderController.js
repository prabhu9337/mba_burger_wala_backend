import { asyncError } from "../middlewares/errorMiddleware.js";
import { Order } from "../models/OrderModel.js";
import ErrorHandler from "../utils/ErrorHandller.js";
import {instance} from '../server.js'
import crypto from 'crypto'
import {Payment} from '../models/paymentModel.js'

// for cash on delivery order
export const placeOrder = asyncError(async (req, res, next) => {
    const {
        shippingInfo, orderItems, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount
    } = req.body

    const user = req.user._id;

    const orderOptions = {
        shippingInfo, orderItems, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount, user
    }

    await Order.create(orderOptions)

    res.status(201).json({
        success: true,
        message: "Order Placed Successfully via Cash on Delivery"
    })
})

// for online order with Razorpay
export const placeOrderOnline = asyncError(async (req, res, next) => {
    const {
        shippingInfo, orderItems, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount
    } = req.body

    const user = req.user._id;

    const orderOptions = {
        shippingInfo, orderItems, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount, user
    }

    const options = {
        amount: Number(totalAmount) * 100,  // amount in the smallest currency unit
        currency: "INR",
    };
    const order = await instance.orders.create(options)

    res.status(200).json({
        success: true,
        order,
        orderOptions
    })
})

// payment verification
export const paymentVerification = asyncError(async (req, res, next) => {
    const {razorpay_payment_id, razorpay_order_id, razorpay_signature, orderOptions} = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // here the signature is created bu using razorpay_order_id and razorpay_payment_id

    // and this expectedSignature is created by razorpay algorithm

    // then if razorpay_signature and expectedSignature is matched then the payment is authenticate

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET).update(body).digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature;

    if(isAuthentic) {
        const payment = await Payment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        })

        await Order.create({
            ...orderOptions,
            paidAt: new Date(Date.now()),
            paymentInfo: payment._id
        })

        res.status(201).json({
            success: true,
            message: `Order Placed Successfully. Payment Id is: ${payment._id}`
        })
    } else {
        return next(new ErrorHandler("Payment failed", 400))
    }
})

// get my orders
export const getMyOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find({
        user: req.user._id
    }).populate("user", "name")

    // console.log(req.user._id)

    res.status(200).json({
        success: true,
        orders,
    })
})

// get order details
export const getOrderDetails = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name")

    if (!order) {
        return next(new ErrorHandler("Invalid Order Id"))
    }

    res.status(200).json({
        success: true,
        order
    })
})

// admin routes
// get admin orders
export const getAdminOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find({}).populate("user", "name")

    res.status().json({
        success: true,
        orders
    })
})

// process order by admin
export const processOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler("Invaid Order Id", 404))
    }

    if (order.orderStatus === "Preparing") {
        order.orderStatus = "Shipped";
    } else if (order.orderStatus === "Shipped") {
        order.orderStatus = "Delivered";
        order.deliveredAt = new Date(Date.now());
    } else if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Food Already Delivered", 400));
    }

    await order.save();

    res.status(200).json({
        success: true,
        message: "Status Updated Successfully"
    })
})