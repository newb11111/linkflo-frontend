const { Pool } = require('pg')
if (!process.env.DATABASE_URL) console.warn('DATABASE_URL is missing')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
async function q(text, params = []) { return pool.query(text, params) }
module.exports = { pool, q }
