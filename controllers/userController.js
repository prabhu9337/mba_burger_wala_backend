import { asyncError } from '../middlewares/errorMiddleware.js'
import { Order } from '../models/OrderModel.js'
import {User} from '../models/UserModel.js'

// get my profile
export const myProfile = (req, res, next) => {
    res.status(200).json({
        success: true,
        user: req.user
    })
}

// user logout
export const logout = (req, res, next) => {
    req.session.destroy((err) => {
        if(err) {
            return next(err)
        }
        res.clearCookie("connect.sid", {
            secure: process.env.NODE_ENV === "development" ? false : true,
            httpOnly: process.env.NODE_ENV === "development" ? false : true,
            sameSite: process.env.NODE_ENV === "development" ? false : "none",
        })
        res.status(200).json({
            message: "Logout"
        })
    })
}

// get all user for admin
export const getAllUsers = asyncError(async (req, res, next) => {
    const users = await User.find({})

    res.status(200).json({
        success: true,
        users
    })
})

// get all data like, user count, order count, preparingOrders, shippedOrders, deliveredOrders, total income for admin dashboard
export const getAdminStats = asyncError(async (req, res, next) => {
    const usersCount = await User.countDocuments();

    // if we can do something then .find({}) ,  otherwise .countDocuments()

    const orders = await Order.find({})

    const preparingOrders = orders.filter((item) => item.orderStatus==='Preparing');
    const shippedOrders = orders.filter((item) => item.orderStatus==='Shipped');
    const deliveredOrders = orders.filter((item) => item.orderStatus==='Delivered');

    let totalIncome = 0;

    orders.forEach((item) => {
        totalIncome += item.totalAmount
    })

    res.status(200).json({
        success: true,
        usersCount,
        ordersCount: {
            total: orders.length,
            preparing: preparingOrders.length,
            shipped: shippedOrders.length,
            delivered: deliveredOrders.length
        },
        totalIncome
    })
})