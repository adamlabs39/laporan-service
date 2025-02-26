import express from "express"
import LaporanController from "../controllers/laporan-controller.js"

const laporanRoutes = express.Router()
laporanRoutes.get("/rekap/status-rawat", LaporanController.getRekapitulasiKunjungan)
laporanRoutes.get("/rekap/tindakan", LaporanController.getRekapitulasiTindakan)
laporanRoutes.get("/rekap/lab", LaporanController.getRekapitulasiLab)

export default laporanRoutes
