import mongoose from "mongoose"

export const databaseConnector = () => {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Muxic Server connected to DB Successfully'))
        .catch((err) => {
            console.log('Error occurred while connecting to DB: \n', err)
            process.exit(0)
        })
}