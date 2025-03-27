import { number, z } from "zod";

export default class LaporanValidator {
  static #LAPORAN = z.object({
    name: z.string().optional(),
    type: z
      .union([z.string(), z.string().array()])
      .transform((value) => (typeof value === 'string' ? [value] : value))
      .optional(),
    payment_method: z
      .string()
      .regex(/^\d$/, "payment_method must be a number")
      .optional()
      .default("0")
      .transform(Number),
    startDate: z.string().date().nullable().optional(),
    endDate: z.string().date().nullable().optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "limit must be a number")
      .optional()
      .default("12")
      .transform(Number),
    offset: z
      .string()
      .regex(/^\d+$/, "offset must be a number")
      .optional()
      .default("0")
      .transform(Number),
  }).refine(data => {
    if (data.startDate && data.endDate) {
      return new Date(startDate) > new Date(endDate)
    }
    return true
  }, {
    message: 'endDate must be greater than startDate',
    path: ['endDate']
  })

  static KUNJUNGAN = this.#LAPORAN
  static TINDAKAN = this.#LAPORAN
  static LAB = this.#LAPORAN
  static DIAGNOSIS = this.#LAPORAN.and(
    z.object({
      gender: z
        .enum(["0", "1", "2"])
        .optional()
        .default("0")
        .transform((value) => {
          // Transform number value to all|Male|Female
          const numberVal = parseInt(value)
          const map = {
            "0": "all",
            "1": "Male",
            "2": "Female"
          }

          return map[numberVal]
        })
    })
  )
}
