import LaporanRepository from "../repositories/laporan-repository.js";
import LaporanValidator from "../validations/laporan-validation.js";
import ZodValidator from "../validations/zod-validator.js";

const PaymentMethodEnum = {
  1: 'tunai',
  2: 'asuransi'
}

const VisitTypeEnum = {
  'rj': 'rawat_jalan',
  'ri': 'rawat_inap',
  'igd': 'igd'
}

export default class LaporanService {
  static async getRekapitulasiKunjungan(filter) {
    const { limit, offset, ...validatedFilter } = ZodValidator.validate(LaporanValidator.KUNJUNGAN, filter)
    console.log("Filter : ", validatedFilter, limit, offset)
    const [data, total] = await LaporanRepository.getRekapitulasiKunjungan({ filter: validatedFilter, limit, offset })

    data.map((item) =>
      item.payment_method = PaymentMethodEnum[item.payment_method],
    )

    // Handling pagination
    const pagination = this.paginate({ total: parseInt(total), limit, offset })

    return {
      properties: {
        ...pagination
      },
      payload: data,

    }
  }

  static async getRekapitulasiTindakan(filter) {
    const { limit, offset, ...validatedFilter } = ZodValidator.validate(LaporanValidator.TINDAKAN, filter)
    const [data, total] = await LaporanRepository.getRekapitulasiTindakan({ filter: validatedFilter, limit, offset })

    data.map((item) => {
      item.payment_method = PaymentMethodEnum[item.payment_method]
      item.visit_type = VisitTypeEnum[item.visit_type]
    })

    // Handling pagination
    const pagination = this.paginate({ total: parseInt(total), limit, offset })

    return {
      properties: {
        ...pagination
      },
      payload: data,

    }
  }

  static async getRekapitulasiLab(filter) {
    const { limit, offset, ...validatedFilter } = ZodValidator.validate(LaporanValidator.LAB, filter)
    const [data, total] = await LaporanRepository.getRekapitulasiLab({ filter: validatedFilter, limit, offset })

    data.map((item) => {
      item.payment_method = PaymentMethodEnum[item.payment_method]
    })

    //Handling pagination
    const pagination = this.paginate({ total: parseInt(total), limit, offset })

    return {
      properties: {
        ...pagination
      },
      payload: data
    }
  }

  static paginate({ total, limit, offset }) {
    const page = Math.floor(offset / limit) + 1
    // const totalPages = Math.ceil(total / limit)
    // const nextPage = page < totalPages ? page + 1 : null
    // const prevPage = page > 1 ? page - 1 : null

    return {
      page,
      //total_pages: totalPages,
      total,
      page_size: limit,
      //next_page: nextPage,
      //prev_page: prevPage,
    }
  }
}
