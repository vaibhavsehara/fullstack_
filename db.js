// db.js
const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');


// Create a connection pool
const pool = mysql.createPool({
   host: 'localhost',
   user: 'root',
   password: 'TiltedTower',
   database: 'mysql',
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
});

// const poolPromise = mysqlPromise.createPool({
//    host: 'localhost',
//    user: 'root',
//    password: 'TiltedTower',
//    database: 'mysql',
//    waitForConnections: true,
//    connectionLimit: 10,
//    queueLimit: 0
// });

module.exports = pool;

// module.exports = poolPromise;
