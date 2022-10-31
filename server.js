import app from './app.js'
import { connectionDatabase } from './config/database.js'
import Razorpay from 'razorpay';

// calling connectionDatabase function from database.js
connectionDatabase()

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
})

// creating a simple route
app.get("/", (req, res, next) => {
    res.send("<h1>Hello from server</h1>");
})

// app listening on 4000
app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}, in ${process.env.NODE_ENV} MODE`)
})