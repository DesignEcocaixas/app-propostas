// db.js
const mysql = require('mysql2');

// Pool de conexões (mais seguro e performático)
const pool = mysql.createPool({
    host: 'localhost',      // ou IP do servidor
    user: 'root',           // usuário do mysql
    password: '1234', // senha do mysql
    database: 'sistema_propostas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z'
});

// Promisify (para usar async/await)
const db = pool.promise();

// Log simples de conexão
db.getConnection()
    .then(conn => {
        console.log('✅ MySQL conectado com sucesso');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar no MySQL:', err.message);
    });

module.exports = db;
