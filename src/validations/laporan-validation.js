import { z } from "zod";

export default class LaporanValidator {
  static KUNJUNGAN = z.object({
    name: z.string().optional(),
    payment_method: z.number().int().optional(),
    startDate: z.string().date().nullable().optional(),
    endDate: z.string().date().nullable().optional(),
    limit: z.number().int().positive().default(12),
    offset: z.number().int().min(0).default(0)
  }).refine(data => {
    if (data.startDate && data.endDate) {
      return new Date(startDate) > new Date(endDate)
    }
    return true
  }, {
    message: 'endDate must be greater than startDate',
    path: ['endDate']
  })
}
