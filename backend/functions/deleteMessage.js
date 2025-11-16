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

module.exports.handler = async (event) => {
  const id = event.pathParameters.id;

  await pool.query('DELETE FROM messages WHERE id = $1', [id]);
  await redis.del(`msg:${id}`);

  return {
    statusCode: 200,
    body: 'Message deleted.'
  };
};