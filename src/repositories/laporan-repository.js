import { QueryTypes, } from "sequelize"
import sequelizeInstance from "../config/sequelize-db.js";
import { dateToEpoch } from "../helpers/date-helper.js";

export default class LaporanRepository {
  static async getRekapitulasiKunjungan({ filter = {}, limit, offset }) {
    let query = `
      SELECT TYPE, payment_method, pg.name, COUNT(x.id) FROM 
      (	
      	SELECT 'IGD' AS TYPE, igd.id, igd.payment_method, p.pegawai_uuid, igd.tanggal_daftar FROM instalasi_gawat_darurats igd
      	JOIN practitioner p ON igd.practitioner_uuid = p.uuid
      	WHERE igd.deleted_at IS NULL
      
      	UNION ALL
      
      	SELECT 'Rawat Inap' AS TYPE, ri.id, ri.payment_method, p.pegawai_uuid, ri.tanggal_daftar FROM rawat_inaps ri
      	JOIN practitioner p ON ri.practitioner_uuid = p.uuid
      	WHERE ri.deleted_at IS NULL
      
      	UNION ALL
      
      	SELECT 'Rawat Jalan' AS TYPE, rj.id, rj.payment_method, p.pegawai_uuid, rj.tanggal_daftar FROM rawat_jalans rj
      	JOIN practitioner p ON rj.practitioner_uuid = p.uuid
      	WHERE rj.deleted_at IS NULL
      ) x
      JOIN pegawai pg ON pg.uuid = x.pegawai_uuid
    `

    // Check filter
    const replacements = { limit, offset }
    const whereCondition = []

    if (filter.type && filter.type.length) {
      const typePlaceholder = filter.type.map((_, index) => `:type${index}`).join(', ')
      whereCondition.push(`x.TYPE IN (${typePlaceholder})`)

      filter.type.forEach((type, index) => {
        replacements[`type${index}`] = type
      })
    }

    if (filter.name) {
      whereCondition.push(`pg.name ILIKE :name`)
      replacements.name = `%${filter.name}%`
    }

    if (filter.payment_method) {
      whereCondition.push(`x.payment_method = :payment_method`)
      replacements.payment_method = filter.payment_method
    }

    if (filter.startDate) {
      whereCondition.push(`x.tanggal_daftar >= :startDate`)
      replacements.startDate = dateToEpoch(filter.startDate)
    }

    if (filter.endDate) {
      whereCondition.push(`x.tanggal_daftar <= :endDate`)
      replacements.endDate = dateToEpoch(filter.endDate)
    }

    // Merge all where condition
    if (whereCondition.length > 0) {
      query += 'WHERE ' + whereCondition.join(' AND ')
    }

    query += `
      GROUP BY x.type, x.payment_method, pg.name
    `

    let countQuery = `
      SELECT COUNT(*) FROM (${query}) y
    `

    query += `
      LIMIT :limit OFFSET :offset
    `

    const [results, countResult] = await Promise.all([
      sequelizeInstance.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      }),
      sequelizeInstance.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT
      })
    ])

    return [results, countResult[0].count]
  }

  static async getRekapitulasiTindakan({ filter = {}, limit, offset }) {

  }
}
