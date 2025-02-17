import LaporanService from "../services/laporan-service.js";

export default class LaporanController {
  static async getRekapitulasiKunjungan(request, response, nextFunction) {
    try {
      const result = await LaporanService.getRekapitulasiKunjungan(request.body)

      return response.status(200).json({
        success: true,
        message: 'Data rekapitulasi kunjungan berhasil didapatkan',
        ...result
      })
    } catch (error) {
      nextFunction(error)
    }
  }
}
