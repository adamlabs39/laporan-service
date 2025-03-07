import writeXlsxFile from "write-excel-file";
import LaporanRepository from "../repositories/laporan-repository.js";
import LaporanValidator from "../validations/laporan-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import path from "path"
import ExcelJS from "exceljs"

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

  static async exportRekapitulasiKunjungan(filter) {
    const { limit = null, offset = null, ...validatedFilter } = ZodValidator.validate(LaporanValidator.KUNJUNGAN, filter)

    const [data] = await LaporanRepository.getRekapitulasiKunjungan({ filter: validatedFilter, limit, offset })

    data.map((item) => {
      item.payment_method = PaymentMethodEnum[item.payment_method]
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rekapitulasi Kunjungan')

    // Add Title row
    worksheet.mergeCells('A1:E1')
    worksheet.getCell('A1').value = 'JUMLAH KUNJUNGAN BERDASARKAN STATUS RAWAT'
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A1').font = { bold: true, size: 14 }

    worksheet.mergeCells('A2:E2')
    worksheet.getCell('A2').value = `Tanggal: ${validatedFilter.startDate} s/d ${validatedFilter.endDate}`
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A2').font = { bold: true, size: 14 }

    // Manually set headers at row 4
    worksheet.getCell('A4').value = "No."
    worksheet.getCell('B4').value = 'Jenis Kunjungan'
    worksheet.getCell('C4').value = 'Metode Pembayaran'
    worksheet.getCell('D4').value = 'Nama Dokter'
    worksheet.getCell('E4').value = 'Total Pasien'

    // Style the header row
    const headerRow = worksheet.getRow(4)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = { horizontal: 'center' }
    })

    // Set column widths
    worksheet.columns = [
      { key: 'no', width: 5 },
      { key: 'visit_type', width: 15 },
      { key: 'payment_method', width: 20 },
      { key: 'doctor_name', width: 25 },
      { key: 'total', width: 15 }
    ]

    // Add data rows with numbering
    data.forEach((row, index) => {
      worksheet.getCell(`A${index + 5}`).value = index + 1
      worksheet.getCell(`B${index + 5}`).value = row.visit_type
      worksheet.getCell(`C${index + 5}`).value = row.payment_method
      worksheet.getCell(`D${index + 5}`).value = row.doctor_name
      worksheet.getCell(`E${index + 5}`).value = Number(row.total)

      worksheet.getCell(`A${index + 5}`).alignment = { horizontal: 'center' }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }

  static async exportRekapitulasiTindakan(filter) {
    const { limit = null, offset = null, ...validatedFilter } = ZodValidator.validate(LaporanValidator.TINDAKAN, filter)

    const [data] = await LaporanRepository.getRekapitulasiTindakan({ filter: validatedFilter, limit, offset })

    data.map((item) => {
      item.payment_method = PaymentMethodEnum[item.payment_method]
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rekapitulasi Tindakan')

    // Add Title row
    worksheet.mergeCells('A1:E1')
    worksheet.getCell('A1').value = 'REKAPITULASI TINDAKAN'
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A1').font = { bold: true, size: 14 }

    worksheet.mergeCells('A2:E2')
    worksheet.getCell('A2').value = `Tanggal: ${validatedFilter.startDate} s/d ${validatedFilter.endDate}`
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A2').font = { bold: true, size: 14 }

    // Manually set headers at row 4
    worksheet.getCell('A4').value = "No."
    worksheet.getCell('B4').value = 'Tindakan'
    worksheet.getCell('C4').value = 'Jenis Kunjungan'
    worksheet.getCell('D4').value = 'Metode Pembayaran'
    worksheet.getCell('E4').value = 'Total Pasien'

    // Style the header row
    const headerRow = worksheet.getRow(4)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = { horizontal: 'center' }
    })

    // Set column widths
    worksheet.columns = [
      { key: 'no', width: 5 },
      { key: 'tindakan', width: 15 },
      { key: 'visit_type', width: 20 },
      { key: 'payment_method', width: 25 },
      { key: 'total', width: 15 }
    ]

    // Add data rows with numbering
    data.forEach((row, index) => {
      worksheet.getCell(`A${index + 5}`).value = index + 1
      worksheet.getCell(`B${index + 5}`).value = row.tindakan
      worksheet.getCell(`C${index + 5}`).value = row.visit_type
      worksheet.getCell(`D${index + 5}`).value = row.payment_method
      worksheet.getCell(`E${index + 5}`).value = Number(row.total)

      worksheet.getCell(`A${index + 5}`).alignment = { horizontal: 'center' }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }

  static async exportRekapitulasiLab(filter) {
    const { limit = null, offset = null, ...validatedFilter } = ZodValidator.validate(LaporanValidator.LAB, filter)

    const [data] = await LaporanRepository.getRekapitulasiLab({ filter: validatedFilter, limit, offset })

    data.map((item) => {
      item.payment_method = PaymentMethodEnum[item.payment_method]
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rekapitulasi Pemeriksaan Lab')

    // Add Title row
    worksheet.mergeCells('A1:E1')
    worksheet.getCell('A1').value = 'REKAPITULASI PEMERIKSAAN LAB'
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A1').font = { bold: true, size: 14 }

    worksheet.mergeCells('A2:E2')
    worksheet.getCell('A2').value = `Tanggal: ${validatedFilter.startDate} s/d ${validatedFilter.endDate}`
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A2').font = { bold: true, size: 14 }

    // Manually set headers at row 4
    worksheet.getCell('A4').value = "No."
    worksheet.getCell('B4').value = 'Tindakan'
    worksheet.getCell('C4').value = 'Jenis Kunjungan'
    worksheet.getCell('D4').value = 'Metode Pembayaran'
    worksheet.getCell('E4').value = 'Total Pasien'

    // Style the header row
    const headerRow = worksheet.getRow(4)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = { horizontal: 'center' }
    })

    // Set column widths
    worksheet.columns = [
      { key: 'no', width: 5 },
      { key: 'tindakan', width: 15 },
      { key: 'visit_type', width: 20 },
      { key: 'payment_method', width: 25 },
      { key: 'total', width: 15 }
    ]

    // Add data rows with numbering
    data.forEach((row, index) => {
      worksheet.getCell(`A${index + 5}`).value = index + 1
      worksheet.getCell(`B${index + 5}`).value = row.tindakan
      worksheet.getCell(`C${index + 5}`).value = row.visit_type
      worksheet.getCell(`D${index + 5}`).value = row.payment_method
      worksheet.getCell(`E${index + 5}`).value = Number(row.total)

      worksheet.getCell(`A${index + 5}`).alignment = { horizontal: 'center' }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
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
