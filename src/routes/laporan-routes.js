import express from "express"
import LaporanController from "../controllers/laporan-controller.js"

const laporanRoutes = express.Router()
laporanRoutes.post("/laporan/kunjungan", LaporanController.getRekapitulasiKunjungan)

export default laporanRoutes
