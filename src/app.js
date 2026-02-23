import express from "express"
import cors from "cors"
import cookiesParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "32kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "32kb"
}))
app.use(express.static("public"))
app.use(cookiesParser())

//routes import
import userRouter from "./routes/user.js"

//routes declaration
app.use("/api/v1/users",userRouter) //here /api/v1/users is a prefix , we add route in router file


export { app };