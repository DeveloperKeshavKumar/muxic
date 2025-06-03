import express from "express"
import cookieParser from "cookie-parser"
import router from "./routes/index.js"
import {databaseConnector} from "./config/index.js"

const app = express()
const PORT = process.env.PORT || 3001

databaseConnector()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(router)

app.listen(PORT, () => console.log(`App running at http://localhost:${PORT}/`))