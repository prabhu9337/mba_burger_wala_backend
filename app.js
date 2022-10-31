import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import { connectPassport } from './utils/Provider.js';
import session from 'express-session'
import cookieParser from 'cookie-parser'
import passport from 'passport';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cors from 'cors';

// creating app from express
const app = express();

// export that app for use in server.js for creating routes
export default app

// assessing config.env file from config/config.env
dotenv.config({
    path: "./config/config.env"
})

// using middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        // secure: true,
        secure: process.env.NODE_ENV === 'development' ? false : true,
        httpOnly: process.env.NODE_ENV === 'development' ? false : true,
        sameSite: process.env.NODE_ENV === 'development' ? false : "none"
    }
}))

app.use(cookieParser())
app.use(express.json())
app.use(urlencoded({extended: true}))

app.use(cors({
    credentials: true, // it is for send cookies, if it false then we can't send cookies
    origin: process.env.FRONTS_URL, // it means only this url can request this backend not others
    methods: ["GET", "POST", "PUT", "DELETE"]
}))

// using passport
app.use(passport.authenticate("session"))
app.use(passport.initialize())
app.use(passport.session())

app.enable("trust proxy") // if we don't write this then after google login we redirect to frontend but we don't get any cookies

// calling connctPassport() from Provider.js before route and after config
connectPassport()

// importing routes
import userRoute from "./routes/userRoute.js"
import orderRoute from "./routes/orderRoute.js"

// using that user route
app.use("/api/v1", userRoute)
app.use("/api/v1", orderRoute)

// using error middleware
app.use(errorMiddleware);