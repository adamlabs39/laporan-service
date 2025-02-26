import LaporanService from "../services/laporan-service.js";

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
}
