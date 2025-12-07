const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const ENV_FILES = ['.env.local', '.env'];
const REQUIRED_VARS = [
  'PGHOST',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  'PGPORT',
  'REDIS_HOST',
  'REDIS_PORT'
];

let envLoadedFrom;

function loadEnvironment() {
  if (envLoadedFrom !== undefined) {
    return envLoadedFrom;
  }

  for (const filename of ENV_FILES) {
    const filePath = path.resolve(__dirname, '..', filename);
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath });
      envLoadedFrom = filename;
      console.log(`Loaded environment variables from ${filename}`);
      return envLoadedFrom;
    }
  }

  envLoadedFrom = null;
  return envLoadedFrom;
}

function getMissingVars() {
  loadEnvironment();
  return REQUIRED_VARS.filter(name => !process.env[name]);
}

function getDbConfig() {
  loadEnvironment();
  return {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT) || 5432
  };
}

function getRedisConfig() {
  loadEnvironment();
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379
  };
}

module.exports = {
  loadEnvironment,
  getMissingVars,
  getDbConfig,
  getRedisConfig
};
