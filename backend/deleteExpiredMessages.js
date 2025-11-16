const { Pool } = require('pg');
const pool = new Pool();

(async () => {
  const now = new Date();
  await pool.query(
    'DELETE FROM messages WHERE created_at + (expiry || \' seconds\')::interval < NOW()'
  );
  console.log('Expired messages cleaned.');
})();