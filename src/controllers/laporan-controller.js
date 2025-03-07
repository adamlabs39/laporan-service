import LaporanService from "../services/laporan-service.js";
import fs from "fs"

export default class LaporanController {
  static async getRekapitulasiKunjungan(request, response, nextFunction) {
    try {
      const result = await LaporanService.getRekapitulasiKunjungan(request.query)

      return response.status(200).json({
        message: 'Data berhasil ditampilkan',
        ...result
      })
    } catch (error) {
      nextFunction(error)
    }
  }

  static async getRekapitulasiTindakan(request, response, nextFunction) {
    try {
      const result = await LaporanService.getRekapitulasiTindakan(request.query)

      return response.status(200).json({
        message: 'Data berhasil ditampilkan',
        ...result
      })
    } catch (error) {
      nextFunction(error)
    }
  }

  static async getRekapitulasiLab(request, response, nextFunction) {
    try {
      const result = await LaporanService.getRekapitulasiLab(request.query)

      return response.status(200).json({
        message: 'Data berhasil ditampilkan',
        ...result
      })
    } catch (error) {
      nextFunction(error)
    }
  }

  static async exportRekapitulasiKunjungan(request, response, nextFunction) {
    try {
      const buffer = await LaporanService.exportRekapitulasiKunjungan(request.query)

      response.setHeader('Content-Disposition', 'attachment; filename="rekapitulasi_kunjungan.xlsx"')
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

      return response.status(200).send(buffer)
    } catch (error) {
      nextFunction(error)
    }
  }

  static async exportRekapitulasiTindakan(request, response, nextFunction) {
    try {
      const buffer = await LaporanService.exportRekapitulasiTindakan(request.query)

      response.setHeader('Content-Disposition', 'attachment; filename="rekapitulasi_tindakan.xlsx"')
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

      return response.status(200).send(buffer)
    } catch (error) {
      nextFunction(error)
    }
  }

  static async exportRekapitulasiLab(request, response, nextFunction) {
    try {
      const buffer = await LaporanService.exportRekapitulasiKunjungan(request.query)

      response.setHeader('Content-Disposition', 'attachment; filename="rekapitulasi_pemeriksaan_lab.xlsx"')
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

      return response.status(200).send(buffer)
    } catch (error) {
      nextFunction(error)
    }
  }
}
