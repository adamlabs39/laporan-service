import { z } from "zod";

export default class DashboardValidator {
  static DASHBOARD = z.object({
    startDate: z.string().date().nullable().optional(),
    endDate: z.string().date().nullable().optional(),
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
