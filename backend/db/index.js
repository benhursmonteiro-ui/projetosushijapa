import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('sua-senha-aqui')) {
  console.warn(
    'AVISO: DATABASE_URL não configurado ou contém valores padrão. A conexão com o banco de dados PostgreSQL falhará.'
  );
}

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

export default {
  query: (text, params) => pool.query(text, params),
  pool
};
