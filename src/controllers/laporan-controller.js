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

  static async getRekapitulasiDiagnosis(request, response, nextFunction) {
    try {
      const result = await LaporanService.getRekapitulasiDiagnosis(request.query)
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
      const result = await LaporanService.exportRekapitulasiKunjungan(request.query)

      return response.status(200).send({
        message: 'Data berhasil di export',
        ...result
      })
    } catch (error) {
      nextFunction(error)
    }
  }

  static async exportRekapitulasiTindakan(request, response, nextFunction) {
    try {
      const result = await LaporanService.exportRekapitulasiTindakan(request.query)

      return response.status(200).send({
        message: 'Data berhasil di export',
        ...result
      })
    } catch (error) {
      nextFunction(error)
    }
  }

  static async exportRekapitulasiLab(request, response, nextFunction) {
    try {
      const result = await LaporanService.exportRekapitulasiKunjungan(request.query)

      return response.status(200).send({
        message: 'Data berhasil di export',
        ...result
      })
    } catch (error) {
      nextFunction(error)
    }
  }
  static async exportRekapitulasiDiagnosis(request, response, nextFunction) {
    try {
      const result = await LaporanService.exportRekapitulasiDiagnosis(request.query)

      return response.status(200).send({
        message: 'Data berhasil di export',
        ...result
      })
    } catch (error) {
      nextFunction(error)
    }
  }
}
