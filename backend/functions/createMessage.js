require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { Pool } = require('pg');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

console.log('Config DB:', {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

// Test connessione
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Errore connessione PostgreSQL:', err);
  } else {
    console.log('PostgreSQL connesso correttamente');
  }
});

const redis = new Redis();

module.exports.handler = async (req, res) => {
  try {
    const { ciphertext, salt, iv, expiry } = req.body;

    if (!ciphertext || !salt || !iv || !expiry) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const createdAt = new Date();

    console.log('Tentativo inserimento messaggio:', { id, expiry });
    
    await pool.query(
      'INSERT INTO messages (id, ciphertext, salt, iv, created_at, expiry) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, ciphertext, salt, iv, createdAt, expiry]
    ).then(() => {
      console.log('Messaggio inserito con successo in PostgreSQL');
    }).catch(err => {
      console.error('Errore inserimento in PostgreSQL:', err);
      throw err;
    });

    await redis.setex(`msg:${id}`, parseInt(expiry), 'active');
    console.log('Chiave Redis impostata:', `msg:${id}`);

    return res.status(200).json({ id });
  } catch (err) {
    console.error('Error creating message:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};