import express from 'express';
import passport from 'passport';
import { logout, myProfile, getAllUsers, getAdminStats } from '../controllers/userController.js';
import { authorizedAdmin, isAuthenticated } from '../middlewares/auth.js';

// creating router
const router = express.Router()

router.get("/googlelogin", passport.authenticate("google", {
    scope: ["profile"],
}))

// after google login before deployment or production mode
// router.get("/login", passport.authenticate("google"), (req, res, next) => {
//     res.send("LoggedIn")
// })

// after google login for deployment
router.get("/login", passport.authenticate("google", {
    successRedirect: process.env.FRONTS_URL
}))

// profile route
router.get("/me", isAuthenticated, myProfile)

router.get("/logout", logout)

// admin routes
router.get("/admin/users", isAuthenticated, authorizedAdmin, getAllUsers)
router.get("/admin/stats", isAuthenticated, authorizedAdmin, getAdminStats)

export default router