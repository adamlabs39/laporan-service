import express from "express"
import dotenv from "dotenv"
import laporanRoutes from "./routes/laporan-routes.js"
import errorMiddleware from "./middlewares/error-middleware.js"
dotenv.config()
const baseUrl = `/${process.env.API_BASE ?? "api"}/${process.env.API_VERSION ?? "v3"}/${process.env.APPLICATION_MODULE ?? "laporan"}`
const application = express()
application.use(express.json())
application.use(baseUrl, laporanRoutes)
application.use(errorMiddleware)

const SERVER_HOST = process.env.SERVER_HOST
const SERVER_PORT = process.env.SERVER_PORT
console.log(SERVER_HOST)

application.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log(`The server running on http://${SERVER_HOST}:${SERVER_PORT}`)
})
