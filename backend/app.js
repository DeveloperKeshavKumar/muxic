import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import router from "./routes/index.js"
import { databaseConnector } from "./config/index.js"

const app = express()
const PORT = process.env.PORT || 3001

const startServer = async () => {
  try {
    const db = await databaseConnector()
    console.log("Database connection established:", db.name)

    app.use(cors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser())
    app.use(router)

    app.listen(PORT, () => {
      console.log(`App running at http://localhost:${PORT}/`)
    })
  } catch (err) {
    console.error("Failed to start server due to DB error")
    process.exit(1)
  }
}

startServer()