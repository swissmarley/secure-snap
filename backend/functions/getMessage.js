require('dotenv').config({ path: '../.env.local' });
const { Pool } = require('pg');
const Redis = require('ioredis');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});
const redis = new Redis();

module.exports.handler = async (req, res) => {
  try {
    const id = req.params.id;

    // Check Redis for expiration
    const active = await redis.get(`msg:${id}`);
    if (!active) {
      return res.status(404).json({ error: 'Message not found or expired' });
    }

    // Fetch from Postgres
    const result = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const { ciphertext, salt, iv } = result.rows[0];

    // Auto-delete after first read
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    await redis.del(`msg:${id}`);

    return res.status(200).json({ ciphertext, salt, iv });
  } catch (err) {
    console.error('Error retrieving message:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};