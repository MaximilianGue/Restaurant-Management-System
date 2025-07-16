import { Pool } from 'pg';

const pool = new Pool({
  user: 'maximilianguhring',
  host: 'localhost',
  database: 'goluma',
  password: '', // falls du eins gesetzt hast, sonst leer lassen
  port: 5432,
});

export default pool;
