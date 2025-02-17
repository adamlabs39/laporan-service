import LaporanRepository from "../repositories/laporan-repository.js";
import LaporanValidator from "../validations/laporan-validation.js";
import ZodValidator from "../validations/zod-validator.js";

const PaymentMethodEnum = {
  1: 'TUNAI',
  2: 'BPJS'
}

export default class LaporanService {
  static async getRekapitulasiKunjungan(filter) {
    const { limit = 0, offset = 12, ...validatedFilter } = ZodValidator.validate(LaporanValidator.KUNJUNGAN, filter)

    const [data, total] = await LaporanRepository.getRekapitulasiKunjungan(validatedFilter, { limit, offset })

    // Handling pagination
    const page = Math.floor(offset / limit) + 1
    const totalPages = Math.ceil(total / limit)
    const nextPage = page < totalPages ? page + 1 : null
    const prevPage = page > 1 ? page - 1 : null

    return {
      payload: data,
      properties: {
        page,
        page_sizes: limit,
        total_pages: totalPages,
        total,
        next_page: nextPage,
        prev_page: prevPage
      }
    }
  }
}
