import { Router } from "express"
import authRouter from "./auth.routes.js"

const router = Router()

router.use('/auth', authRouter)

router.get('/', (req, res) => {
    res.send("Server running gracefully!!")
})

export default router