// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// export default pool;

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Criando a conexão com o banco de dados usando as variáveis de ambiente configuradas
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,         // Nome do host do banco de dados (viaduct.proxy.rlwy.net)
  user: process.env.MYSQLUSER,         // Usuário do banco de dados (root)
  password: process.env.MYSQLPASSWORD, // Senha do banco de dados
  database: process.env.MYSQLDATABASE, // Nome do banco de dados (railway)
  port: Number(process.env.MYSQLPORT), // Convertendo o valor da porta para número
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
