import { DataTypes, QueryInterface, QueryTypes, where, } from "sequelize"
import sequelizeInstance from "../config/sequelize-db.js";
import { dateToEpoch } from "../helpers/date-helper.js";
import BadRequestException from "../exceptions/bad-request-exception.js";
import { getMongoDatabase } from "../config/mongo-db.js";

const PelayananToTableNameEnum = {
  "igd": "instalasi_gawat_darurats",
  "ri": "rawat_inaps",
  "rj": "rawat_jalans"
}

export default class LaporanRepository {
  static async getRekapitulasiKunjungan({ faskes_uuid, filter = {}, limit, offset }) {
    let query = `
      SELECT visit_type, payment_method, pg.name as doctor_name, COUNT(x.id) AS total FROM 
      (	
      	SELECT 'igd' AS visit_type, igd.faskes_uuid, igd.id, igd.payment_method, p.pegawai_uuid, igd.tanggal_daftar FROM instalasi_gawat_darurats igd
      	JOIN practitioner p ON igd.practitioner_uuid = p.uuid
      	WHERE igd.deleted_at IS NULL
      
      	UNION ALL
      
      	SELECT 'rawat_inap' AS visit_type, ri.faskes_uuid, ri.id, ri.payment_method, p.pegawai_uuid, ri.tanggal_daftar FROM rawat_inaps ri
      	JOIN practitioner p ON ri.practitioner_uuid = p.uuid
      	WHERE ri.deleted_at IS NULL
      
      	UNION ALL
      
      	SELECT 'rawat_jalan' AS visit_type, rj.faskes_uuid, rj.id, rj.payment_method, p.pegawai_uuid, rj.tanggal_daftar FROM rawat_jalans rj
      	JOIN practitioner p ON rj.practitioner_uuid = p.uuid
      	WHERE rj.deleted_at IS NULL
      ) x
      JOIN pegawai pg ON pg.uuid = x.pegawai_uuid
    `

    // Check filter
    const replacements = { limit, offset, faskes_uuid }
    const whereCondition = ['x.faskes_uuid = :faskes_uuid']

    if (filter.type && filter.type.length) {
      const typePlaceholder = filter.type.map((_, index) => `:type${index}`).join(', ')
      whereCondition.push(`x.visit_type IN (${typePlaceholder})`)

      filter.type.forEach((type, index) => {
        replacements[`type${index}`] = type
      })
    }

    if (filter.name) {
      whereCondition.push(`pg.name ILIKE :name`)
      replacements.name = `%${filter.name}%`
    }

    if (filter.payment_method || filter.payment_method !== 0) {
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
      GROUP BY x.visit_type, x.payment_method, pg.name
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

    if (!results || !countResult) {
      throw new BadRequestException("Data gagal ditampilkan")
    }

    return [results, countResult[0].count]
  }

  static async getRekapitulasiTindakan({ faskes_uuid, filter = {}, limit, offset }) {
    let query = `
      SELECT ht.nama_tindakan AS "tindakan", ht.pelayanan AS "visit_type", ht.payment_method, COUNT(ht.uuid) AS total
      FROM history_tindakan ht
    `

    // Check filter
    const whereReplacements = [`ht.deleted_at IS NULL`, `ht.faskes_uuid = :faskes_uuid`]
    const replacements = { limit, offset, faskes_uuid }

    if (filter.name) {
      whereReplacements.push(`ht.nama_tindakan ILIKE :name`)
      replacements.name = `%${filter.name}%`
    }

    if (filter.type) {
      const typeReplacements = filter.type.map((_, index) => `:type${index}`).join(', ')
      whereReplacements.push(`ht.pelayanan IN (${typeReplacements})`)

      filter.type.forEach((type, index) => {
        replacements[`type${index}`] = type
      })
    }

    if (filter.payment_method || filter.payment_method !== 0) {
      whereReplacements.push(`ht.payment_method = :payment_method`)
      replacements.payment_method = filter.payment_method
    }

    if (filter.startDate) {
      whereReplacements.push(`ht.tanggal_tindakan >= :startDate`)
      replacements.startDate = dateToEpoch(filter.startDate)
    }

    if (filter.endDate) {
      whereReplacements.push(`ht.tanggal_tindakan <= :endDate`)
      replacements.endDate = dateToEpoch(filter.endDate)
    }

    // Merge all where condition
    if (whereReplacements.length > 0) {
      query += ' WHERE ' + whereReplacements.join(' AND ')
    }

    query += `
      GROUP BY ht.nama_tindakan, ht.pelayanan, ht.payment_method 
    `

    let countQuery = `
      SELECT COUNT(y.tindakan) FROM (${query}) y
    `

    query += `
      LIMIT :limit OFFSET :offset
    `

    const [results, countResult] = await Promise.all([
      sequelizeInstance.query(query, {
        replacements,
        type: QueryTypes.SELECT
      }),
      sequelizeInstance.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT
      })
    ])

    if (!results || !countResult) {
      throw new BadRequestException("Data gagal ditampilkan")
    }

