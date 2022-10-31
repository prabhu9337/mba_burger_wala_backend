import mongoose from 'mongoose'

// creating database connection
export const connectionDatabase = async () => {
    const {connection} = await mongoose.connect(process.env.MONGO_URI)
    console.log(`Database is connected to ${connection.host}`)
}

// now call it to server.js