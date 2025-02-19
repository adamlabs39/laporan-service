import LaporanRepository from "../repositories/laporan-repository.js";
import LaporanValidator from "../validations/laporan-validation.js";
import ZodValidator from "../validations/zod-validator.js";

const PaymentMethodEnum = {
  1: 'TUNAI',
  2: 'BPJS'
}

export default class LaporanService {
  static async getRekapitulasiKunjungan(filter) {
    const { limit = 12, offset = 0, ...validatedFilter } = ZodValidator.validate(LaporanValidator.KUNJUNGAN, filter)
    console.log("Filter : ", validatedFilter)
    const [data, total] = await LaporanRepository.getRekapitulasiKunjungan({ filter: validatedFilter, limit, offset })

    const convertedData = data.map((item) =>
      item.payment_method = PaymentMethodEnum[item.payment_method],
    )

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
