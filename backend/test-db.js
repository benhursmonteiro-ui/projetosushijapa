import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log('=== TESTE DE CONEXAO COM O BANCO ===');
console.log('DATABASE_URL:', connectionString ? connectionString.replace(/:[^:@]+@/, ':***@') : 'NAO DEFINIDO');

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

try {
  console.log('\nTentando conectar...');
  const result = await pool.query('SELECT NOW() as hora_atual');
  console.log('CONEXAO BEM SUCEDIDA!');
  console.log('Hora do servidor:', result.rows[0].hora_atual);
  
  const usersResult = await pool.query('SELECT count(*) as total FROM users');
  console.log('Tabela users encontrada! Total de usuarios:', usersResult.rows[0].total);
  
  const allUsers = await pool.query('SELECT id, username, role FROM users');
  console.log('\nUsuarios cadastrados:');
  allUsers.rows.forEach(u => console.log('  - ' + u.username + ' (' + u.role + ')'));
  
} catch (err) {
  console.error('\nERRO NA CONEXAO:');
  console.error('Codigo:', err.code);
  console.error('Mensagem:', err.message);
  if (err.code === 'ENOTFOUND') {
    console.error('\nO endereco do banco de dados nao foi encontrado!');
    console.error('Possiveis causas:');
    console.error('1. O nome do projeto no Supabase esta errado');
    console.error('2. O projeto esta PAUSADO no Supabase (projetos gratis pausam apos 1 semana sem uso)');
    console.error('3. A regiao esta errada na URL');
  }
} finally {
  await pool.end();
}
