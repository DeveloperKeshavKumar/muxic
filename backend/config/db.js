import mongoose from "mongoose"

export const databaseConnector = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        console.log('Muxic Server connected to DB Successfully')
        return mongoose.connection
    } catch (err) {
        console.error('Error occurred while connecting to DB:', err)
        process.exit(1)
    }
}