    return [results, countResult[0].count]
  }

  static async getRekapitulasiLab({ faskes_uuid, filter = {}, limit, offset }) {
    let query = `
      SELECT 
          tindakan_data.tindakan,
          ol.pelayanan AS visit_type,
          ol.payment_method,
          COUNT(*) AS total
      FROM order_lab ol
      JOIN order_lab_pemeriksaan olp ON olp.order_lab_uuid = ol.uuid
      JOIN tarif_lab_item tl ON tl.uuid = olp.tarif_lab_item_uuid
      LEFT JOIN LATERAL (
          SELECT ip.name AS tindakan FROM item_pemeriksaan ip WHERE ip.uuid = tl.item_pemeriksaan_uuid
          UNION ALL
          SELECT kp.name AS tindakan FROM kelompok_pemeriksaan kp WHERE kp.uuid = tl.kelompok_pemeriksaan_uuid
      ) AS tindakan_data ON TRUE
    `

    // Check filter
    const whereReplacements = [`ol.deleted_at IS NULL`, `ol.faskes_uuid = :faskes_uuid`]
    const replacements = { limit, offset, faskes_uuid }

    if (filter.name) {
      whereReplacements.push(`tindakan_data ILIKE :name`)
      replacements.name = `%${filter.name}%`
    }

    if (filter.type) {
      const typeReplacements = filter.type.map((_, index) => `:type${index}`).join(', ')
      whereReplacements.push(`ol.pelayanan IN (${typeReplacements})`)

      filter.type.forEach((type, index) => {
        replacements[`type${index}`] = type
      })
    }

    if (filter.payment_method || filter.payment_method !== 0) {
      whereReplacements.push(`ol.payment_method = :payment_method`)
      replacements.payment_method = filter.payment_method
    }

    if (filter.startDate) {
      whereReplacements.push(`ol.startDate >= :startDate`)
      replacements.startDate = dateToEpoch(filter.startDate)
    }

    if (filter.endDate) {
      whereReplacements.push(`ol.endDate >= :endDate`)
      replacements.endDate = dateToEpoch(filter.endDate)
    }

    // Merge all where condition
    if (whereReplacements.length > 0) {
      query += ' WHERE ' + whereReplacements.join(' AND ')
    }

    query += `
      GROUP BY tindakan_data.tindakan, ol.pelayanan, ol.payment_method
    `

    const countQuery = `
      SELECT COUNT (y.tindakan) FROM (${query}) y
    `

    query += `
      LIMIT :limit OFFSET :offset
    `

    const [results, countResult] = await Promise.all([
      sequelizeInstance.query(query, {
        replacements,
        type: QueryTypes.SELECT
      }),
      sequelizeInstance.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT
      })
    ])

    if (!results || !countResult) {
      throw new BadRequestException("Data gagal ditampilkan")
    }
    return [results, countResult[0].count]
  }

  static async getDiagnosisFromMongo({ faskes_uuid, filter = {}, limit, offset }) {
    const db = await getMongoDatabase()
    const collection = await db.collection("rekam_medises")

    const pipeline = [
      {
        $match: {
          $expr: {
            $eq: ['$faskes_uuid', faskes_uuid]
          },
        }
      },
      {
        $group: {
          _id: {
            pelayanan: "$pelayanan", // Group by pelayanan
            diagnosis: "$summary.diagnosis_primer", // Group by diagnosis_primer
          },
          no_pelayanan: { $push: "$no_pelayanan" }, // Push no_pelayanan into an array
        }
      },
      {
        $project: {
          _id: 0, // Exclude the top-level _id
          pelayanan: "$_id.pelayanan", // Include pelayanan as the top-level key
          diagnosis: "$_id.diagnosis", // Include the list of diagnoses and their no_pelayanan
          no_pelayanan: 1,
        }
      },
      {
        $facet: {
          data: [
            { $skip: offset },
            { $limit: limit }
          ],
          totalCount: [{ $count: "total" }]
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray()
    const results = result[0]?.data || []
    const count = result[0]?.totalCount[0]?.total || 0

    // const rekamMedises = await collection.aggregate(pipeline).toArray()
    return [results, count]
  }

  static async getRekapitulasiDiagnosis({ rekamMedises, filter }) {
    let query = []
    const replacements = {}
    let paramCounter = 0

    rekamMedises.forEach((rekamMedis) => {
      let rekamMedisQuery = `
        SELECT '${rekamMedis.pelayanan}' as visit_type, '${rekamMedis.diagnosis}' as diagnosis, x.gender, x.tanggal_daftar, bd.age_year FROM ${PelayananToTableNameEnum[rekamMedis.pelayanan]} x
        JOIN birth_details bd ON x.birth_detail_uuid = bd.uuid 
      `

      // Placeholders for each no_pelayanan
      const placeholders = rekamMedis.no_pelayanan.map(() => `:param_${paramCounter++}`).join(', ')

      rekamMedisQuery += ` WHERE x.no_pelayanan IN (${placeholders})`

      // Replacement for each placeholders
      rekamMedis.no_pelayanan.forEach((data, index) => {
        replacements[`param_${paramCounter - rekamMedis.no_pelayanan.length + index}`] = data
      })

      query.push(rekamMedisQuery)
    })

    let finalQuery = `
      SELECT 
        y.diagnosis,
        y.gender,
        y.visit_type,
        COUNT(CASE WHEN y.age_year BETWEEN 1 AND 4 THEN 1 END) AS "age1-4",
        COUNT(CASE WHEN y.age_year BETWEEN 5 AND 14 THEN 1 END) AS "age5-14",
        COUNT(CASE WHEN y.age_year BETWEEN 15 AND 24 THEN 1 END) AS "age15-24",
        COUNT(CASE WHEN y.age_year BETWEEN 25 AND 44 THEN 1 END) AS "age25-44",
        COUNT(CASE WHEN y.age_year BETWEEN 45 AND 64 THEN 1 END) AS "age45-64",
        COUNT(CASE WHEN y.age_year >= 65 THEN 1 END) AS "age65+"
      FROM (${query.join(' UNION ALL ')}) y
    `

    if (filter.gender) {
      finalQuery += ' WHERE y.gender = :gender'
      replacements.gender = filter.gender
    }

    finalQuery += ' GROUP BY y.diagnosis, y.gender, y.visit_type'

    const results = await sequelizeInstance.query(finalQuery, {
      replacements,
      type: QueryTypes.SELECT
    })

    return results
  }
}
