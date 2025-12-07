const { Pool } = require('pg');
const Redis = require('ioredis');
const {
  loadEnvironment,
  getDbConfig,
  getRedisConfig,
  getMissingVars
} = require('../config');

loadEnvironment();

const missingEnvVars = getMissingVars();
const missingEnvMessage = missingEnvVars.length
  ? `Missing environment variables: ${missingEnvVars.join(', ')}`
  : null;

let pool = null;
let redis = null;

if (!missingEnvMessage) {
  pool = new Pool(getDbConfig());
  redis = new Redis(getRedisConfig());
}

module.exports.handler = async (event) => {
  if (missingEnvMessage) {
    console.error(missingEnvMessage);
    throw new Error(missingEnvMessage);
  }

  const id = event.pathParameters.id;

  await pool.query('DELETE FROM messages WHERE id = $1', [id]);
  await redis.del(`msg:${id}`);

  return {
    statusCode: 200,
    body: 'Message deleted.'
  };
};
